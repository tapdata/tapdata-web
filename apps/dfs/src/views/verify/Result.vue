<template>
  <section class="verify-result-wrap g-panel-container" v-loading="loading">
    <div class="verify-result-header" v-if="inspect">
      <div>
        <span style="font-size: 14px">{{ inspect.name }}</span>
        <span class="font-color-linfo ml-3">{{ typeMap[type] }}</span>
      </div>
      <div v-if="inspect.inspectMethod !== 'row_count'">
        <div class="flex align-items-center">
          <div
            v-if="resultInfo.parentId && $route.name === 'VerifyResult'"
            class="color-info flex align-items-center"
            style="font-size: 12px"
          >
            {{ $t('verify_last_start_time') }}: {{ formatTime(inspect.lastStartTime) }}
            <ElLink class="ml-5" type="primary" @click="toDiffHistory">{{
              $t('verify_button_diff_task_history')
            }}</ElLink>
          </div>
        </div>
      </div>
    </div>
    <div v-if="errorMsg && type === 'row_count'" class="error-tips mt-4 px-4">
      <VIcon class="color-danger">error</VIcon>
      <span>
        <ElLink type="danger" @click="showErrorMessage">{{ this.$t('verify_see_details') }}</ElLink>
        <VIcon class="ml-2 color-info" size="12">close</VIcon>
      </span>
    </div>
    <div class="result-table mt-4" v-if="inspect && !['running', 'scheduling'].includes(inspect.status)">
      <ResultTable
        ref="singleTable"
        :type="type"
        :firstCheckId="resultInfo.firstCheckId"
        :data="tableData"
        @row-click="rowClick"
      ></ResultTable>
      <ResultView v-if="type !== 'row_count'" ref="resultView" :remoteMethod="getResultData"></ResultView>
    </div>
  </section>
</template>
<style lang="scss">
.verify-result-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.verify-result-header {
  display: flex;
  justify-content: space-between;
}
.error-tips {
  background: #fdf6ec;
  border: 1px solid #f8e2c0;
  color: #e6a23c;
  line-height: 20px;
  max-height: 160px;
  text-overflow: ellipsis;
  overflow-y: auto;
  font-size: 12px;
  padding: 8px;
}
.result-table {
  flex: 1;
  display: flex;
  overflow: auto;
}
</style>
<script>
import ResultTable from './ResultTable'
import ResultView from './ResultView'
import timeFunction from '@/mixins/timeFunction'

export default {
  components: { ResultTable, ResultView },
  mixins: [timeFunction],
  data() {
    return {
      loading: false,
      typeMap: {
        row_count: this.$t('dataVerification_rowVerify'),
        field: this.$t('dataVerification_contentVerify'),
        jointField: this.$t('dataVerification_jointVerify')
      },
      inspect: {},
      resultInfo: {},
      errorMsg: '',
      taskId: null
    }
  },
  computed: {
    type() {
      return this.inspect?.inspectMethod || ''
    },
    tableData() {
      let list = this.resultInfo.stats || []
      // if (this.$route.name === 'VerifyDiffDetails') {
      //   list = list.filter(item => {
      //     // return item.source_total > 0
      //     return item.source_total !== item.target_total
      //   })
      // }
      return list
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      this.$axios
        .get('tm/api/InspectResults', {
          params: {
            filter: JSON.stringify({
              where: {
                id: this.$route.params.id
              }
            })
          }
        })
        .then(data => {
          let result = data.items[0]
          if (result) {
            this.resultInfo = result
            let stats = result.stats
            let inspect = result.inspect
            inspect.status = result.status
            this.inspect = inspect
            if (stats.length) {
              this.errorMsg = result.status === 'error' ? result.errorMsg : undefined
              this.taskId = stats[0].taskId
              this.$refs.resultView.fetch(1)
              if (this.type !== 'row_count') {
                this.$nextTick(() => {
                  this.$refs.singleTable?.setCurrentRow(stats[0])
                })
              }
            }
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getResultData({ current, size }) {
      let taskId = this.taskId
      let task = this.tableData?.find(item => item.taskId === taskId)
      if (task) {
        let showAdvancedVerification = task.showAdvancedVerification
        let statsInfo = this.tableData.find(item => item.taskId === this.taskId)
        let where = {
          taskId,
          inspect_id: this.inspect.id,
          inspectResultId: this.resultInfo.id
        }
        let filter = {
          where,
          order: 'createTime DESC',
          limit: showAdvancedVerification ? 1 : size,
          skip: (current - 1) * (showAdvancedVerification ? 1 : size)
        }
        return this.$axios
          .get('tm/api/InspectDetails?filter=' + encodeURIComponent(JSON.stringify(filter)))
          .then(data => {
            let resultList = []
            if (data?.items) {
              if (showAdvancedVerification) {
                resultList = data.items || []
              } else {
                resultList = this.handleOtherVerify(data.items)
              }
            }
            return {
              showAdvancedVerification, // 是否高级校验
              total: data.total, // 总条数
              statsInfo, // 结果信息
              resultList // 结果详情
            }
          })
      }
      return Promise.reject()
    },
    rowClick(row) {
      this.taskId = row.taskId
      this.$refs.resultView.fetch(1)
    },
    handleOtherVerify(data) {
      if (data.length === 0) {
        return
      }
      data.map(item => {
        let source = item.source || {}
        let target = item.target || {}
        let sourceKeys = Object.keys(source)
        let targetKeys = Object.keys(target)
        let key = Array.from(new Set([...sourceKeys, ...targetKeys])) //找出所有的key的并集
        let message = item.message || ''
        let diffFields = []
        if (message.includes('Different fields')) {
          diffFields = message.split(':')[1].split(',')
        }
        key.forEach(i => {
          let sourceValue = ''
          let targetValue = ''
          if (sourceKeys.filter(v => i === v)) {
            sourceValue = source[i]
          } else {
            sourceValue = ''
          }
          if (targetKeys.filter(v => i === v)) {
            targetValue = target[i]
          } else {
            targetValue = ''
          }
          let isDiff = diffFields.length ? diffFields.includes(i) : sourceValue !== targetValue
          let node = {
            type: item.type,
            red: isDiff,
            source: {
              key: i,
              value: sourceValue
            },
            target: {
              key: i,
              value: targetValue
            }
          }
          item['details'] = item['details'] || []
          item['details'].push(node)
        })
      })
      return data
    },
    toDiffHistory() {
      this.$router.push({
        name: 'VerifyDiffHistory',
        params: {
          id: this.resultInfo.firstCheckId
        }
      })
    },
    showErrorMessage() {
      this.$alert(this.errorMsg)
    }
  }
}
</script>
