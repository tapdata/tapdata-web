<script>
import { inspectApi, inspectResultsApi } from '@tap/api'
import { IconButton } from '@tap/component'
import i18n from '@tap/i18n'
import { checkEllipsisActive } from '@tap/shared'
import dayjs from 'dayjs'
import PageContainer from '../../components/PageContainer.vue'
import DataCorrectionDialog from './components/DataCorrectionDialog'
import { inspectMethod as typeMap } from './const'
import mixins from './mixins'
import ResultTable from './ResultTable'
import ResultView from './ResultView'

export default {
  components: {
    ResultTable,
    ResultView,
    DataCorrectionDialog,
    IconButton,
    PageContainer,
  },
  mixins: [mixins],
  data() {
    return {
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
  },
  created() {
    this.getData()
    setInterval(() => {
      if (['running', 'scheduling'].includes(this.inspect?.status)) {
        this.getData(false)
      }
    }, 10000)
  },
  methods: {
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

    <section
      v-loading="loading"
      class="verify-details-wrap section-wrap h-100 gap-4"
    >
      <div class="flex align-center">
        <ElRadioGroup v-model="resultFilter">
          <ElRadioButton label="">{{ $t('public_all') }}</ElRadioButton>
          <ElRadioButton label="passed">{{
            $t('packages_business_verification_consistent')
          }}</ElRadioButton>
          <ElRadioButton label="failed">{{
            $t('packages_business_verification_inconsistent')
          }}</ElRadioButton>
        </ElRadioGroup>

        <div v-if="!isCountOrHash" class="flex align-items-center ml-auto">
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
          <ElButton
            v-if="showCorrection"
            type="primary"
            class="ml-4"
            @click="handleCorrection"
            >{{ $t('packages_business_data_correction') }}</ElButton
          >

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
      </div>

      <div
        v-if="errorMsg && isCountOrHash"
        class="error-tips mt-4 pl-4 pr-0 rounded-lg flex-shrink-0"
      >
        <VIcon size="16" class="color-danger mt-0.5">error</VIcon>
        <span
          ref="errorSummary"
          class="mx-2 flex-1"
          :class="{
            ellipsis: !expandErrorMessage,
            'text-pre': expandErrorMessage,
          }"
          >{{ expandErrorMessage ? errorMsg : errorSummary }}</span
        >
        <span
          class="sticky-top-0 end-0 px-2 flex-shrink-0 align-self-start"
          style="background: inherit"
        >
          <ElLink
            v-if="hasMoreErrorMsg"
            class="align-middle"
            type="danger"
            @click="expandErrorMessage = !expandErrorMessage"
            >{{
              expandErrorMessage
                ? $t('packages_business_verification_details_shouqi')
                : $t('public_button_expand')
            }}</ElLink
          >
          <IconButton
            class="ml-2 color-info align-middle"
            size="12"
            sm
            @click="errorMsg = ''"
            >close</IconButton
          >
        </span>
      </div>

      <div
        v-if="inspect"
        class="result-table"
        :element-loading-text="$t('packages_business_verification_checking')"
      >
        <ResultTable
          ref="singleTable"
          :type="type"
          :data="tableData"
          @row-click="rowClick"
        />
        <ResultView
          v-if="!isCountOrHash"
          ref="resultView"
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
}
.sticky-top-0 {
  position: sticky;
  top: 0;
}
</style>
