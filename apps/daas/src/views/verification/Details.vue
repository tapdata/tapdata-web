<template>
  <section class="verify-details-wrap section-wrap" v-loading="loading">
    <div class="section-wrap-box">
      <div class="verify-details-header" v-if="inspect">
        <div>
          <span style="font-size: 14px">{{ inspect.name }}</span>
          <span class="font-color-linfo ml-3">{{ typeMap[type] }}</span>
        </div>
        <div v-if="inspect.inspectMethod !== 'row_count'">
          <div class="flex align-items-center">
            <div v-if="resultInfo.parentId" class="color-info flex align-items-center" style="font-size: 12px">
              {{ $t('verify_last_start_time') }}: {{ inspect.lastStartTimeFmt }}
              <ElLink class="ml-5" type="primary" @click="toDiffHistory">{{
                $t('verify_button_diff_task_history')
              }}</ElLink>
            </div>
            <!-- <div
              v-if="
                inspect.result !== 'passed' &&
                !['running', 'scheduling'].includes(inspect.status) &&
                !(inspect.status === 'error' && !resultInfo.parentId)
              "
              class="flex align-items-center ml-4"
            >
              <ElButton type="primary" @click="diffInspect">{{ $t('verify_button_diff_verify') }}</ElButton>
              <ElTooltip effect="dark" placement="top">
                <div slot="content" style="width: 232px">
                  {{ $t('verify_button_diff_verify_tips') }}
                </div>
                <VIcon class="ml-2 color-info" size="14">warning-circle</VIcon>
              </ElTooltip>
            </div> -->
          </div>
        </div>
      </div>
      <div v-if="errorMsg && type === 'row_count'" class="error-tips mt-4 px-4">
        <VIcon class="color-danger">error</VIcon>
        <span class="mx-2 text-break" :class="{ ellipsis: !expandErrorMessage }" style="flex: 1">{{ errorMsg }}</span>
        <span>
          <ElLink type="danger" @click="expandErrorMessage = !expandErrorMessage">{{
            expandErrorMessage ? '收起' : '展开'
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
          <ResultTable ref="singleTable" :type="type" :data="tableData" @row-click="rowClick"></ResultTable>
          <ResultView v-if="type !== 'row_count'" ref="resultView" :remoteMethod="getResultData"></ResultView>
        </template>
      </div>
    </div>
  </section>
</template>
<style lang="scss">
.verify-details-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .section-wrap-box {
    padding: 20px;
  }
}
.verify-details-header {
  display: flex;
  justify-content: space-between;
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
import dayjs from 'dayjs'
import { inspectDetailsApi, inspectResultsApi, inspectApi } from '@tap/api'

export default {
  components: { ResultTable, ResultView },
  data() {
    return {
      loading: false,
      typeMap: {
        row_count: this.$t('dataVerification.rowVerify'),
        field: this.$t('dataVerification.contentVerify'),
        jointField: this.$t('dataVerification.jointVerify'),
        cdcCount: '动态校验'
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
      return this.resultInfo.stats || []
    },
    verifyType() {
      return this.resultInfo?.inspect?.inspectMethod
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
      inspectApi
        .get({
          filter: JSON.stringify({
            where: {
              id: this.$route.params.id
            }
          })
        })
        .then(res => {
          let inspect = res?.items[0]
          let inspectResult = inspect.InspectResult
          inspect.lastStartTime = dayjs(inspect.lastStartTime).format('YYYY-MM-DD HH:mm:ss')
          this.inspect = inspect
          inspectResultsApi
            .get({
              filter: JSON.stringify({
                where: {
                  id: inspectResult.id
                }
              })
            })
            .then(res => {
              let result = res?.items[0]
              if (result) {
                if (result) {
                  this.resultInfo = result
                  let stats = result.stats
                  if (stats.length) {
                    this.errorMsg = result.status === 'error' ? result.errorMsg : undefined
                    this.taskId = stats[0].taskId
                    this.$nextTick(() => {
                      this.$refs.resultView?.fetch(1)
                      if (this.type !== 'row_count') {
                        this.$refs.singleTable?.setCurrentRow(stats[0])
                      }
                    })
                  }
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
        return inspectDetailsApi
          .get({
            filter: JSON.stringify(filter)
          })
          .then(res => {
            let data = res
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
      inspectApi
        .update(
          {
            id: this.inspect.id
          },
          { status: 'scheduling', ping_time: 0, scheduleTimes: 0, byFirstCheckId: firstCheckId }
        )
        .then(() => {
          this.$message.success(this.$t('dataVerification.startVerify'))
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
      let url = ''
      let route = this.$router.resolve({
        name: 'VerifyDiffHistory',
        params: {
          id: this.resultInfo.firstCheckId
        }
      })
      url = route.href
      window.open(url, '_blank')
    }
  }
}
</script>
