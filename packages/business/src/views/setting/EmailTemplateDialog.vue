<script setup lang="ts">
import {
  Bold,
  CodeBlock,
  Color,
  DivBlock,
  Document,
  FontSize,
  Highlight,
  Indent,
  Italic,
  ListItem,
  Paragraph,
  SystemVariable,
  Text,
  TiptapEditor,
  Underline,
} from '@tap/component/src/tiptap-editor'
import { useI18n } from '@tap/i18n'
import juice from 'juice/client'
import { computed, reactive, ref } from 'vue'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'

import type { ElInput } from 'element-plus'

defineProps<{
  keyMapping: Record<string, string>
  hideMenu?: boolean
}>()

const { t } = useI18n()

const editor = ref<InstanceType<typeof TiptapEditor>>()
const titleInput = ref<InstanceType<typeof ElInput>>()

const activeType = ref('')
const visible = ref(false)
const rulesList = ref([])

const form = ref({
  emailAlarmTitle: '',
  emailAlarmContent: '',
})

const variablesMap = reactive({
  TASK_STATUS_ERROR: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'errorTime',
      label: t('public_error_time'),
      icon: IconLucideClock,
    },
    {
      name: 'errorLog',
      label: t('public_error_log'),
      icon: IconLucideTriangleAlert,
    },
  ],
  TASK_INSPECT_ERROR: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
  ],
  TASK_FULL_COMPLETE: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'completeTime',
      label: t('public_complete_time'),
      icon: IconLucideClock,
    },
  ],
  TASK_INCREMENT_START: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'cdcTime',
      label: t('public_cdc_time'),
      icon: IconLucideClock,
    },
  ],
  TASK_STATUS_STOP: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'stopTime',
      label: t('public_stop_time'),
      icon: IconLucideClock,
    },
  ],
  TASK_INCREMENT_DELAY: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'delayTime',
      label: t('public_delay_time'),
      icon: IconLucideClock,
    },
  ],
  DATANODE_CANNOT_CONNECT: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
  ],
  DATANODE_HTTP_CONNECT_CONSUME: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
  ],
  DATANODE_TCP_CONNECT_CONSUME: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
  ],
  DATANODE_AVERAGE_HANDLE_CONSUME: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'nodeName',
      label: t('public_node_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'costTime',
      label: t('public_current_cost_time'),
      icon: IconLucideClock,
    },
    {
      name: 'threshold',
      label: t('public_threshold'),
      icon: IconLucideClock,
    },
    {
      name: 'occurredTime',
      label: t('public_occurred_time'),
      icon: IconLucideClock,
    },
  ],
  PROCESSNODE_AVERAGE_HANDLE_CONSUME: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'nodeName',
      label: t('public_node_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'costTime',
      label: t('public_current_cost_time'),
      icon: IconLucideClock,
    },
    {
      name: 'threshold',
      label: t('public_threshold'),
      icon: IconLucideClock,
    },
    {
      name: 'occurredTime',
      label: t('public_occurred_time'),
      icon: IconLucideClock,
    },
  ],
  INSPECT_TASK_ERROR: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'errorTime',
      label: t('public_error_time'),
      icon: IconLucideClock,
    },
  ],
  INSPECT_COUNT_ERROR: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'count',
      label: t('public_difference_line_count'),
      icon: IconLucideHash,
    },
  ],
  INSPECT_VALUE_ERROR: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'count',
      label: t('public_difference_line_count'),
      icon: IconLucideHash,
    },
  ],
  SYSTEM_FLOW_EGINGE_DOWN: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
  ],
  SYSTEM_FLOW_EGINGE_UP: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
  ],
  TASK_INSPECT_DIFFERENCE: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
  ],
  TASK_RETRY_WARN: [
    {
      name: 'taskName',
      label: t('public_task_name'),
      icon: IconLucideFileText,
    },
    {
      name: 'retryTimes',
      label: t('public_retry_times'),
      icon: IconLucideClock,
    },
    {
      name: 'retryThreshold',
      label: t('public_retry_threshold'),
      icon: IconLucideHash,
    },
  ],
  license_alarm_template: [
    {
      name: 'level',
      label: t('packages_dag_components_alert_gaojingjibie'),
      icon: IconLucideFileText,
    },
    {
      name: 'remainingDays',
      label: t('public_remaining_days'),
      icon: IconLucideFileText,
    },
    {
      name: 'remainingDaysThreshold',
      label: t('public_remaining_days_threshold'),
      icon: IconLucideFileText,
    },
  ],
})

const availableVariables = computed(() => {
  return variablesMap[activeType.value]
})

const extensions = [
  FontSize,
  Color,
  Highlight,
  Bold,
  Document,
  Paragraph,
  Text,
  Italic,
  Underline,
  ListItem,
  SystemVariable,
  Indent,
  CodeBlock,
  DivBlock,
]

