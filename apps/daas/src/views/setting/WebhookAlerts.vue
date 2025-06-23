<script setup lang="tsx">
import { settingsApi, webhookApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { VEmpty } from '@tap/component/src/base/v-empty'
import { CloseIcon } from '@tap/component/src/CloseIcon'
import { Modal } from '@tap/component/src/modal'
import { HighlightCode } from '@tap/form/src/components/highlight-code'
import { JsonEditor } from '@tap/form/src/components/json-editor'
import { useI18n } from '@tap/i18n'
import { nextTick, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

interface WebhookForm {
  id: string
  url: string
  open: boolean
  customTemplate: string
  hookTypes: string[]
  mark: string
  customHttpHeaders: string
}

interface WebhookItem extends WebhookForm {
  pingResult?: string
}

interface HistoryItem {
  id: string
  createAt: string
  createAtLabel: string
  historyStatus: string
  requestHeaders: string
  requestBody: string
  requestBodyFmt: string
  responseHeaders: string
  responseResult: string
  responseResultFmt: string
  responseType: string
  responseCode: string
  'x-event': string
}

interface EventDataItem {
  value: string
  label: string
  children: { label: string; value: string }[]
}

// Form validation
const validateUrl = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error(t('webhook_server_url_empty')))
  }
  // Fix: use non-capturing group to avoid linter error
  const urlRegex = /^https?:\/\/[^\s/$.?#].\S*$/
  if (!urlRegex.test(value)) {
    return callback(new Error(t('webhook_server_url_error')))
  }
  callback()
}

const validateHookTypes = (rule: any, value: string[], callback: any) => {
  if (!value?.length) {
    return callback(new Error(t('webhook_event_type_empty')))
  }
  callback()
}

// Data refs and reactives
const loading = ref(false)
const list = ref<WebhookItem[]>([])
const drawerState = reactive({
  visible: false,
  ping: false,
  saving: false,
  original: null as WebhookItem | null,
})

const form = reactive<WebhookForm>({
  id: '',
  url: '',
  open: true,
  customTemplate: `{
    "action": "TaskAlter",
    "hookId": "\${hookId}",
    "actionTime": "\${actionTime}",
    "title": "\${title}",
    "content": "\${content}",
    "actionData": {
      "status": "\${actionData.status}",
      "statusTxt":"\${actionData.statusTxt}",
      "level": "\${actionData.level}",
      "component":"\${actionData.component}",
      "componentTxt": "\${actionData.componentTxt}",
      "type":"\${actionData.type}",
      "typeTxt": "\${actionData.typeTxt}",
      "metric": "\${actionData.metric}",
      "metricTxt": "\${actionData.metricTxt}",
      "name":"\${actionData.name}",
      "node":"\${actionData.node}",
      "currentValue": "\${actionData.currentValue}",
      "threshold": "\${actionData.threshold}",
      "lastOccurrenceTime": "\${actionData.lastOccurrenceTime}",
      "tally": "\${actionData.tally}",
      "summary": "\${actionData.summary}",
      "recoveryTime": "\${actionData.recoveryTime}",
      "closeTime": "\${actionData.closeTime}",
      "closeBy": "\${actionData.closeBy}",
      "agentId": "\${actionData.agentId}"
    }
}`,
  hookTypes: [],
  mark: '',
  customHttpHeaders: '',
})

const rules = reactive<FormRules>({
  url: [{ required: true, validator: validateUrl, trigger: 'blur' }],
  hookTypes: [
    { required: true, validator: validateHookTypes, trigger: 'change' },
  ],
})

const eventData = ref<EventDataItem[]>([
  {
    value: 'task',
    label: t('public_task_alert'),
    children: [],
  },
])

