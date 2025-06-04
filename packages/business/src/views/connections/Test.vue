<script setup lang="ts">
import { connectionsApi, proxyApi } from '@tap/api'
import loadingImg from '@tap/assets/images/loading.gif'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import { copyToClipboard, openUrl } from '@tap/shared'
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

interface ErrorDialog {
  open: boolean
  stack: string
  solution: string
  message: string
  reason: string
  seeAlso: string[]
  isWarning: boolean
  module: string
  title: string
  status?: string
}

interface ErrorCodeResponse {
  fullErrorCode?: string
  errorCode?: string
  describe?: string
  dynamicDescribe?: string
  solution?: string
  seeAlso?: string[]
  module?: string
}

interface Props {
  visible: boolean
  connection: Record<string, any>
  testType: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  returnTestData: [data: any]
}>()

const router = useRouter()

const instance = getCurrentInstance()
const $ws = (instance?.proxy as any).$ws

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const hideSeeAlso =
  import.meta.env.VUE_APP_PAGE_TITLE === 'IKAS' ||
  import.meta.env.VUE_APP_HIDE_LOG_SEE_ALSO

const testData = ref({
  testLogs: [] as any[],
  testResult: '',
  progress: 0,
})
const wsError = ref('')
const wsErrorMsg = ref('')
const wsErrorStack = ref('')
const showStack = ref(false)
const visible = ref(false)
const status = ref('')
const isTimeout = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

const colorMap = {
  passed: '#70AD47',
  waiting: '#aaaaaa',
  failed: '#f56c6c',
  warning: '#ffc107',
  ready: '#70AD47',
  invalid: '#f56c6c',
  testing: '#aaaaaa',
  unTest: '#aaaaaa',
}

const iconMap = {
  ready: 'check-circle-fill',
  invalid: 'circle-close-filled',
  testing: '',
  passed: 'check-circle-fill',
  waiting: 'question-fill',
  failed: 'circle-close-filled',
  unTest: '',
}

const statusMap = computed(() => ({
  ready: i18n.t('packages_business_dataForm_test_success'),
  invalid: i18n.t('packages_business_dataForm_test_fail'),
  testing: i18n.t('packages_business_dataForm_test_testing'),
  passed: i18n.t('packages_business_dataForm_test_success'),
  waiting: i18n.t('packages_business_dataForm_test_testing'),
  failed: i18n.t('packages_business_dataForm_test_fail'),
  unTest: i18n.t('packages_business_dataForm_test_unTest'),
}))

const showProgress = ref(true)
const fileInfo = ref({
  fileSize: 0,
  progress: 0,
  status: '',
})

const errorDialog = ref<ErrorDialog>({
  open: false,
  stack: '',
  solution: '',
  message: '',
  reason: '',
  seeAlso: [],
  isWarning: false,
  module: '',
  title: '',
})

const showTooltip = ref(false)
const expandErrorMessage = ref(false)

const handleLink = (val: string) => {
  openUrl(val)
}

const rowStyleHandler = ({ row }: { row: any }) => {
  return row.status === 'waiting' ? { background: '#fff' } : ''
}

const handleOpen = () => {
  visible.value = true
  handleWS()
}

const handleClose = () => {
  visible.value = false
}

