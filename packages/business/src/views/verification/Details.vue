<script>
import { inspectApi, inspectResultsApi } from '@tap/api'
import { checkEllipsisActive } from '@tap/shared'
import Cookie from '@tap/shared/src/cookie'
import axios from 'axios'
import dayjs from 'dayjs'
import { ErrorMessage } from '../../components/error-message'
import PageContainer from '../../components/PageContainer.vue'
import DataCorrectionDialog from './components/DataCorrectionDialog'
import { inspectMethod as typeMap } from './const'
import mixins from './mixins'
import ResultTable from './ResultTable.vue'
import ResultView from './ResultView.vue'

export default {
  components: {
    ResultTable,
    ResultView,
    DataCorrectionDialog,
    PageContainer,
  },
  mixins: [mixins],
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      loading: false,
      typeMap,
      inspect: {},
      resultInfo: {},
      errorMsg: '',
      taskId: null,
      expandErrorMessage: false,
      resultFilter: '',
      dataCorrection: {
        visible: false,
      },
      hasMoreErrorMsg: false,
      exportSqlLoading: false,
      filterOptions: [
        {
          label: this.$t('public_all'),
          value: '',
        },
        {
          label: this.$t('packages_business_verification_consistent'),
          value: 'passed',
        },
        {
          label: this.$t('packages_business_verification_inconsistent'),
          value: 'failed',
        },
      ],
    }
  },
  computed: {
    type() {
      return this.inspect?.inspectMethod || ''
    },
    tableData() {
      const data = this.resultInfo.stats || []
      if (!this.resultFilter) {
        return data
      }
      return data.filter((item) => item.result === this.resultFilter)
    },
    verifyType() {
      return this.resultInfo?.inspect?.inspectMethod
    },
    isCountOrHash() {
      return (
        this.inspect?.inspectMethod === 'row_count' ||
        this.inspect?.inspectMethod === 'hash'
      )
    },
    canStart() {
      return this.inspect.permissionActions?.includes('Start')
    },
    showDataCorrection() {
      return (
        (this.type === 'field' || this.type === 'jointField') &&
        this.inspect.flowId &&
        this.inspect.status === 'done' &&
        this.inspect.result === 'failed'
      )
    },
    errorSummary() {
      if (this.errorMsg) {
        return this.errorMsg.split('\n').shift()
      }
    },
    showCorrection() {
      return this.inspect.canRecovery && this.canStart
    },
    showDiffInspect() {
      return (
        this.inspect.result !== 'passed' &&
        !['running', 'scheduling'].includes(this.inspect.status) &&
        (this.inspect.status !== 'error' || this.resultInfo.parentId) &&
        this.canStart
      )
    },
    resultStatus() {
      return this.resultInfo.status
    },
  },
  created() {
    this.getData()
    this.interval = setInterval(() => {
      if (['running', 'scheduling'].includes(this.inspect?.status)) {
        this.getData(false)
      }
    }, 10000)
  },
  beforeUnmount() {
    clearInterval(this.interval)
    clearTimeout(this.pollingTimer)
  },
  methods: {
    ErrorMessage,
    async fetchResultStatus() {
      await inspectResultsApi
        .get({
          filter: JSON.stringify({
            where: {
              id: this.resultInfo.id,
            },
          }),
        })
        .then((data) => {
          const result = data?.items?.[0]
          if (result) {
            this.resultInfo.status = result.status
          }
        })
    },
    getData(showLoading = true) {
      if (showLoading) {
        this.loading = true
      }
      inspectApi
        .get({
          filter: JSON.stringify({
            where: {
              id: this.$route.params.id,
            },
          }),
        })
        .then((data) => {
          const inspect = data?.items?.[0] || {}
          const inspectResult = inspect.InspectResult
          inspect.lastStartTime = dayjs(inspect.lastStartTime).format(
            'YYYY-MM-DD HH:mm:ss',
          )
          this.inspect = inspect
          inspectResultsApi
            .get({
              filter: JSON.stringify({
                where: {
                  id: inspectResult.id,
                },
              }),
            })
            .then((data) => {
              const result = data?.items?.[0]
              if (result) {
                this.resultInfo = result
                const stats = result.stats
                if (stats.length) {
                  this.errorMsg =
                    result.status === 'error' ? result.errorMsg : undefined

                  if (import.meta.env.VUE_APP_KEYWORD && this.errorMsg) {
                    this.errorMsg = this.errorMsg.replaceAll(
                      /tapdata\s?/gi,
                      import.meta.env.VUE_APP_KEYWORD,
                    )
                  }

                  this.checkErrorMsg()
                  if (!this.taskId) {
                    this.taskId = stats[0].taskId
                  }
                  this.$nextTick(() => {
                    this.$refs.resultView?.fetch(1)
                    if (!this.isCountOrHash && showLoading) {
                      this.$refs.singleTable?.setCurrentRow(stats[0])
                    }
                    if (this.taskId) {
                      this.$refs.singleTable?.setCurrentRow(
                        stats.find((t) => t.taskId === this.taskId),
                      )
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
    diffInspect() {
      const firstCheckId = this.resultInfo.firstCheckId
      if (!firstCheckId) {
        return this.$message.error(
          this.$t(
            'packages_business_verification_message_old_data_not_support',
          ),
        )
      }
      // let inspect = this.inspect
      // let keep = inspect?.limit?.keep || 0
      // let totalFailed = inspect?.difference_number || 0
      // if (keep < totalFailed) {
      //   this.$message.warning(this.$t('packages_business_verification_message_out_of_limit'))
      // }
      inspectApi
        .update(
          {
            id: this.inspect.id,
          },
          {
            status: 'scheduling',
            ping_time: 0,
            scheduleTimes: 0,
            byFirstCheckId: firstCheckId,
          },
        )
        .then(() => {
          this.$message.success(
            this.$t('packages_business_verification_startVerify'),
          )
          this.getData()
        })
    },

    handleCorrection() {
      this.dataCorrection.visible = true
    },

    async handleExportSql() {
      this.exportSqlLoading = true

      try {
        await inspectApi.exportSql(this.inspect.id, this.resultInfo.id)
        this.$message.success(this.$t('public_start_generate_recovery_sql'))

        this.startPolling()
      } catch {
        this.exportSqlLoading = false
      }
    },

    async startPolling() {
      clearTimeout(this.pollingTimer)

      await this.fetchResultStatus()

      if (this.resultInfo.status !== 'exported') {
        this.pollingTimer = setTimeout(() => {
          this.startPolling()
        }, 5000)
      } else {
        this.exportSqlLoading = false
        this.$message.success(this.$t('public_generate_recovery_sql_success'))
      }
    },

    handleDownloadSql() {
      let url =
        `${axios.defaults.baseURL}/api/proxy/exportRecoverySql?inspectId=${this.inspect.id}&inspectResultId=${this.resultInfo.id}`.replace(
          '//',
          '/',
        )

      if (this.isDaas) {
        const accessToken = Cookie.get('access_token')
        url += `&access_token=${accessToken}`
      } else if (TAP_ACCESS_TOKEN) {
        url += `&__token=${TAP_ACCESS_TOKEN}`
      }

      window.open(url)
    },

    onStarted() {
      this.dataCorrection.visible = false
      this.getData()
    },

    checkErrorMsg() {
      this.$nextTick(() => {
        const dom = this.$refs.errorSummary
        this.hasMoreErrorMsg = dom
          ? this.errorMsg.split('\n').length > 1 || checkEllipsisActive(dom)
          : false
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #title>
      <span class="fs-5 font-color-dark">{{ inspect.name }}</span>
      <ElTag type="info" class="ml-3">{{ typeMap[type] }}</ElTag>
    </template>

    <template v-if="!isCountOrHash" #actions>
      <div class="flex align-items-center ml-auto">
        <div
          v-if="resultInfo.parentId"
          class="color-info flex align-items-center"
          style="font-size: 12px"
        >
          {{ $t('packages_business_verification_last_start_time') }}:
          {{ inspect.lastStartTimeFmt }}
          <ElButton class="ml-4" text type="primary" @click="toDiffHistory">{{
            $t('packages_business_verification_button_diff_task_history')
          }}</ElButton>
        </div>

        <!--下载详情-->
        <ElButton
          v-if="showDiffInspect"
          class="ml-4"
          text
          type="primary"
          :loading="downloading"
          @click="downloadDetails"
          >{{ $t('packages_business_download_details') }}</ElButton
        >

        <el-divider
          v-if="showCorrection || showDiffInspect"
          class="ml-4 mr-0"
          direction="vertical"
        />

        <!-- 一键修复 -->
        <template v-if="showCorrection">
          <ElButton type="primary" class="ml-4" @click="handleCorrection">{{
            $t('packages_business_data_correction')
          }}</ElButton>
          <ElButton
            v-if="resultStatus !== 'exported'"
            type="primary"
            class="ml-4"
            :loading="exportSqlLoading || resultStatus === 'exporting'"
            @click="handleExportSql"
            >{{ $t('public_generate_recovery_sql') }}</ElButton
          >
          <ElButton
            v-else
            type="primary"
            class="ml-4"
            @click="handleDownloadSql"
            >{{ $t('public_download_recovery_sql') }}</ElButton
          >
        </template>

        <!-- 差异校验 -->
        <div v-if="showDiffInspect" class="flex align-items-center ml-4">
          <ElButton type="primary" @click="diffInspect">{{
            $t('packages_business_verification_button_diff_verify')
          }}</ElButton>
          <ElTooltip effect="dark" placement="top">
            <template #content>
              <div style="width: 232px">
                {{
                  $t('packages_business_verification_button_diff_verify_tips')
                }}
              </div>
            </template>
            <VIcon class="ml-2 color-info" size="14">warning-circle</VIcon>
          </ElTooltip>
        </div>
      </div>
    </template>

    <section
      v-loading="loading"
      class="verify-details-wrap section-wrap h-100 gap-4"
    >
      <el-alert
        v-if="errorMsg && isCountOrHash"
        type="error"
        show-icon
        class="fit-content"
        :closable="false"
      >
        <template #title>
          <div class="flex align-center">
            <div class="text-truncate">{{ errorSummary }}</div>
            <el-button
              type="text"
              class="ml-auto"
              @click="ErrorMessage(errorMsg)"
              >{{ $t('public_button_check') }}</el-button
            >
          </div>
        </template>
      </el-alert>

      <div
        v-if="inspect"
        class="result-table border-top"
        :element-loading-text="$t('packages_business_verification_checking')"
      >
        <div class="flex-1 h-100">
          <div class="flex flex-column h-100">
            <div class="py-3 pr-3 flex align-center">
              <span class="fs-6 font-color-dark lh-8">{{
                $t('packages_business_verification_details_jiaoyanjieguo')
              }}</span>
              <el-segmented
                v-model="resultFilter"
                class="w-auto ml-auto"
                :options="filterOptions"
              />
            </div>

            <div class="min-h-0 flex-1">
              <ResultTable
                ref="singleTable"
                :type="type"
                :data="tableData"
                @row-click="rowClick"
              />
            </div>
          </div>
        </div>

        <ResultView
          v-if="!isCountOrHash"
          ref="resultView"
          class="border-start"
          :remote-method="getResultData"
          :show-type="showType"
          @update:show-type="showType = $event"
        />
      </div>

      <DataCorrectionDialog
        v-if="inspect.id"
        :visible="dataCorrection.visible"
        :inspect-id="inspect.id"
        @update:visible="dataCorrection.visible = $event"
        @started="onStarted"
      />
    </section>
  </PageContainer>
</template>

<style lang="scss">
.verify-details-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .section-wrap-box {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    -ms-flex: 1;
    flex: 1;
    background-color: #fff;
    box-sizing: border-box;
    overflow: hidden;
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

  .el-table__inner-wrapper::before {
    content: none;
  }
}
.sticky-top-0 {
  position: sticky;
  top: 0;
}
</style>