const keyMap: Record<string, string> = {
  TASK_STATUS_ERROR: t(
    'packages_business_setting_alarmnotification_dangrenwuyudao',
  ),
  TASK_INSPECT_ERROR: t(
    'packages_business_setting_alarmnotification_dangrenwujiaoyan',
  ),
  TASK_FULL_COMPLETE: t(
    'packages_business_setting_alarmnotification_dangrenwuquanliang',
  ),
  TASK_INCREMENT_START: t(
    'packages_business_setting_alarmnotification_dangrenwuzengliang',
  ),
  TASK_STATUS_STOP: t(
    'packages_business_setting_alarmnotification_dangrenwutingzhi',
  ),
  TASK_INCREMENT_DELAY: t(
    'packages_business_setting_alarmnotification_dangrenwudezeng',
  ),
  DATANODE_CANNOT_CONNECT: t(
    'packages_business_setting_alarmnotification_dangshujuwufa',
  ),
  DATANODE_HTTP_CONNECT_CONSUME: t(
    'packages_business_setting_alarmnotification_dangshujuyuanwang',
  ),
  DATANODE_TCP_CONNECT_CONSUME: t(
    'packages_business_setting_alarmnotification_dangshujuyuanxie',
  ),
  DATANODE_AVERAGE_HANDLE_CONSUME: t(
    'packages_business_setting_alarmnotification_dangshujuyuanjie',
  ),
  PROCESSNODE_AVERAGE_HANDLE_CONSUME: t(
    'packages_business_setting_alarmnotification_dangjiediandeping',
  ),
  INSPECT_TASK_ERROR: t(
    'packages_business_setting_alarmnotification_dangjiaoyanrenwucuowu',
  ),
  INSPECT_COUNT_ERROR: t(
    'packages_business_setting_alarmnotification_dangjiaoyanrenwushuliangcuowu',
  ),
  INSPECT_VALUE_ERROR: t(
    'packages_business_setting_alarmnotification_dangjiaoyanrenwuzhicuowu',
  ),
  SYSTEM_FLOW_EGINGE_DOWN: t(
    'packages_business_setting_alarmnotification_dangrenwustop',
  ),
  SYSTEM_FLOW_EGINGE_UP: t(
    'packages_business_setting_alarmnotification_dangrenwuuP',
  ),
}

const historyState = reactive({
  visible: false,
  loading: false,
  list: [] as HistoryItem[],
  collapse: [] as string[],
  id: '',
})

const page = reactive({
  current: 1,
  size: 20,
  total: 0,
})

const switchStateMap = reactive<Record<string, boolean>>({})
const resendStateMap = reactive<Record<string, boolean>>({})

// Refs
const formRef = ref<FormInstance>()
const formWrapperRef = ref<HTMLElement>()
const historyListRef = ref<HTMLElement>()
let jsonEditor: any = null

// Methods
const loadData = async () => {
  loading.value = true
  const filter = {
    order: 'createTime DESC',
  }
  try {
    const { items = [] } = await webhookApi.list({
      filter: JSON.stringify(filter),
    })
    list.value = items
  } finally {
    loading.value = false
  }
}

const loadEventType = async () => {
  const data = await settingsApi.findAlarm()
  eventData.value[0].children = data.map((item: any) => ({
    label: keyMap[item.key],
    value: item.key,
  }))
}

const afterClose = () => {
  formRef.value?.resetFields()
  form.id = ''
}

const addWebhook = async () => {
  drawerState.visible = true
  formRef.value?.clearValidate()

  await nextTick()
  jsonEditor?.resize()
  formWrapperRef.value && (formWrapperRef.value.scrollTop = 0)
}

const viewDetail = async (row: WebhookItem) => {
  drawerState.visible = true
  drawerState.original = row
  await nextTick()

  Object.keys(form).forEach((key) => {
    // @ts-ignore - dynamic key access
    form[key] = row[key]
  })
  jsonEditor?.resize()
  formWrapperRef.value && (formWrapperRef.value.scrollTop = 0)
}

const viewHistory = async ({ id }: { id: string }) => {
  historyState.visible = true
  historyState.loading = true
  historyState.id = id
  loadHistory()

  await nextTick()
  historyListRef.value && (historyListRef.value.scrollTop = 0)
}

const mapHistory = (item: any): HistoryItem => {
  item.createAtLabel = dayjs(item.createAt).format('YYYY-MM-DD HH:mm:ss')
  if (item.responseResult) {
    item.responseResultFmt = item.responseResult
    item.responseType = 'html'
    if (/content-Type: application\/json/i.test(item.responseHeaders)) {
      item.responseType = 'json'
      item.responseResultFmt = JSON.stringify(
        JSON.parse(item.responseResult),
        null,
        2,
      )
    }
  }

  if (item.requestBody) {
    item.requestBodyFmt = JSON.stringify(JSON.parse(item.requestBody), null, 2)
  }

  if (item.requestHeaders) {
    const result = item.requestHeaders.match(/X-Event:\s*(.*)/i)
    const event = result?.[1] || ''

    item['x-event'] = keyMap[event]

    if (item['x-event']) {
      item['x-event'] = item['x-event']
        .replace(/^当|When the?|當/, '')
        .replace(/时|時$/, '')
    } else {
      item['x-event'] = event || '--'
    }
  }
  return item
}