const handleWS = () => {
  if (!$ws) return

  $ws.ready(() => {
    //接收数据
    $ws.on('testConnectionResult', (data: any) => {
      isTimeout.value = false //有回调
      const result = data.result || []
      wsError.value = data.status
      wsErrorMsg.value = data.error
      wsErrorStack.value = data.stack
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      const testDataResult = {
        wsError: data.status,
        testLogs: [] as any[],
        status: '',
      }
      if (result.response_body) {
        let validate_details = result.response_body.validate_details || []
        const details = validate_details.filter(
          (item: any) => item.status !== 'waiting',
        )
        if (details.length === 0) {
          validate_details = validate_details.map((item: any) => {
            item.status = 'unTest'
            return item
          })
        }

        testData.value.testLogs = validate_details
        testDataResult.testLogs = validate_details
        testDataResult.status = result.status
        status.value = result.status
      } else {
        const logs = testData.value.testLogs.map((item: any) => {
          item.status = 'invalid'
          return item
        })
        testData.value.testLogs = logs
        testDataResult.testLogs = logs
        testDataResult.status = data.status
        status.value = data.status
        wsError.value = data.status
      }
      emit('returnTestData', testDataResult)
    })
    //长连接失败
    $ws.on('testConnection', (data: any) => {
      wsError.value = data.status
      wsErrorMsg.value = data.error
      const testDataResult = {
        wsError: data.status,
      }
      emit('returnTestData', testDataResult)
    })
    //长连接失败
    $ws.on('pipe', (data: any) => {
      wsError.value = data.status
      wsErrorMsg.value = data.error
      const testDataResult = {
        wsError: data.status,
      }
      emit('returnTestData', testDataResult)
    })
  })
}

const start = (updateSchema?: boolean, editTest?: boolean) => {
  handleOpen()

  startTest(updateSchema, editTest)
}

const startTest = (updateSchema?: boolean, editTest?: boolean) => {
  const data = { ...props.connection }
  delete data.schema
  delete data.response_body
  wsError.value = ''
  wsErrorStack.value = ''
  showStack.value = false
  testData.value.testLogs = []

  if (props.testType === 'testExternalStorage') {
    // 外存测试特殊处理
    startByConnection(data, updateSchema, editTest)
    return
  }
  startDownLoadConnector(data, updateSchema, editTest)
}

const startByConnection = (
  connection: any,
  updateSchema?: boolean,
  editTest?: boolean,
) => {
  if (!$ws) return

  const msg = {
    type: props.testType || 'testConnection',
    data: {
      ...connection,
      updateSchema: false,
      editTest: false,
    },
  }

  if (updateSchema) {
    msg.data.updateSchema = updateSchema //是否需要更新Schema
  }
  if (editTest) {
    msg.data.editTest = editTest //是否编辑测试
  }

  $ws.ready(() => {
    $ws.send(msg)
    // 连接测试时出现access_token过期,重发消息
    $ws.once('401', () => {
      $ws.send(msg)
    })

    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      isTimeout.value = true //重置
      wsError.value = 'ERROR'
      wsErrorMsg.value = wsErrorMsg.value
        ? wsErrorMsg.value
        : i18n.t('packages_business_dataForm_test_retryTest')
      const testDataResult = {
        wsError: 'ERROR',
      }
      emit('returnTestData', testDataResult)
    }, 120000)
  })
}

const clearState = () => {
  clearTimeout(timer)

  if (!$ws) return

  $ws.off('testConnection')
  $ws.off('downloadPdkFileFlag')
  $ws.off('progressReporting')
  $ws.off('testConnectionResult')
  $ws.off('pipe')
  testData.value.testLogs = []
  status.value = ''
}

const startDownLoadConnector = (
  connection: any,
  updateSchema?: boolean,
  editTest?: boolean,
) => {
  if (!$ws) return

  fileInfo.value = {
    fileSize: 0,
    progress: 0,
    status: '',
  }
  const msg = {
    type: 'downLoadConnector',
    data: connection,
  }

  showProgress.value = false
  $ws.ready(() => {
    $ws.send(msg)
    // 连接测试时出现access_token过期,重发消息
    $ws.once('401', () => {
      $ws.send(msg)
    })

    // 检查下载器
    $ws.on('downloadPdkFileFlag', (data: any) => {
      showProgress.value = !!data.result
      if (!showProgress.value) {
        $ws.off('downloadPdkFileFlag')
        startLoadTestItems(connection, updateSchema, editTest)
        fileInfo.value.progress = 100
      }
    })
    // 下载器进度
    $ws.on('progressReporting', (data: any) => {
      const { fileSize = 0, progress = 0, status } = data.result || {}
      if (status === 'finish') {
        $ws.off('progressReporting')
        startLoadTestItems(connection, updateSchema, editTest)
        fileInfo.value.progress = 100
      } else {
        fileInfo.value = {
          fileSize,
          progress,
          status,
        }
      }
    })
    // 检查不到下载器
    $ws.on('unknown_event_result', () => {
      $ws.off('unknown_event_result')
      startLoadTestItems(connection, updateSchema, editTest)
    })
  })
}