const insertVariable = (variableName) => {
  if (titleInput.value?.input === document.activeElement) {
    const input = titleInput.value.input as HTMLInputElement
    const start = input.selectionStart
    const end = input.selectionEnd
    const size = `{${variableName}}`.length
    form.value.emailAlarmTitle = `${form.value.emailAlarmTitle.slice(0, start)}{${variableName}}${form.value.emailAlarmTitle.slice(end)}`
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + size, start + size)
    }, 10)
  } else if (editor.value) {
    editor.value.insertVariable(variableName)
  }
}

const handleSelectType = (item) => {
  activeType.value = item.key
  form.value = item

  //   form.value.emailAlarmContent = `<div class="email-content-root" style="max-width: 600px;
  //     margin: 20px auto;
  //     background: #ffffff;
  //     border: 1px solid #e5e7eb;
  //     border-radius: 12px;
  //     padding: 32px;
  //     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  //     color: #374151;
  //     line-height: 1.6;box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
  //     <div class="email-root-header">
  //       <div class="email-root-header-icon">⚠️</div>
  //     </div>
  //     <h1>System Alert Notification</h1>
  //     <hr>
  //     <p><strong>Task Name</strong></p>
  //     <p>{taskName}</p>
  //     <p><strong>Error Time</strong></p>
  //     <p><code>{errorTime}</code></p>
  //     <p><strong>Error Details</strong></p>
  //     <pre><code>{errorLog}</code></pre>
  //     <hr>
  //     <p><em>This email is sent by TapData</em>
  //     </p>
  // </div>
  // `
}

const open = (data) => {
  visible.value = true
  rulesList.value = data.map((item) => ({
    key: item.key,
    emailAlarmTitle: item.emailAlarmTitle,
    emailAlarmContent: item.emailAlarmContent,
  }))

  handleSelectType(rulesList.value[0])
}

const emit = defineEmits(['save'])

const onSave = () => {
  emit('save', rulesList.value)
  visible.value = false
}

const onCancel = () => {
  visible.value = false
}

const handleEditorChange = () => {
  form.value.emailAlarmContent = juice.inlineContent(
    form.value.emailAlarmContent,
    `
    .email-content-root {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .email-root-header {
      text-align: center;
      margin-bottom: 16px;
    }
    .email-root-header-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #fef2f2;
      border-radius: 50%;
      font-size: 24px;
    }

    .email-root-header-icon > .ace-line {
      margin: 0;
      font-size: inherit;
    }

    .ace-line {
      margin: 8px 0;
      font-size: 14px;
    }

    .ace-line + .ace-line {
      margin-top: 16px;
    }

    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      text-align: center;
      margin: 0 0 8px 0 !important;
    }

    h1 + .ace-line {
      color: #6b7280;
      font-size: 14px;
      text-align: center;
      margin: 0 0 32px 0;
    }

    hr {
      height: 1px;
      background: #f3f4f6;
      border: none;
      margin: 24px 0;
    }

    .ace-line strong {
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ace-line:has(strong) {
      margin: 16px 0 4px 0;
    }

    pre {
      background-color: rgba(56, 56, 56, 0.04);
      color: rgba(30, 32, 36, 0.95);
      border: 1px solid rgba(37, 39, 45, 0.1);
      margin-top: 1rem;
      margin-bottom: 1rem;
      padding: 1em;
      font-size: 1rem;
      border-radius: 12px;
      white-space: pre-wrap;
    }

    code {
      background-color: rgba(15, 22, 36, 0.05);
      border: 1px solid rgba(37, 39, 45, 0.1);
      font-family:
        JetBrains Mono NL,
        monospace;
      font-size: 0.875em;
      line-height: 1.4;
      border-radius: 6px / 0.375rem;
      padding: 0.1em 0.2em;
    }

    pre code {
      background-color: rgba(0, 0, 0, 0);
      border: none;
      border-radius: 0;
      -webkit-text-fill-color: inherit;
      color: inherit;
    }

    .ace-line:has(em) {
      color: #9ca3af;
      font-size: 12px;
      line-height: 1.4;
      text-align: center;
      margin: 16px 0 0 0;
    }

    .ace-line em {
      font-style: normal;
    }
  }`,
  )
}