const loadHistory = (pageNum = 1) => {
  webhookApi
    .history({
      hookId: historyState.id,
      pageFrom: (pageNum - 1) * page.size,
      pageSize: page.size,
    })
    .then(({ items, total }: { items: any[]; total: number }) => {
      historyState.list = items.map(mapHistory)
      page.total = total
    })
    .finally(() => (historyState.loading = false))
}

const delWebhook = async ({ id }: { id: string }) => {
  const confirmed = await Modal.confirm(
    t('packages_ldp_src_tablepreview_querenshanchu'),
  )

  if (confirmed) {
    await webhookApi.deleteOne(id)
    await loadData()
  }
}

const sendPing = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      drawerState.ping = true
      webhookApi
        .ping(form)
        .then((data) => {
          ElMessage.success(t('public_message_send_success'))

          if (form.id) {
            viewHistory({ id: form.id })

            if (data?.status && drawerState.original) {
              drawerState.original.pingResult = data.status
            }
          }
        })
        .finally(() => (drawerState.ping = false))
    }
  })
}

const save = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      drawerState.saving = true
      webhookApi[form.id ? 'update' : 'save'](form)
        .then(() => {
          ElMessage.success(t('public_message_save_ok'))
          drawerState.visible = false
          loadData()
        })
        .finally(() => (drawerState.saving = false))
    }
  })
}

const handleSwitch = (row: WebhookItem) => {
  switchStateMap[row.id] = true
  webhookApi[row.open ? 'close' : 'open'](row.id)
    .then(() => {
      row.open = !row.open
      ElMessage.success(t('public_message_operation_success'))
    })
    .catch(() => {
      row.open = !row.open
    })
    .finally(() => {
      delete switchStateMap[row.id]
    })
}

const reSend = async (request: HistoryItem) => {
  resendStateMap[request.id] = true
  try {
    const result = await webhookApi.resend(request)
    Object.assign(request, mapHistory(result))
    ElMessage.success(t('public_message_send_success'))
  } finally {
    delete resendStateMap[request.id]
  }
}

const afterCloseHistory = () => {
  historyState.collapse = []
}

const initJsonEditor = (editor: any) => {
  jsonEditor = editor
}

const showExample = () => {
  ElMessageBox({
    title: t('public_template_example'),
    showClose: true,
    closeIcon: CloseIcon,
    customClass: 'w-80 max-w-1000',
    message: () => (
      <HighlightCode
        class="m-0 rounded-xl overflow-hidden"
        theme="atom-one-light"
        code={t('webhook_custom_template_tip')}
        language="json"
      />
    ),
    confirmButtonText: t('public_button_close'),
  })
}

const handleBeforeClose = async (done: () => void) => {
  const confirmed = await Modal.confirm(t('public_current_is_editing'))

  if (confirmed) {
    done()
  }
}