const startLoadTestItems = (
  connection: any,
  updateSchema?: boolean,
  editTest?: boolean,
) => {
  startByConnection(connection, updateSchema, editTest)
}

const replaceKeyword = (str: string) => {
  return str
    ? str.replaceAll(/tapdata\s?/gi, import.meta.env.VUE_APP_KEYWORD)
    : ''
}

const showError = async (row: any) => {
  if (import.meta.env.VUE_APP_KEYWORD && row.item_exception) {
    row.item_exception.stack = replaceKeyword(row.item_exception.stack)
    row.item_exception.solution = replaceKeyword(row.item_exception.solution)
    row.item_exception.message = replaceKeyword(row.item_exception.message)
    row.item_exception.reason = replaceKeyword(row.item_exception.reason)
  }

  Object.assign(errorDialog.value, row.item_exception)
  errorDialog.value.title = row.show_msg
  errorDialog.value.status = row.status
  errorDialog.value.seeAlso = []
  errorDialog.value.module = ''
  errorDialog.value.isWarning = row.status === 'failed' && !row.required

  if (row.error_code) {
    const data = (await proxyApi
      .call({
        className: 'ErrorCodeService',
        method: 'getErrorCodeWithDynamic',
        args: [
          row.error_code,
          (i18n as any).locale === 'en' ? 'en' : 'cn',
          row.dynamicDescriptionParameters,
        ],
      })
      .catch((error) => {
        console.error(error)
      })) as ErrorCodeResponse

    if (data) {
      errorDialog.value.title = data.fullErrorCode || data.errorCode || ''
      errorDialog.value.message = data.describe || ''
      errorDialog.value.reason = data.dynamicDescribe || ''
      errorDialog.value.solution = data.solution || ''
      errorDialog.value.seeAlso = data.seeAlso || []
      errorDialog.value.module = data.module || ''
    }
  }
  errorDialog.value.open = true
}

const onCopy = () => {
  showTooltip.value = true
}

const switchShowStack = () => {
  showStack.value = !showStack.value
}

const handleCopyStack = (stack: string) => {
  copyToClipboard(stack)
  ElMessage.success(i18n.t('public_message_copy_success'))
}

const handleCreateTicket = () => {
  const errorCode = errorDialog.value.title

  window.open(
    router.resolve({
      name: 'TicketSystem',
      query: {
        form: encodeURIComponent(
          JSON.stringify({
            connectionId: props.connection?.id,
            subject: errorCode,
            description: `Error Code: ${errorCode}
Module: ${errorDialog.value.module || ''}
Describe: ${errorDialog.value.message ? `\n${errorDialog.value.message}` : ''}
Stack Trace: ${errorDialog.value.stack ? `\n${errorDialog.value.stack}` : ''}`,
          }),
        ),
      },
    }).href,
  )
}

const triggerLoadSchema = async () => {
  console.log('triggerLoadSchema', props.connection, props.connection.id)

  const parms = {
    loadCount: 0,
    loadFieldsStatus: 'loading',
  }

  await connectionsApi.updateById(props.connection.id, parms)

  startTest(true)
}

onBeforeUnmount(() => {
  clearState()
})

// Expose all methods to maintain compatibility
defineExpose({
  handleLink,
  rowStyleHandler,
  handleClose,
  handleWS,
  start,
  startByConnection,
  clearState,
  startDownLoadConnector,
  startLoadTestItems,
  replaceKeyword,
  showError,
  onCopy,
  switchShowStack,
  handleCopyStack,
  handleCreateTicket,
  triggerLoadSchema,
})
</script>

<template>
  <el-dialog
    v-model="visible"
    class="connection-test-dialog"
    width="780px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="clearState"
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
              v-if="!!wsErrorStack"
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
        <el-button type="primary" @click="handleClose">{{
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
