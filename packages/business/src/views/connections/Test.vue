<script>
import { proxyApi } from '@tap/api'
import loadingImg from '@tap/assets/images/loading.gif'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import { copyToClipboard, openUrl } from '@tap/shared'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'
export default {
  name: 'Test',
  components: {
    VIcon,
    // ElIconWarning,
    // ElIconSuccess
  },
  props: {
    visible: {
      value: Boolean,
    },
    formData: {
      value: Object,
    },
    testType: {
      value: String,
    },
  },
  emits: ['update:visible', 'returnTestData'],
  data() {
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

    return {
      isDaas,
      loadingImg,
      hideSeeAlso:
        import.meta.env.VUE_APP_PAGE_TITLE === 'IKAS' ||
        import.meta.env.VUE_APP_HIDE_LOG_SEE_ALSO,
      progress: 0,
      testData: {
        testLogs: [],
        testResult: '',
        progress: 0,
      },
      wsError: '',
      wsErrorMsg: '',
      wsErrorStack: '',
      showStack: false,
      status: '',
      timer: null,
      isTimeout: true,
      // hideTableInfo: false,
      colorMap: {
        passed: '#70AD47',
        waiting: '#aaaaaa',
        failed: '#f56c6c',
        warning: '#ffc107',
        ready: '#70AD47',
        invalid: '#f56c6c',
        testing: '#aaaaaa',
        unTest: '#aaaaaa',
      },
      iconMap: {
        ready: 'check-circle-fill',
        invalid: 'circle-close-filled',
        testing: '',
        passed: 'check-circle-fill',
        waiting: 'question-fill',
        failed: 'circle-close-filled',
        unTest: '',
      },
      statusMap: {
        ready: this.$t('packages_business_dataForm_test_success'),
        invalid: this.$t('packages_business_dataForm_test_fail'),
        testing: this.$t('packages_business_dataForm_test_testing'),
        passed: this.$t('packages_business_dataForm_test_success'),
        waiting: this.$t('packages_business_dataForm_test_testing'),
        failed: this.$t('packages_business_dataForm_test_fail'),
        unTest: this.$t('packages_business_dataForm_test_unTest'),
      },
      showProgress: true,
      fileInfo: {
        fileSize: 0,
        progress: 0,
        status: '',
      },
      errorDialog: {
        open: false,
        stack: '',
        solution: '',
        message: '',
        reason: '',
        seeAlso: [],
        isWarning: false,
        module: '',
      },
      showTooltip: false,
      expandErrorMessage: false,
    }
  },
  mounted() {
    this.handleWS()
  },
  unmounted() {
    this.clearInterval()
  },
  methods: {
    handleLink(val) {
      openUrl(val)
    },

    rowStyleHandler({ row }) {
      return row.status === 'waiting' ? { background: '#fff' } : ''
    },
    handleClose() {
      $emit(this, 'update:visible', false)
      this.clearInterval()
    },
    handleWS() {
      this.$ws.ready(() => {
        //接收数据
        this.$ws.on('testConnectionResult', (data) => {
          this.isTimeout = false //有回调
          const result = data.result || []
          this.wsError = data.status
          this.wsErrorMsg = data.error
          this.wsErrorStack = data.stack
          clearTimeout(this.timer)
          this.timer = null
          const testData = {
            wsError: data.status,
          }
          if (result.response_body) {
            let validate_details = result.response_body.validate_details || []
            const details = validate_details.filter(
              (item) => item.status !== 'waiting',
            )
            if (details.length === 0) {
              validate_details = validate_details.map((item) => {
                item.status = 'unTest'
                return item
              })
            }

            this.testData.testLogs = validate_details
            testData['testLogs '] = validate_details
            testData.status = result.status
            this.status = result.status
          } else {
            const logs = this.testData.testLogs.map((item) => {
              item.status = 'invalid'
              return item
            })
            this.testData.testLogs = logs
            testData['testLogs '] = logs
            testData.status = data.status
            this.status = data.status
            this.wsError = data.status
            //this.wsErrorMsg = data.error
          }
          $emit(this, 'returnTestData', testData)
        })
        //长连接失败
        this.$ws.on('testConnection', (data) => {
          this.wsError = data.status
          this.wsErrorMsg = data.error
          const testData = {
            wsError: data.status,
          }
          $emit(this, 'returnTestData', testData)
        })
        //长连接失败
        this.$ws.on('pipe', (data) => {
          this.wsError = data.status
          this.wsErrorMsg = data.error
          const testData = {
            wsError: data.status,
          }
          $emit(this, 'returnTestData', testData)
        })
      })
    },
    start(updateSchema, editTest) {
      const data = Object.assign({}, this.formData)
      delete data.schema
      delete data.response_body
      this.wsError = ''
      this.wsErrorStack = ''
      this.showStack = false
      this.testData.testLogs = []

      if (this.testType === 'testExternalStorage') {
        // 外存测试特殊处理
        this.startByConnection(data, updateSchema, editTest)
        return
      }
      this.startDownLoadConnector(data, updateSchema, editTest)
    },

    startByConnection(connection, updateSchema, editTest) {
      const msg = {
        type: 'testConnection',
        data: connection,
      }
      if (this.testType) {
        msg.type = this.testType
      }
      msg.data.updateSchema = false //默认值
      msg.data.editTest = false //默认值

      if (updateSchema) {
        msg.data.updateSchema = updateSchema //是否需要更新Schema
      }
      if (editTest) {
        msg.data.editTest = editTest //是否编辑测试
      }

      this.$ws.ready(() => {
        this.$ws.send(msg)
        // 连接测试时出现access_token过期,重发消息
        this.$ws.once('401', () => {
          this.$ws.send(msg)
        })
        this.timer && clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.isTimeout = true //重置
          this.wsError = 'ERROR'
          this.wsErrorMsg = this.wsErrorMsg
            ? this.wsErrorMsg
            : this.$t('packages_business_dataForm_test_retryTest')
          const testData = {
            wsError: 'ERROR',
          }
          $emit(this, 'returnTestData', testData)
        }, 120000)
      })
    },
    clearInterval() {
      // 取消长连接
      this.$ws.off('testConnection')
      this.$ws.off('downloadPdkFileFlag')
      this.$ws.off('progressReporting')
      this.testData.testLogs = []
      this.status = ''
    },

    startDownLoadConnector(connection, updateSchema, editTest) {
      this.fileInfo = {
        fileSize: 0,
        progress: 0,
        status: '',
      }
      const msg = {
        type: 'downLoadConnector',
        data: connection,
      }

      this.showProgress = false
      this.$ws.ready(() => {
        this.$ws.send(msg)
        // 连接测试时出现access_token过期,重发消息
        this.$ws.once('401', () => {
          this.$ws.send(msg)
        })

        // 检查下载器
        this.$ws.on('downloadPdkFileFlag', (data) => {
          this.showProgress = !!data.result
          if (!this.showProgress) {
            this.$ws.off('downloadPdkFileFlag')
            this.startLoadTestItems(connection, updateSchema, editTest)
            this.fileInfo.progress = 100
          }
        })
        // 下载器进度
        this.$ws.on('progressReporting', (data) => {
          const { fileSize = 0, progress = 0, status } = data.result || {}
          if (status === 'finish') {
            this.$ws.off('progressReporting')
            this.startLoadTestItems(connection, updateSchema, editTest)
            this.fileInfo.progress = 100
          } else {
            this.fileInfo = {
              fileSize,
              progress,
              status,
            }
          }
        })
        // 检查不到下载器
        this.$ws.on('unknown_event_result', () => {
          this.$ws.off('unknown_event_result')
          this.startLoadTestItems(connection, updateSchema, editTest)
        })
      })
    },

    startLoadTestItems() {
      this.startByConnection(...arguments)
    },

    replaceKeyword(str) {
      return str
        ? str.replaceAll(/tapdata\s?/gi, import.meta.env.VUE_APP_KEYWORD)
        : ''
    },

    async showError(row) {
      if (import.meta.env.VUE_APP_KEYWORD && row.item_exception) {
        row.item_exception.stack = this.replaceKeyword(row.item_exception.stack)
        row.item_exception.solution = this.replaceKeyword(
          row.item_exception.solution,
        )
        row.item_exception.message = this.replaceKeyword(
          row.item_exception.message,
        )
        row.item_exception.reason = this.replaceKeyword(
          row.item_exception.reason,
        )
      }

      Object.assign(this.errorDialog, row.item_exception)
      this.errorDialog.title = row.show_msg
      this.errorDialog.status = row.status
      this.errorDialog.seeAlso = []
      this.errorDialog.module = ''
      this.errorDialog.isWarning = row.status === 'failed' && !row.required

      if (row.error_code) {
        const data = await proxyApi
          .call({
            className: 'ErrorCodeService',
            method: 'getErrorCodeWithDynamic',
            args: [
              row.error_code,
              i18n.locale === 'en' ? 'en' : 'cn',
              row.dynamicDescriptionParameters,
            ],
          })
          .catch((error) => {
            // this.errorDialog.open = true
            console.error(error)
          })

        if (data) {
          this.errorDialog.title = data.fullErrorCode || data.errorCode
          this.errorDialog.message = data.describe
          this.errorDialog.reason = data.dynamicDescribe
          this.errorDialog.solution = data.solution
          this.errorDialog.seeAlso = data.seeAlso
          this.errorDialog.module = data.module
        }
      }
      this.errorDialog.open = true
    },

    onCopy() {
      this.showTooltip = true
    },

    switchShowStack() {
      this.showStack = !this.showStack
    },

    handleCopyStack(stack) {
      copyToClipboard(stack)
      this.$message.success(this.$t('public_message_copy_success'))
    },

    handleCreateTicket() {
      const errorCode = this.errorDialog.title

      window.open(
        this.$router.resolve({
          name: 'TicketSystem',
          query: {
            form: encodeURIComponent(
              JSON.stringify({
                connectionId: this.formData?.id,
                subject: errorCode,
                description: `Error Code: ${errorCode}
Module: ${this.errorDialog.module || ''}
Describe: ${this.errorDialog.message ? `\n${this.errorDialog.message}` : ''}
Stack Trace: ${this.errorDialog.stack ? `\n${this.errorDialog.stack}` : ''}`,
              }),
            ),
          },
        }).href,
      )
    },
  },
}
</script>

