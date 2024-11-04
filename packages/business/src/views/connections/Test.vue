<template>
  <el-dialog
    class="connection-test-dialog"
    :visible="visible"
    width="780px"
    :show-close="false"
    append-to-body
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #title>
      <div class="test-result">
        <div v-if="testData.testLogs && !testData.testLogs.length && wsError === 'ERROR'">
          <div class="flex align-center gap-2">
            <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
            <span class="fs-6 fw-sub">{{ wsErrorMsg || $t('packages_business_dataForm_test_error') }}</span>
            <el-button class="px-1 py-0.5" @click="switchShowStack" type="text"
              >{{ showStack ? $t('public_button_fold') : $t('public_button_expand')
              }}<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>

        <template v-else>
          <div class="flex align-center gap-2" v-if="status === 'ready'">
            <VIcon class="color-success" size="18">check-circle-fill</VIcon>
            <span class="fs-6 fw-sub">{{ $t('packages_business_dataForm_test_testResultSuccess') }}</span>
          </div>

          <div class="flex align-center gap-2" v-else-if="['invalid', 'ERROR'].includes(status)">
            <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
            <span class="fs-6 fw-sub">{{ $t('packages_business_dataForm_test_testResultFail') }}</span>
          </div>

          <div class="flex align-center gap-2" v-else>
            <el-image
              style="width: 20px; height: 20px; vertical-align: bottom"
              :src="require('@tap/assets/images/loading.gif')"
            ></el-image>
            <span v-if="testData.testLogs.length === 0" class="fs-6 fw-sub">{{
              $t('packages_business_dataForm_primaryTest')
            }}</span>
            <span v-else class="fs-6 fw-sub">{{ $t('packages_business_dataForm_testing') }}</span>
          </div>
        </template>
      </div>
    </template>

    <el-collapse-transition>
      <div v-show="showStack" class="position-relative rounded-lg overflow-hidden error-stack-pre-wrap">
        <div class="position-absolute end-0 top-0 px-2 pt-1 error-stack-actions">
          <el-button @click="handleCopyStack(wsErrorStack)" type="text" class="px-1 py-0.5 font-color-dark">
            <VIcon class="mr-1">copy</VIcon>
            <span class="">{{ $t('public_button_copy') }}</span>
          </el-button>
        </div>

        <pre class="m-0 p-4 pt-0 mt-6 font-color-dark" style="max-height: 60vh; font-size: 13px; overflow-x: auto">{{
          wsErrorStack
        }}</pre>
      </div>
    </el-collapse-transition>

    <div v-show="showProgress && fileInfo.progress">
      <div>
        <span class="mr-2">{{ $t('packages_business_connections_test_xiazaijindu') }}</span>
        <span>{{ fileInfo.progress + '%' }}</span>
        <span v-if="fileInfo.status === 'ERROR'" class="color-danger">{{
          $t('packages_business_connections_test_xiazaishibai')
        }}</span>
      </div>
      <ElProgress class="my-2" :show-text="false" :percentage="fileInfo.progress"></ElProgress>
    </div>

    <el-table
      v-if="!(testData.testLogs && !testData.testLogs.length && wsError === 'ERROR')"
      :data="testData.testLogs"
      style="width: 100%"
      max-height="500"
      class="test-block"
      :row-style="rowStyleHandler"
      v-loading="testData.testLogs && !testData.testLogs.length"
      element-loading-background="#fff"
    >
      <el-table-column prop="show_msg" :label="$t('packages_business_dataForm_test_items')">
        <template slot-scope="scope">
          <span>{{ scope.row.show_msg }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('packages_business_dataForm_test_result')" width="150">
        <template slot-scope="scope">
          <!--当前检查项失败 但是不影响此次测试结果 -->
          <span v-if="scope.row.status === 'failed' && !scope.row.required" class="flex align-center gap-1">
            <VIcon size="14" :style="{ color: colorMap['warning'] }">warning</VIcon>
            {{ statusMap[scope.row.status] }}
          </span>
          <span v-else-if="scope.row.status === 'unTest'" class="flex align-center gap-1">
            <el-image
              style="width: 20px; height: 20px; vertical-align: bottom"
              :src="require('@tap/assets/images/loading.gif')"
            ></el-image>
            {{ statusMap[scope.row.status] }}
          </span>
          <span v-else class="flex align-center gap-1">
            <VIcon size="14" :style="{ color: colorMap[scope.row.status] }">{{ iconMap[scope.row.status] }}</VIcon>
            {{ statusMap[scope.row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="fail_message" :label="$t('packages_business_dataForm_test_information')" width="308">
        <template #default="{ row }">
          <span v-if="!row.item_exception || row.status === 'passed'">{{ row.fail_message }}</span>
          <div v-else class="flex align-center">
            <span class="ellipsis">
              {{ row.item_exception.message }}
            </span>
            <el-button type="text" @click="showError(row)">{{ $t('public_view_details') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!--错误详情-->
    <ElDialog width="80%" custom-class="max-w-1000 mt-25" :visible.sync="errorDialog.open" append-to-body>
      <template #title>
        <div class="flex align-center gap-2">
          <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
          <span class="fs-6 fw-sub">{{ errorDialog.title }}</span>
        </div>
      </template>

      <div class="mt-n4">
        <div v-if="errorDialog.message" v-html="errorDialog.message" class="text-prewrap mb-6 font-color-light"></div>

        <template v-if="errorDialog.reason">
          <div class="fw-sub mb-3 font-color-dark">{{ $t('public_task_reasons_for_error') }}</div>
          <div
            v-html="errorDialog.reason"
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
          ></div>
        </template>

        <template v-if="errorDialog.solution">
          <div class="fw-sub mb-3 font-color-dark">{{ $t('packages_business_solution') }}</div>
          <div
            v-html="errorDialog.solution"
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
          ></div>
        </template>

        <!--See Also-->
        <template v-if="!hideSeeAlso && errorDialog.seeAlso && errorDialog.seeAlso.length">
          <div class="fw-sub mb-3 font-color-dark">See Also</div>
          <ol class="pl-6 mb-6">
            <li v-for="(item, index) in errorDialog.seeAlso" :key="index" class="list-decimal">
              <ElLink type="primary" class="text-decoration-underline" @click="handleLink(item)">{{ item }}</ElLink>
            </li>
          </ol>
        </template>

        <template v-if="errorDialog.stack">
          <div class="mb-3 flex justify-content-between align-items-end">
            <span class="fw-sub font-color-dark">{{ $t('packages_business_logs_nodelog_cuowuduizhan') }}</span>
          </div>
          <div class="error-stack-pre-wrap position-relative mb-6 font-color-light rounded-lg">
            <div class="position-absolute end-0 top-0 px-2 pt-1 error-stack-actions">
              <el-button @click="handleCopyStack(errorDialog.stack)" type="text" class="px-1 py-0.5 font-color-dark">
                <VIcon class="mr-1">copy</VIcon>
                <span class="">{{ $t('public_button_copy') }}</span>
              </el-button>
            </div>

            <pre
              class="m-0 p-4 pt-0 mt-6 font-color-dark"
              style="max-height: 60vh; font-size: 13px; overflow-x: auto"
              >{{ errorDialog.stack }}</pre
            >
          </div>
        </template>
      </div>
    </ElDialog>

    <template #footer>
      <el-button v-if="isTimeout" size="mini" @click="start()">{{ $t('public_button_retry') }}</el-button>
      <slot name="cancel" :close="handleClose" :status="status">
        <el-button size="mini" type="primary" @click="handleClose()">{{ $t('public_button_close') }}</el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script>
import { VIcon } from '@tap/component'
import { copyToClipboard, openUrl } from '@tap/shared'
import { proxyApi } from '@tap/api'
import i18n from '@tap/i18n'
export default {
  name: 'Test',
  components: { VIcon },
  props: {
    visible: {
      value: Boolean
    },
    formData: {
      value: Object
    },
    testType: {
      value: String
    }
  },
  data() {
    return {
      hideSeeAlso: process.env.VUE_APP_PAGE_TITLE === 'IKAS' || process.env.VUE_APP_HIDE_LOG_SEE_ALSO,
      progress: 0,
      testData: {
        testLogs: [],
        testResult: '',
        progress: 0
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
        unTest: '#aaaaaa'
      },
      iconMap: {
        ready: 'check-circle-fill',
        invalid: 'circle-close-filled',
        testing: '',
        passed: 'check-circle-fill',
        waiting: 'question-fill',
        failed: 'circle-close-filled',
        unTest: ''
      },
      statusMap: {
        ready: this.$t('packages_business_dataForm_test_success'),
        invalid: this.$t('packages_business_dataForm_test_fail'),
        testing: this.$t('packages_business_dataForm_test_testing'),
        passed: this.$t('packages_business_dataForm_test_success'),
        waiting: this.$t('packages_business_dataForm_test_testing'),
        failed: this.$t('packages_business_dataForm_test_fail'),
        unTest: this.$t('packages_business_dataForm_test_unTest')
      },
      showProgress: true,
      fileInfo: {
        fileSize: 0,
        progress: 0,
        status: ''
      },
      errorDialog: {
        open: false,
        stack: '',
        solution: '',
        message: '',
        reason: '',
        seeAlso: []
      },
      showTooltip: false
    }
  },
  mounted() {
    this.handleWS()
  },
  destroyed() {
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
      this.$emit('update:visible', false)
      this.clearInterval()
    },
    handleWS() {
      this.$ws.ready(() => {
        //接收数据
        this.$ws.on('testConnectionResult', data => {
          this.isTimeout = false //有回调
          let result = data.result || []
          this.wsError = data.status
          this.wsErrorMsg = data.error
          this.wsErrorStack = data.stack
          clearTimeout(this.timer)
          this.timer = null
          let testData = {
            wsError: data.status
          }
          if (result.response_body) {
            let validate_details = result.response_body.validate_details || []
            let details = validate_details.filter(item => item.status !== 'waiting')
            if (details.length === 0) {
              validate_details = validate_details.map(item => {
                item.status = 'unTest'
                return item
              })
            }

            this.testData.testLogs = validate_details
            testData['testLogs '] = validate_details
            testData['status'] = result.status
            this.status = result.status
          } else {
            let logs = this.testData.testLogs.map(item => {
              item.status = 'invalid'
              return item
            })
            this.testData.testLogs = logs
            testData['testLogs '] = logs
            testData['status'] = data.status
            this.status = data.status
            this.wsError = data.status
            //this.wsErrorMsg = data.error
          }
          this.$emit('returnTestData', testData)
        })
        //长连接失败
        this.$ws.on('testConnection', data => {
          this.wsError = data.status
          this.wsErrorMsg = data.error
          let testData = {
            wsError: data.status
          }
          this.$emit('returnTestData', testData)
        })
        //长连接失败
        this.$ws.on('pipe', data => {
          this.wsError = data.status
          this.wsErrorMsg = data.error
          let testData = {
            wsError: data.status
          }
          this.$emit('returnTestData', testData)
        })
      })
    },
    start(updateSchema, editTest) {
      let data = Object.assign({}, this.formData)
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
      let msg = {
        type: 'testConnection',
        data: connection
      }
      if (this.testType) {
        msg.type = this.testType
      }
      msg.data['updateSchema'] = false //默认值
      msg.data['editTest'] = false //默认值

      if (updateSchema) {
        msg.data['updateSchema'] = updateSchema //是否需要更新Schema
      }
      if (editTest) {
        msg.data['editTest'] = editTest //是否编辑测试
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
          this.wsErrorMsg = this.wsErrorMsg ? this.wsErrorMsg : this.$t('packages_business_dataForm_test_retryTest')
          let testData = {
            wsError: 'ERROR'
          }
          this.$emit('returnTestData', testData)
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
        status: ''
      }
      let msg = {
        type: 'downLoadConnector',
        data: connection
      }

      this.showProgress = false
      this.$ws.ready(() => {
        this.$ws.send(msg)
        // 连接测试时出现access_token过期,重发消息
        this.$ws.once('401', () => {
          this.$ws.send(msg)
        })

        // 检查下载器
        this.$ws.on('downloadPdkFileFlag', data => {
          this.showProgress = !!data.result
          if (!this.showProgress) {
            this.$ws.off('downloadPdkFileFlag')
            this.startLoadTestItems(connection, updateSchema, editTest)
            this.fileInfo.progress = 100
          }
        })
        // 下载器进度
        this.$ws.on('progressReporting', data => {
          const { fileSize = 0, progress = 0, status } = data.result || {}
          if (status === 'finish') {
            this.$ws.off('progressReporting')
            this.startLoadTestItems(connection, updateSchema, editTest)
            this.fileInfo.progress = 100
          } else {
            this.fileInfo = {
              fileSize,
              progress,
              status
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
      return str ? str.replace(/tapdata\s?/gi, process.env.VUE_APP_KEYWORD) : ''
    },

    async showError(row) {
      if (process.env.VUE_APP_KEYWORD && row.item_exception) {
        row.item_exception.stack = this.replaceKeyword(row.item_exception.stack)
        row.item_exception.solution = this.replaceKeyword(row.item_exception.solution)
        row.item_exception.message = this.replaceKeyword(row.item_exception.message)
        row.item_exception.reason = this.replaceKeyword(row.item_exception.reason)
      }

      Object.assign(this.errorDialog, row.item_exception)
      this.errorDialog.title = row.show_msg
      this.errorDialog.seeAlso = []

      if (row.errorCode) {
        const data = await proxyApi
          .call({
            className: 'ErrorCodeService',
            method: 'getErrorCodeWithDynamic',
            args: [row.errorCode, i18n.locale === 'en' ? 'en' : 'cn', row.dynamicDescriptionParameters]
          })
          .catch(e => {
            // this.errorDialog.open = true
            console.error(e)
          })

        if (data) {
          this.errorDialog.message = '' // 错误码咱不需要错误信息
          this.errorDialog.title = data.fullErrorCode || data.errorCode
          this.errorDialog.reason = data.dynamicDescribe || data.describe
          this.errorDialog.solution = data.solution
          this.errorDialog.seeAlso = data.seeAlso
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
    }
  }
}
</script>
<style lang="scss" scoped>
.connection-test-dialog {
  .test-result {
    .test-status {
      margin-bottom: 20px;
    }

    .test-title {
      //font-size: 14px;
      font-weight: bold;
      vertical-align: bottom;
      margin-left: 10px;
    }

    i {
      font-size: 18px;
    }

    margin-bottom: 10px;
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
      color: map-get($fontColor, dark);
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
