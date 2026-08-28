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
import { ref, watch } from 'vue'
import {
  ALARM_TEMPLATE_VARIABLES,
  DEFAULT_ALARM_HTML,
  DEFAULT_ALARM_TITLE,
  EMAIL_CARD_JUICE_CSS,
} from '../alarmTemplate'

import type { ElInput } from 'element-plus'

const visible = defineModel<boolean>({ default: false })
const props = defineProps<{
  title?: string
  content?: string
  disabled?: boolean
}>()
const emit = defineEmits<{
  save: [payload: { title: string; content: string }]
}>()

const { t } = useI18n()
const editor = ref<InstanceType<typeof TiptapEditor>>()
const titleInput = ref<InstanceType<typeof ElInput>>()
const draftTitle = ref('')
const draftContent = ref('')

watch(visible, (open) => {
  if (!open) return
  draftTitle.value = props.title || DEFAULT_ALARM_TITLE
  draftContent.value = props.content || DEFAULT_ALARM_HTML
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

function iconOf(kind: string) {
  if (kind === 'clock') return IconLucideClock
  if (kind === 'hash') return IconLucideHash
  if (kind === 'alert') return IconLucideTriangleAlert
  return IconLucideFileText
}

function variableToken(name: string) {
  return `{${name}}`
}

function insertVariable(variableName: string) {
  if (titleInput.value?.input === document.activeElement) {
    const input = titleInput.value.input as HTMLInputElement
    const start = input.selectionStart ?? draftTitle.value.length
    const end = input.selectionEnd ?? start
    const token = `{${variableName}}`
    draftTitle.value = `${draftTitle.value.slice(0, start)}${token}${draftTitle.value.slice(end)}`
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + token.length, start + token.length)
    }, 10)
    return
  }
  editor.value?.insertVariable(variableName)
}

function inlineContent() {
  draftContent.value = juice.inlineContent(draftContent.value, EMAIL_CARD_JUICE_CSS)
}

function restoreDefault() {
  draftTitle.value = DEFAULT_ALARM_TITLE
  draftContent.value = DEFAULT_ALARM_HTML
}

function onCancel() {
  visible.value = false
}

function onSave() {
  inlineContent()
  emit('save', { title: draftTitle.value, content: draftContent.value })
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('packages_business_workflow_alarm_template')"
    width="80vw"
    top="8vh"
    append-to-body
    class="workflow-alarm-template-dialog p-0"
  >
    <el-form label-position="top" class="p-4">
      <el-form-item :label="t('packages_business_workflow_alarm_title')">
        <el-input
          ref="titleInput"
          v-model="draftTitle"
          :disabled="disabled"
        />
      </el-form-item>
      <el-form-item :label="t('packages_business_workflow_alarm_message')">
        <TiptapEditor
          ref="editor"
          v-model="draftContent"
          class="w-100"
          editor-content-class="email-content-root"
          :extensions="extensions"
          @blur="inlineContent"
        />
      </el-form-item>
      <el-form-item>
        <template #label>
          <div class="flex flex-column">
            <span>{{ t('packages_business_available_variables') }}</span>
            <span class="fs-8 font-color-light">
              {{ t('packages_business_click_variable_name_insert_template') }}
            </span>
          </div>
        </template>
        <div class="variables flex flex-wrap gap-3">
          <span
            v-for="variable in ALARM_TEMPLATE_VARIABLES"
            :key="variable.name"
            class="variable-chip rounded-xl border px-3 py-2 flex align-center gap-3 hover:bg-light cursor-pointer"
            @mousedown.prevent="insertVariable(variable.name)"
          >
            <el-icon :size="18">
              <component :is="iconOf(variable.icon)" />
            </el-icon>
            <div class="flex flex-column lh-base">
              <span class="font-color-dark">{{ variableToken(variable.name) }}</span>
              <span class="font-color-light fs-8">{{ t(variable.labelKey) }}</span>
            </div>
          </span>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer-actions">
        <el-button :disabled="disabled" @click="restoreDefault">{{
          t('packages_business_workflow_alarm_restore_template')
        }}</el-button>
        <div class="dialog-footer-actions__main">
          <el-button @click="onCancel">{{ t('public_button_cancel') }}</el-button>
          <el-button type="primary" :disabled="disabled" @click="onSave">{{
            t('public_button_save')
          }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.workflow-alarm-template-dialog {
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
    overflow: auto;
  }
  .el-dialog__footer {
    padding: 16px 20px 20px;
  }
}

.dialog-footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  --btn-space: 0;
}

.dialog-footer-actions__main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.variable-chip {
  user-select: none;
}

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
    background: #eff6ff;
    border-radius: 50%;
    font-size: 24px;
  }
  h1 {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    text-align: center;
    margin: 0 0 8px 0 !important;
  }
}
</style>
