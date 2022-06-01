<template>
  <section class="verify-details-wrap g-panel-container" v-loading="loading">
    <div class="verify-details-header" v-if="inspect">
      <div>
        <span style="font-size: 14px">{{ inspect.name }}</span>
        <span class="font-color-linfo ml-3">{{ typeMap[type] }}</span>
        <ElButton type="text" class="ml-8" :disabled="verifyAgainDisabled" @click.prevent.stop="verifyAgain()">{{
          $t('verify_operation_verify_again')
        }}</ElButton>
        <span class="button-icon">
          <VIcon class="color-disable" size="14">info</VIcon>
          <span class="button-icon__info ml-2">{{ $t('verify_operation_verify_again_info') }}</span>
        </span>
      </div>
      <div v-if="inspect.inspectMethod !== 'row_count'">
        <div class="flex align-items-center">
          <div v-if="resultInfo.parentId" class="color-info flex align-items-center" style="font-size: 12px">
            {{ $t('verify_last_start_time') }}: {{ formatTime(inspect.lastStartTime) }}
            <ElLink class="ml-5" type="primary" @click="toDiffHistory">{{
              $t('verify_button_diff_task_history')
            }}</ElLink>
          </div>
          <div
            v-if="
              inspect.result !== 'passed' &&
              !['running', 'scheduling'].includes(inspect.status) &&
              !(inspect.status === 'error' && !resultInfo.parentId)
            "
            class="flex align-items-center ml-4"
          >
            <VButton type="primary" @click="diffInspect">{{ $t('verify_button_diff_verify') }}</VButton>
            <ElTooltip effect="dark" placement="top">
              <div slot="content" style="width: 232px">
                {{ $t('verify_button_diff_verify_tips') }}
              </div>
              <VIcon class="ml-2 color-info" size="14">warning-circle</VIcon>
            </ElTooltip>
          </div>
        </div>
      </div>
    </div>
    <div v-if="errorMsg && type === 'row_count'" class="error-tips mt-4 px-4">
      <VIcon class="color-danger">error</VIcon>
      <span class="mx-2 text-break" :class="{ ellipsis: !expandErrorMessage }" style="flex: 1">{{ errorMsg }}</span>
      <span>
        <ElLink type="danger" @click="expandErrorMessage = !expandErrorMessage">{{
          expandErrorMessage ? $t('verify_Details_shouQi') : $t('verify_Details_zhanKai')
        }}</ElLink>
        <VIcon class="ml-2 color-info" size="12" @click="errorMsg = ''">close</VIcon>
      </span>
    </div>
    <div
      class="result-table mt-4"
      v-if="inspect"
      v-loading="['running', 'scheduling'].includes(inspect.status)"
      :element-loading-text="$t('verify_checking')"
    >
      <template v-if="!['running', 'scheduling'].includes(inspect.status)">
        <ResultTable
          ref="singleTable"
          :type="type"
          :firstCheckId="resultInfo.firstCheckId"
          :data="tableData"
          @row-click="rowClick"
          @verify-again="verifyAgain"
        ></ResultTable>
        <ResultView v-if="type !== 'row_count'" ref="resultView" :remoteMethod="getResultData"></ResultView>
      </template>
    </div>
  </section>
</template>
<style lang="scss">
.verify-details-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.verify-details-header {
  display: flex;
  justify-content: space-between;
}
.button-icon {
  margin-left: 12px;
  .button-icon__info {
    display: none;
  }
  &:hover {
    .button-icon__info {
      display: inline;
    }
  }
}
.error-tips {
  padding: 6px 0;
  display: flex;
  justify-content: space-between;
  background: rgba(219, 80, 80, 0.07);
  border-radius: 4px;
  border: 1px solid #db5050;
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
import VIcon from '@/components/VIcon'
import timeFunction from '@/mixins/timeFunction'

export default {
  components: { ResultTable, ResultView, VIcon },
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
      taskId: null,
      expandErrorMessage: false
    }
  },
  computed: {
    type() {
      return this.inspect?.inspectMethod || ''
    },
    tableData() {
      return (
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.resultInfo.stats?.sort((a, b) => {
          let value1 = a.taskId
          let value2 = b.taskId
          return value1.localeCompare(value2)
        }) || []
      )
    },
    verifyAgainDisabled() {
      return this.tableData.every(t => t.result === 'passed')
    }
  },
  created() {
    this.getData()
    setInterval(() => {
      if (['running', 'scheduling'].includes(this.inspect?.status)) {
        this.getData()
      }
    }, 10000)
  },
  methods: {
    getData() {
      this.loading = true
      this.$axios
        .get('tm/api/Inspects/findById', {
          params: {
            filter: JSON.stringify({
              where: {
                id: this.$route.params.id
              }
            })
          }
        })
        .then(data => {
          let inspect = data
          let inspectResult = inspect.InspectResult
          this.inspect = inspect
          this.$axios
            .get('tm/api/InspectResults/findById', {
              params: {
                filter: JSON.stringify({
                  where: {
                    id: inspectResult?.id
                  }
                })
              }
            })
            .then(data => {
              let result = data
              if (result) {
                this.resultInfo = result
                let stats = result.stats
                if (stats.length) {
                  this.errorMsg = result.status === 'error' ? result.errorMsg : undefined
                  let firstStats = this.tableData?.[0] || {}
                  this.taskId = firstStats.taskId
                  this.$nextTick(() => {
                    this.$refs.resultView?.fetch(1)
                    if (this.type !== 'row_count') {
                      this.$refs.singleTable?.setCurrentRow(firstStats)
                    }
                  })
                }
              }
            })
            .finally(() => {
              this.loading = false
            })
        })
    },
    getResultData({ current, size }) {
      let taskId = this.taskId
      let task = this.inspect.tasks?.find(item => item.taskId === taskId)
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
    diffInspect() {
      let firstCheckId = this.resultInfo.firstCheckId
      if (!firstCheckId) {
        return this.$message.error(this.$t('verify_message_old_data_not_support'))
      }
      let inspect = this.inspect
      let keep = inspect?.limit?.keep || 0
      let totalFailed = inspect?.difference_number || 0
      if (keep < totalFailed) {
        return this.$message.error(this.$t('verify_message_out_of_limit'))
      }
      this.$axios
        .post(
          'tm/api/Inspects/update?where=' +
            encodeURIComponent(
              JSON.stringify({
                id: this.inspect.id
              })
            ),
          { status: 'scheduling', ping_time: 0, scheduleTimes: 0, byFirstCheckId: firstCheckId }
        )
        .then(() => {
          this.$message.success(this.$t('dataVerification_startVerify'))
          this.getData()
        })
    },
    rowClick(row) {
      this.taskId = row.taskId
      this.$refs.resultView?.fetch(1)
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
    verifyAgain(ids = []) {
      let taskIds = ids
      let getMultipleSelection = this.$refs.singleTable.getMultipleSelection()
      if (ids.length === 0 && getMultipleSelection.length) {
        taskIds = getMultipleSelection.map(t => t.taskId)
      }
      this.$axios
        .post(
          'tm/api/Inspects/update?where=' +
            encodeURIComponent(
              JSON.stringify({
                id: this.inspect.id
              })
            ),
          {
            status: 'scheduling',
            inspectResultId: this.resultInfo.id,
            taskIds
          }
        )
        .then(() => {
          this.getData()
        })
    }
  }
}
</script>