// Lifecycle hooks
onMounted(() => {
  loadEventType()
  loadData()
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton class="ml-auto" type="primary" @click="addWebhook">{{
        $t('webhook_alerts_add')
      }}</ElButton>
    </template>
    <ElTable v-loading="loading" row-key="id" :data="list" height="100%">
      <el-table-column
        show-overflow-tooltip
        class-name="text-nowrap"
        :label="$t('webhook_server_url')"
        prop="url"
      />
      <el-table-column
        show-overflow-tooltip
        class-name="text-nowrap"
        :label="$t('public_remark')"
        prop="mark"
        width="240"
      />
      <el-table-column
        :label="$t('public_status')"
        prop="pingResult"
        width="100"
      >
        <template #default="{ row }">
          <VIcon
            v-if="row.pingResult === 'SUCCEED'"
            size="20"
            class="color-success"
            >success-filled</VIcon
          >
          <VIcon v-else class="color-danger" size="20"
            >circle-close-filled</VIcon
          >
        </template>
      </el-table-column>
      <el-table-column :label="$t('webhook_switch')" prop="open" width="120">
        <template #default="{ row }">
          <ElSwitch
            :disabled="switchStateMap[row.id]"
            :value="row.open"
            @change="handleSwitch(row)"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_operation')" width="240">
        <template #default="{ row }">
          <div class="flex gap-2 align-center">
            <ElButton text type="primary" @click="viewDetail(row)"
              >{{ $t('public_button_details') }}
            </ElButton>
            <ElDivider direction="vertical" class="mx-0" />
            <ElButton text type="primary" @click="viewHistory(row)"
              >{{ $t('webhook_send_log') }}
            </ElButton>
            <ElDivider direction="vertical" class="mx-0" />
            <ElButton text type="danger" @click="delWebhook(row)"
              >{{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </el-table-column>
    </ElTable>

    <ElDrawer
      v-model="drawerState.visible"
      :wrapper-closable="false"
      :size="800"
      modal-class="bg-transparent"
      :before-close="handleBeforeClose"
      @closed="afterClose"
    >
      <template #title>
        <span class="fs-6 font-color-dark fw-sub">{{
          $t(form.id ? 'webhook_alerts_detail' : 'webhook_alerts_add')
        }}</span>
      </template>
      <div class="flex flex-column h-100">
        <div ref="formWrapperRef" class="flex-1">
          <ElForm
            ref="formRef"
            class="flex-1"
            label-position="top"
            :model="form"
            :rules="rules"
          >
            <ElFormItem :label="$t('webhook_event_type')" prop="hookTypes">
              <ElTreeSelect
                v-model="form.hookTypes"
                collapse-tags
                filterable
                multiple
                show-checkbox
                :data="eventData"
                class="w-100"
              />
            </ElFormItem>
            <ElFormItem :label="$t('webhook_server_url')" prop="url">
              <ElInput v-model="form.url" />
            </ElFormItem>
            <ElFormItem :label="$t('http_header')" prop="customHttpHeaders">
              <ElInput
                v-model="form.customHttpHeaders"
                :placeholder="$t('http_header_ph')"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 6 }"
              />
            </ElFormItem>
            <ElFormItem prop="customTemplate">
              <template #label>
                <span>
                  <span class="align-middle mr-1">{{
                    $t('webhook_custom_template')
                  }}</span>
                  <el-button text type="primary" @click="showExample">
                    <VIcon class="mr-1">question-circle</VIcon
                    >{{ $t('public_button_check') }}</el-button
                  >
                </span>
              </template>
              <JsonEditor
                v-model:value="form.customTemplate"
                height="320"
                :options="{
                  options: { showPrintMargin: false, useWrapMode: true },
                }"
                @init="initJsonEditor"
              />
            </ElFormItem>
            <ElFormItem :label="$t('public_remark')" prop="mark">
              <ElInput v-model="form.mark" />
            </ElFormItem>
          </ElForm>
        </div>
      </div>

      <template #footer>
        <ElButton @click="drawerState.visible = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          :loading="drawerState.ping"
          type="primary"
          @click="sendPing"
          >{{ $t('webhook_send_ping') }}</ElButton
        >
        <ElButton :loading="drawerState.saving" type="primary" @click="save">{{
          $t('public_button_save')
        }}</ElButton>
      </template>
    </ElDrawer>

    <ElDrawer
      v-model="historyState.visible"
      modal-class="bg-transparent"
      :wrapper-closable="false"
      :size="800"
      @closed="afterCloseHistory"
    >
      <template #title>
        <span>
          <span class="fs-6 font-color-dark fw-sub">{{
            $t('webhook_send_log')
          }}</span>
          <span class="font-color-sslight ml-2">{{
            $t('webhook_send_log_desc')
          }}</span>
        </span>
      </template>
      <div v-loading="historyState.loading" class="flex flex-column h-100">
        <div ref="historyListRef" class="flex-1">
          <el-collapse
            v-if="historyState.list.length"
            v-model="historyState.collapse"
            class="history-collapse"
          >
            <el-collapse-item
              v-for="item in historyState.list"
              :key="item.id"
              class="rounded-lg"
            >
              <template #title>
                <div class="flex align-center flex-1 pl-3">
                  <VIcon
                    v-if="item.historyStatus === 'SUCCEED'"
                    size="16"
                    class="color-success"
                    >success-filled</VIcon
                  >
                  <VIcon v-else class="color-danger" size="16"
                    >circle-close-filled</VIcon
                  >
                  <span class="ml-2">{{ item['x-event'] }}</span>
                  <span class="ml-auto pr-4">{{ item.createAtLabel }}</span>
                </div>
              </template>
              <div class="position-relative">
                <ElTabs>
                  <ElTabPane :label="$t('public_request')">
                    <div class="px-4">
                      <div class="lh-base">
                        {{ $t('public_request_headers') }}
                      </div>
                      <HighlightCode
                        class="rounded-lg mt-2 mb-4 overflow-hidden"
                        :code="item.requestHeaders || '--'"
                        language="http"
                        copy
                      />

                      <div class="lh-base">
                        {{ $t('public_request_content') }}
                      </div>
                      <div>
                        <HighlightCode
                          class="rounded-lg mt-2 mb-4 overflow-hidden"
                          :code="item.requestBodyFmt"
                          language="json"
                          copy
                        />
                      </div>
                    </div>
                  </ElTabPane>
                  <ElTabPane>
                    <template #label>
                      <span>
                        {{ $t('public_response') }}
                        <ElTag type="info" class="rounded-pill ml-1">{{
                          item.responseCode || '--'
                        }}</ElTag>
                      </span>
                    </template>
                    <div class="px-4">
                      <div class="lh-base">
                        {{ $t('public_response_headers') }}
                      </div>
                      <HighlightCode
                        class="rounded-lg mt-2 mb-4 overflow-hidden"
                        :code="item.responseHeaders || '--'"
                        language="http"
                        copy
                      />

                      <div class="lh-base">
                        {{ $t('public_response_content') }}
                      </div>
                      <HighlightCode
                        class="rounded-lg mt-2 mb-4 overflow-hidden"
                        :code="item.responseResultFmt || '--'"
                        :language="item.responseType"
                        copy
                      />
                    </div>
                  </ElTabPane>
                </ElTabs>
                <ElButton
                  class="position-absolute tabs-extra-btn flex align-center py-0"
                  :loading="resendStateMap[item.id]"
                  @click="reSend(item)"
                  >{{ $t('public_resend') }}</ElButton
                >
              </div>
            </el-collapse-item>
          </el-collapse>

          <VEmpty v-else />
        </div>
      </div>

      <template #footer>
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          background
          layout="->,total, sizes,  prev, pager, next"
          :page-sizes="[10, 20, 50, 100]"
          :total="page.total"
          @size-change="loadHistory(1)"
          @current-change="loadHistory"
        />
      </template>
    </ElDrawer>
  </PageContainer>
</template>

<style scoped lang="scss">
$unreadColor: #ee5353;
// .settingCenter {
// 	height: 100%;
// 	font-size: 12px;
// 	.setting-main {
// 		display: flex;
// 		justify-content: space-between;
// 		height: 100%;
.account {
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 30px 0 0 20px;
  .title {
    padding-bottom: 20px;
    font-size: 14px;
    color: var(--text-dark);
    font-weight: bold;
  }
  .content {
    width: 600px;
    li {
      display: flex;
      padding: 20px 0;
      .label {
        width: 80px;
      }
      .text {
        width: 400px;
      }
      :deep(.el-button.el-button--text) {
        padding: 0;
      }
      i {
        cursor: pointer;
      }
      .rotateActive {
        transform: rotate(-360deg);
        transition: all 1s;
      }
      .backActive {
        transition: all 1s;
      }
    }
  }
}

.tabs-extra-btn {
  top: 0;
  right: 16px;
  height: 28px;
}

.history-collapse {
  $bg: #f5f7fa;
  :deep(.el-collapse-item) {
    .el-collapse-item__wrap {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    .el-collapse-item__content {
      padding-bottom: 0;
    }
    .el-collapse-item__header {
      border-radius: 8px;
      &:hover {
        background-color: $bg;
      }
    }

    .el-collapse-item.is-active {
      background-color: $bg;
      .el-collapse-item__header,
      .el-collapse-item__wrap {
        background-color: $bg;
      }
    }
  }

  :deep(.hljs) {
    background: #fff !important;
  }
}
.el-table {
  :deep(.text-nowrap .cell) {
    white-space: nowrap;
  }
}
</style>

<style lang="scss">
.account {
  .form {
    .eye {
      cursor: pointer;
      font-size: 18px;
    }
    // .el-input__inner {
    //   border: 0;
    //   border-radius: 0;
    //   border-bottom: 1px solid #d9d9d9;
    // }
  }
}
</style>