<template>
  <el-dialog
    class="connection-test-dialog"
    :model-value="visible"
    width="780px"
    append-to-body
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #header>
      <div class="test-result">
        <div
          v-if="
            testData.testLogs &&
            !testData.testLogs.length &&
            wsError === 'ERROR'
          "
        >
          <div class="flex align-center gap-2">
            <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
            <span class="fs-6 fw-sub">{{
              wsErrorMsg || $t('packages_business_dataForm_test_error')
            }}</span>
            <el-button
              class="px-1 py-0.5"
              text
              type="primary"
              @click="switchShowStack"
              >{{
                showStack
                  ? $t('public_button_fold')
                  : $t('public_button_expand')
              }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
          </div>
        </div>

        <template v-else>
          <div v-if="status === 'ready'" class="flex align-center gap-2">
            <VIcon class="color-success" size="18">check-circle-fill</VIcon>
            <span class="fs-6 fw-sub">{{
              $t('packages_business_dataForm_test_testResultSuccess')
            }}</span>
          </div>

          <div
            v-else-if="['invalid', 'ERROR'].includes(status)"
            class="flex align-center gap-2"
          >
            <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
            <span class="fs-6 fw-sub">{{
              $t('packages_business_dataForm_test_testResultFail')
            }}</span>
          </div>

          <div v-else class="flex align-center gap-2">
            <el-image
              style="width: 20px; height: 20px; vertical-align: bottom"
              :src="loadingImg"
            />
            <span v-if="testData.testLogs.length === 0" class="fs-6 fw-sub">{{
              $t('packages_business_dataForm_primaryTest')
            }}</span>
            <span v-else class="fs-6 fw-sub">{{
              $t('packages_business_dataForm_testing')
            }}</span>
          </div>
        </template>
      </div>
    </template>

    <el-collapse-transition>
      <div
        v-show="showStack"
        class="position-relative rounded-lg overflow-hidden error-stack-pre-wrap"
      >
        <div
          class="position-absolute end-0 top-0 px-2 pt-1 error-stack-actions"
        >
          <el-button
            text
            type="primary"
            class="px-1 py-0.5 font-color-dark"
            @click="handleCopyStack(wsErrorStack)"
          >
            <VIcon class="mr-1">copy</VIcon>
            <span class="">{{ $t('public_button_copy') }}</span>
          </el-button>
        </div>

        <pre
          class="m-0 p-4 pt-0 mt-6 font-color-dark"
          style="max-height: 60vh; font-size: 13px; overflow-x: auto"
          >{{ wsErrorStack }}</pre
        >
      </div>
    </el-collapse-transition>

    <div v-show="showProgress && fileInfo.progress">
      <div>
        <span class="mr-2">{{
          $t('packages_business_connections_test_xiazaijindu')
        }}</span>
        <span>{{ `${fileInfo.progress}%` }}</span>
        <span v-if="fileInfo.status === 'ERROR'" class="color-danger">{{
          $t('packages_business_connections_test_xiazaishibai')
        }}</span>
      </div>
      <ElProgress
        class="my-2"
        :show-text="false"
        :percentage="fileInfo.progress"
      />
    </div>

    <el-table
      v-if="
        !(testData.testLogs && !testData.testLogs.length && wsError === 'ERROR')
      "
      v-loading="testData.testLogs && !testData.testLogs.length"
      :data="testData.testLogs"
      style="width: 100%"
      max-height="500"
      class="test-block"
      :row-style="rowStyleHandler"
      element-loading-background="#fff"
    >
      <el-table-column
        prop="show_msg"
        :label="$t('packages_business_dataForm_test_items')"
      >
        <template #default="scope">
          <span>{{ scope.row.show_msg }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        :label="$t('packages_business_dataForm_test_result')"
        width="150"
      >
        <template #default="scope">
          <!--当前检查项失败 但是不影响此次测试结果 -->
          <span
            v-if="scope.row.status === 'failed' && !scope.row.required"
            class="flex align-center gap-1"
          >
            <VIcon size="14" :style="{ color: colorMap['warning'] }"
              >warning</VIcon
            >
            {{ statusMap[scope.row.status] }}
          </span>
          <span
            v-else-if="scope.row.status === 'unTest'"
            class="flex align-center gap-1"
          >
            <el-image
              style="width: 20px; height: 20px; vertical-align: bottom"
              :src="loadingImg"
            />
            {{ statusMap[scope.row.status] }}
          </span>
          <span v-else class="flex align-center gap-1">
            <VIcon size="14" :style="{ color: colorMap[scope.row.status] }">{{
              iconMap[scope.row.status]
            }}</VIcon>
            {{ statusMap[scope.row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="fail_message"
        :label="$t('packages_business_dataForm_test_information')"
        width="308"
      >
        <template #default="{ row }">
          <span v-if="!row.item_exception || row.status === 'passed'">{{
            row.fail_message
          }}</span>
          <div v-else class="flex align-center">
            <span>
              {{ row.item_exception.message }}
            </span>
            <el-button text type="primary" @click="showError(row)">{{
              $t('public_view_details')
            }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!--错误详情-->
    <ElDialog
      v-model="errorDialog.open"
      width="80%"
      class="max-w-1000 mt-25 --padding"
      append-to-body
      @open="expandErrorMessage = false"
    >
      <template #header>
        <div class="flex align-center gap-2">
          <VIcon v-if="!errorDialog.isWarning" class="color-danger" size="18"
            >circle-close-filled</VIcon
          >
          <VIcon v-else class="color-warning" size="18">warning</VIcon>
          <span class="fs-6 fw-sub">{{ errorDialog.title }}</span>
        </div>
      </template>

      <div>
        <template v-if="errorDialog.message">
          <div class="fw-sub mb-3 font-color-dark">
            {{
              $t(
                errorDialog.isWarning
                  ? 'packages_business_warning_details'
                  : 'packages_business_error_details',
              )
            }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="errorDialog.message"
          />
        </template>

        <template v-if="errorDialog.reason">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('public_task_reasons_for_error') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="errorDialog.reason"
          />
        </template>

        <template v-if="errorDialog.solution">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('packages_business_solution') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="errorDialog.solution"
          />
        </template>

        <!--See Also-->
        <template
          v-if="
            !hideSeeAlso && errorDialog.seeAlso && errorDialog.seeAlso.length
          "
        >
          <div class="fw-sub mb-3 font-color-dark">See Also</div>
          <ol class="pl-6 mb-6">
            <li
              v-for="(item, index) in errorDialog.seeAlso"
              :key="index"
              class="list-decimal"
            >
              <ElLink
                type="primary"
                class="text-decoration-underline"
                @click="handleLink(item)"
                >{{ item }}</ElLink
              >
            </li>
          </ol>
        </template>

        <template v-if="errorDialog.stack && !errorDialog.isWarning">
          <div class="mb-3 flex justify-content-between align-items-end">
            <span class="fw-sub font-color-dark">{{
              $t('packages_business_logs_nodelog_cuowuduizhan')
            }}</span>
          </div>
          <div
            class="error-stack-pre-wrap position-relative mb-6 font-color-light rounded-lg"
          >
            <div class="position-absolute end-0 top-0 px-2 pt-1">
              <el-button
                text
                type="primary"
                class="px-1 py-0.5 font-color-dark"
                @click="handleCopyStack(errorDialog.stack)"
              >
                <VIcon class="mr-1">copy</VIcon>
                <span class="">{{ $t('public_button_copy') }}</span> </el-button
              ><el-button
                text
                type="primary"
                class="px-1 py-0.5 font-color-dark ml-2"
                @click="expandErrorMessage = !expandErrorMessage"
              >
                {{
                  expandErrorMessage
                    ? $t('packages_business_verification_details_shouqi')
                    : $t('public_button_expand')
                }}<i
                  class="el-icon-arrow-down is-rotate ml-1"
                  :class="{ 'is-active': expandErrorMessage }"
                />
              </el-button>
            </div>

            <pre
              class="m-0 p-4 pt-0 mt-6 font-color-dark"
              :class="{ 'truncate-two-lines': !expandErrorMessage }"
              style="max-height: 400px; font-size: 13px; overflow-x: auto"
              >{{ errorDialog.stack }}</pre
            >
          </div>
        </template>
      </div>

      <template v-if="!isDaas" #footer>
        <ElButton @click="errorDialog.open = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton type="primary" @click="handleCreateTicket">{{
          $t('dfs_user_contactus_chuangjiangongdan')
        }}</ElButton>
      </template>
    </ElDialog>

    <template #footer>
      <el-button v-if="isTimeout" @click="start()">{{
        $t('public_button_retry')
      }}</el-button>
      <slot name="cancel" :close="handleClose" :status="status">
        <el-button type="primary" @click="handleClose()">{{
          $t('public_button_close')
        }}</el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.connection-test-dialog {
  .test-result {
    .test-status {
      //margin-bottom: 20px;
    }

    .test-title {
      //font-size: 14px;
      //font-weight: bold;
      //vertical-align: bottom;
      //margin-left: 10px;
    }

    //i {
    //  font-size: 18px;
    //}

    //margin-bottom: 10px;
  }
}
</style>

<style lang="scss">
.connection-test-dialog {
  .test-progress {
    .el-progress-bar__outer {
      border-radius: 0;
    }

    .el-progress-bar__inner {
      border-radius: 0;
    }

    margin-bottom: 10px;
  }

  .el-dialog__body {
    padding: 0 20px 20px;
  }

  .test-block {
    th,
    tr {
      .cell {
        white-space: normal !important;
      }
    }

    td,
    th.is-leaf {
      border-bottom: 1px solid #ebeef5;
    }

    thead {
      color: map.get($fontColor, dark);
    }

    .information {
      width: 358px;
      white-space: normal;
    }
  }

  .el-table::before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
  }
}
</style>
