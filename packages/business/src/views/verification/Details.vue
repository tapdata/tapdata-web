<template>
  <section class="verify-details-wrap section-wrap h-100" v-loading="loading">
    <div class="section-wrap-box">
      <div class="verify-details-header" v-if="inspect">
        <div class="flex align-center">
          <span style="font-size: 14px">{{ inspect.name }}</span>
          <ElTag type="info" class="ml-3">{{ typeMap[type] }}</ElTag>
          <ElDivider class="mx-3" direction="vertical" />
          <ElRadioGroup v-model="resultFilter">
            <ElRadioButton label="">{{ $t('public_all') }}</ElRadioButton>
            <ElRadioButton label="passed">{{ $t('packages_business_verification_consistent') }}</ElRadioButton>
            <ElRadioButton label="failed">{{ $t('packages_business_verification_inconsistent') }}</ElRadioButton>
          </ElRadioGroup>
        </div>
        <div v-if="!isCountOrHash">
          <div class="flex align-items-center">
            <div v-if="resultInfo.parentId" class="color-info flex align-items-center" style="font-size: 12px">
              {{ $t('packages_business_verification_last_start_time') }}: {{ inspect.lastStartTimeFmt }}
              <ElLink class="ml-5" type="primary" @click="toDiffHistory">{{
                $t('packages_business_verification_button_diff_task_history')
              }}</ElLink>
            </div>

            <!--下载详情-->
            <ElButton v-if="showDiffInspect" class="ml-4" type="text" :loading="downloading" @click="downloadDetails">{{
              $t('packages_business_download_details')
            }}</ElButton>

            <el-divider v-if="showCorrection || showDiffInspect" class="ml-4 mr-0" direction="vertical"></el-divider>

            <!-- 一键修复 -->
            <ElButton v-if="showCorrection" type="primary" class="ml-4" @click="handleCorrection">{{
              $t('packages_business_data_correction')
            }}</ElButton>

            <!-- 差异校验 -->
            <div v-if="showDiffInspect" class="flex align-items-center ml-4">
              <ElButton type="primary" @click="diffInspect">{{
                $t('packages_business_verification_button_diff_verify')
              }}</ElButton>
              <ElTooltip effect="dark" placement="top">
                <div slot="content" style="width: 232px">
                  {{ $t('packages_business_verification_button_diff_verify_tips') }}
                </div>
                <VIcon class="ml-2 color-info" size="14">warning-circle</VIcon>
              </ElTooltip>
            </div>
          </div>
        </div>
      </div>
      <div v-if="errorMsg && isCountOrHash" class="error-tips mt-4 pl-4 pr-0 rounded-lg">
        <VIcon size="16" class="color-danger mt-0.5">error</VIcon>
        <span
          ref="errorSummary"
          class="mx-2 flex-1"
          :class="{ ellipsis: !expandErrorMessage, 'text-pre': expandErrorMessage }"
          >{{ expandErrorMessage ? errorMsg : errorSummary }}</span
        >
        <span class="sticky-top-0 end-0 px-2 flex-shrink-0 align-self-start" style="background: inherit">
          <ElLink
            v-if="hasMoreErrorMsg"
            class="align-middle"
            type="danger"
            @click="expandErrorMessage = !expandErrorMessage"
            >{{
              expandErrorMessage ? $t('packages_business_verification_details_shouqi') : $t('public_button_expand')
            }}</ElLink
          >
          <IconButton class="ml-2 color-info align-middle" size="12" @click="errorMsg = ''" sm>close</IconButton>
        </span>
      </div>
      <div
        class="result-table mt-4"
        v-if="inspect"
        :element-loading-text="$t('packages_business_verification_checking')"
      >
        <ResultTable ref="singleTable" :type="type" :data="tableData" @row-click="rowClick"></ResultTable>
        <ResultView v-if="!isCountOrHash" ref="resultView" :remoteMethod="getResultData"></ResultView>
      </div>
    </div>

    <DataCorrectionDialog
      v-if="inspect.id"
      :visible="dataCorrection.visible"
      :inspectId="inspect.id"
      @update:visible="dataCorrection.visible = $event"
      @started="onStarted"
    ></DataCorrectionDialog>
  </section>
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
    padding: 20px;
    border-radius: 4px;
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
<script>
import i18n from '@tap/i18n'

import ResultTable from './ResultTable'
import ResultView from './ResultView'
import DataCorrectionDialog from './components/DataCorrectionDialog'
import dayjs from 'dayjs'
import { inspectResultsApi, inspectApi } from '@tap/api'
import { inspectMethod as typeMap } from './const'
import { checkEllipsisActive } from '@tap/shared'
import { IconButton } from '@tap/component'
import mixins from './mixins'

export default {
  mixins: [mixins],
  components: { ResultTable, ResultView, DataCorrectionDialog, IconButton },
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
        visible: false
      },
      hasMoreErrorMsg: false
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
      return data.filter(item => item.result === this.resultFilter)
    },
    verifyType() {
      return this.resultInfo?.inspect?.inspectMethod
    },
    isCountOrHash() {
      return this.inspect?.inspectMethod === 'row_count' || this.inspect?.inspectMethod === 'hash'
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
        !(this.inspect.status === 'error' && !this.resultInfo.parentId) &&
        this.canStart
      )
    }
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
              id: this.$route.params.id
            }
          })
        })
        .then(data => {
          let inspect = data?.items?.[0] || {}
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
            .then(data => {
              let result = data?.items?.[0]
              if (result) {
                this.resultInfo = result
                let stats = result.stats
                if (stats.length) {
                  this.errorMsg = result.status === 'error' ? result.errorMsg : undefined
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
                      this.$refs.singleTable?.setCurrentRow(stats.find(t => t.taskId === this.taskId))
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
      let firstCheckId = this.resultInfo.firstCheckId
      if (!firstCheckId) {
        return this.$message.error(this.$t('packages_business_verification_message_old_data_not_support'))
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
            id: this.inspect.id
          },
          { status: 'scheduling', ping_time: 0, scheduleTimes: 0, byFirstCheckId: firstCheckId }
        )
        .then(() => {
          this.$message.success(this.$t('packages_business_verification_startVerify'))
          this.getData()
        })
    },
    handleLoadIndexField(item, indexArr, sourceColumns, targetColumns) {
      sourceColumns.forEach((el, i) => {
        let node = {
          type: item.type,
          red: indexArr.includes(i + ''),
          source: {
            key: el,
            value: item.source[el]
          },
          target: {
            key: targetColumns[i],
            value: item.target[targetColumns[i]]
          }
        }
        item['details'] = item['details'] || []
        item['details'].push(node)
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
        this.hasMoreErrorMsg = dom ? this.errorMsg.split('\n').length > 1 || checkEllipsisActive(dom) : false
      })
    }
  }
}
</script>