defineExpose({
  open,
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="$t('packages_business_custom_mail_template')"
    width="80vw"
    top="10vh"
    append-to-body
    class="mail-template-dialog p-0"
  >
    <div class="border-top border-bottom flex flex-1 min-h-0">
      <div v-if="!hideMenu" class="flex flex-column">
        <el-scrollbar class="bg-light">
          <div class="p-3 pl-4">
            <div class="font-color-light mb-3 px-2">
              {{ $t('packages_business_alarm_type') }}
            </div>

            <div class="flex flex-column gap-1 menu-list">
              <div
                v-for="(item, i) in rulesList"
                :key="i"
                class="p-2 rounded-lg cursor-pointer menu-list-item"
                :class="{ active: activeType === item.key }"
                @click="handleSelectType(item)"
              >
                <OverflowTooltip
                  placement="top"
                  class="menu-list-item-title"
                  :text="keyMapping[item.key]"
                />
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div class="flex-1 p-4 border-start overflow-y-auto">
        <el-form label-position="top">
          <el-form-item :label="$t('packages_business_mail_title')">
            <el-input ref="titleInput" v-model="form.emailAlarmTitle" />
          </el-form-item>

          <el-form-item :label="$t('packages_business_mail_content')">
            <TiptapEditor
              ref="editor"
              v-model="form.emailAlarmContent"
              class="w-100"
              editor-content-class="email-content-root"
              :extensions="extensions"
              @blur="handleEditorChange"
            />
          </el-form-item>

          <el-form-item>
            <template #label>
              <div class="flex flex-column">
                <span>{{ $t('packages_business_available_variables') }}</span>
                <span class="fs-8 font-color-light">
                  {{
                    $t('packages_business_click_variable_name_insert_template')
                  }}
                </span>
              </div>
            </template>
            <div class="variables flex flex-wrap gap-3">
              <span
                v-for="variable in availableVariables"
                :key="variable.name"
                class="variable-chip rounded-xl border px-3 py-2 flex align-center gap-3 hover:bg-light cursor-pointer"
                @mousedown="insertVariable(variable.name)"
              >
                <el-icon :size="18">
                  <component :is="variable.icon" />
                </el-icon>

                <div class="flex flex-column lh-base">
                  <span class="font-color-dark">{{
                    `\{${variable.name}\}`
                  }}</span>
                  <span class="font-color-light fs-8">{{
                    variable.label
                  }}</span>
                </div>
              </span>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button @click="onCancel">{{ $t('public_button_cancel') }}</el-button>
      <el-button type="primary" @click="onSave">{{
        $t('public_button_save')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.email-content-root {
  .email-root-header {
    text-align: center;
    margin-bottom: 16px;
  }
  .email-root-header-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: #fef2f2;
    border-radius: 50%;
    font-size: 24px;
  }

  .email-root-header-icon > .ace-line {
    margin: 0;
    font-size: inherit;
  }

  .ace-line {
    margin: 8px 0;
    font-size: 14px;
  }

  .ace-line + .ace-line {
    margin-top: 16px;
  }

  /* 标题样式 */
  h1 {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    text-align: center;
    margin: 0 0 8px 0 !important;
  }

  /* 副标题（紧跟在h1后的第一个p） */
  h1 + .ace-line {
    color: #6b7280;
    font-size: 14px;
    text-align: center;
    margin: 0 0 32px 0;
  }

  /* 分隔线 */
  hr {
    height: 1px;
    background: #f3f4f6;
    border: none;
    margin: 24px 0;
  }

  /* 标签样式（包含strong的段落） */
  .ace-line strong {
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .ace-line:has(strong) {
    margin: 16px 0 4px 0;
  }

  pre {
    background-color: rgba(56, 56, 56, 0.04);
    color: rgba(30, 32, 36, 0.95);
    border: 1px solid rgba(37, 39, 45, 0.1);
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding: 1em;
    font-size: 1rem;
    border-radius: 12px;
    white-space: pre-wrap;
  }

  code {
    background-color: rgba(15, 22, 36, 0.05);
    border: 1px solid rgba(37, 39, 45, 0.1);
    font-family:
      JetBrains Mono NL,
      monospace;
    font-size: 0.875em;
    line-height: 1.4;
    border-radius: 6px / 0.375rem;
    padding: 0.1em 0.2em;
  }

  pre code {
    background-color: rgba(0, 0, 0, 0);
    border: none;
    border-radius: 0;
    -webkit-text-fill-color: inherit;
    color: inherit;
  }

  /* 页脚文本样式 */
  .ace-line:has(em) {
    color: #9ca3af;
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
    margin: 16px 0 0 0;
  }

  .ace-line em {
    font-style: normal;
  }
}

.mail-template-dialog {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__footer {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .menu-list {
    max-width: 300px;
    .menu-list-item {
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px;
      height: 32px;
      cursor: pointer;
      white-space: nowrap;
      user-select: none;
      .menu-list-item-title {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: var(--fill-hover);
      }
    }

    .menu-list-item.active {
      background: var(--primary-hover-light);
      color: var(--el-color-primary);
      &::after {
        background: var(--el-color-primary);
        border-radius: 0.375rem;
        content: '';
        height: 20px;
        left: -0.5rem;
        position: absolute;
        top: calc(50% - 10px);
        width: 0.25rem;
      }
    }
  }
}
</style>
