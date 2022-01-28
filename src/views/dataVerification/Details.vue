<template>
  <section class="verification-details-wrap" v-loading="loading">
    <div class="panel-main" style="padding: 0 20px" v-if="inspect">
      <div class="main main-border">
        <div class="title mt-5">{{ inspect.name }}</div>
        <div class="text">
          {{ typeMap[type] }}
        </div>
        <div class="error-band" style="width: 96.5%" v-if="errorMsg && type === 'row_count'">
          <i class="iconfont icon-warning-circle"></i>
          <span>{{ errorMsg }}</span>
        </div>
        <div
          class="flex align-items-center justify-content-sm-between mt-2"
          v-else-if="['field', 'jointField'].includes(inspect.inspectMethod)"
        >
          <div class="flex align-items-center">
            <ElButton v-if="['running', 'scheduling'].includes(inspect.status)" size="mini">{{
              $t('verify_button_diff_verify_running')
            }}</ElButton>
            <template v-if="inspect.result !== 'passed' && !(inspect.status === 'error' && !resultInfo.parentId)">
              <ElButton
                v-if="!['running', 'scheduling'].includes(inspect.status)"
                size="mini"
                type="primary"
                @click="diffInspect"
                >{{ $t('verify_button_diff_verify') }}</ElButton
              >

              <el-tooltip effect="dark" placement="top">
                <div slot="content" style="width: 232px">
                  {{ $t('verify_button_diff_verify_tips') }}
                </div>
                <i class="el-icon-warning-outline ml-2 color-info"></i>
              </el-tooltip>
            </template>
          </div>
          <div v-if="resultInfo.parentId" class="color-info" style="font-size: 12px">
            {{ $t('verify_last_start_time') }}: {{ $moment(inspect.lastStartTime).format('YYYY-MM-DD HH:mm:ss') }}
            <ElLink class="ml-5" type="primary" @click="toDiffHistory">{{
              $t('verify_button_diff_task_history')
            }}</ElLink>
          </div>
        </div>
        <ResultTable
          v-if="!['running', 'scheduling'].includes(inspect.status)"
          ref="singleTable"
          :type="type"
          :data="tableData"
          :verify-type="verifyType"
          @row-click="rowClick"
        ></ResultTable>
      </div>
    </div>
    <ResultView
      v-if="type !== 'row_count' && !['running', 'scheduling'].includes(inspect.status)"
      ref="resultView"
      :verify-type="verifyType"
      :remoteMethod="getResultData"
    ></ResultView>
  </section>
</template>
<style lang="scss">
$margin: 10px;
.verification-details-wrap {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .panel-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    &.panel-box {
      margin-bottom: 10px;
      border-left: 1px solid #dedee4;
      border-bottom: 1px solid #dedee4;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .title {
        font-weight: bold;
        color: #409eff;
      }
      .text {
        margin-top: 6px;
        color: #666;
        font-size: 12px;
      }
      .error-band {
        background: #fdf6ec;
        border: 1px solid #f8e2c0;
        color: #e6a23c;
        margin: 10px;
        line-height: 20px;
        max-height: 160px;
        text-overflow: ellipsis;
        overflow-y: auto;
        font-size: 12px;
        padding: 8px;
      }
    }
  }
}
</style>
<script>
import ResultTable from './old/result-table'
import ResultView from './old/result-view'
export default {
  components: { ResultTable, ResultView },
  data() {
    return {
      loading: false,
      typeMap: {
        row_count: this.$t('dataVerification.rowVerify'),
        field: this.$t('dataVerification.contentVerify'),
        jointField: this.$t('dataVerification.jointVerify')
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
      this.$api('Inspects')
        .get({
          filter: JSON.stringify({
            where: {
              id: this.$route.params.id
            }
          })
        })
        .then(res => {
          let inspect = res.data[0]
          let inspectResult = inspect.InspectResult
          this.inspect = inspect
          this.$api('InspectResults')
            .get({
              filter: JSON.stringify({
                where: {
                  id: inspectResult.id
                }
              })
            })
            .then(res => {
              let result = res.data[0]
              if (result) {
                if (result) {
                  this.resultInfo = result
                  let stats = result.stats
                  if (stats.length) {
                    this.errorMsg = result.status === 'error' ? result.errorMsg : undefined
                    this.taskId = stats[0].taskId
                    this.$nextTick(() => {
                      this.$refs?.resultView.fetch(1)
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
          where: {
            taskId,
            inspect_id: { regexp: `^${this.inspect.id}$` },
            inspectResultId: { regexp: `^${this.resultInfo.id}$` }
          },
          order: 'createTime DESC',
          limit: showAdvancedVerification ? 1 : size,
          skip: (current - 1) * (showAdvancedVerification ? 1 : size)
        }
        return Promise.all([
          this.$api('InspectDetails').count(where),
          this.$api('InspectDetails').get({
            filter: JSON.stringify(where)
          })
        ]).then(([countRes, res]) => {
          let resultList = []
          if (res.data) {
            if (showAdvancedVerification) {
              resultList = res.data || []
            } else {
              resultList = this.handleOtherVerify(res.data)
            }
          }
          return {
            showAdvancedVerification, // 是否高级校验
            total: countRes.data.count, // 总条数
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
      this.$api('Inspects')
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
