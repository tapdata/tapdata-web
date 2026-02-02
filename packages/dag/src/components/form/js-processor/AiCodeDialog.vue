<script setup lang="ts">
import { generateAiCodeStream } from '@tap/api/src/core/ai'
import { Highlight } from '@tap/component'
import { useI18n } from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  currentCode?: string
  fields?: any[]
}>()

const visible = ref(false)
const userInput = ref('')
const loading = ref(false)
const errorMessage = ref('')
const streamingContent = ref('')
const generatedCode = ref('')
const codePreviewRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// AbortController for cancelling SSE request
let abortController: AbortController | null = null

const emit = defineEmits<{
  (e: 'generate', code: string): void
}>()

// Quick command buttons
const quickCommands = computed(() => [
  { text: t('packages_dag_ai_code_dialog_cmd_camel_case') },
  { text: t('packages_dag_ai_code_dialog_cmd_filter_empty') },
  { text: t('packages_dag_ai_code_dialog_cmd_add_timestamp') },
  { text: t('packages_dag_ai_code_dialog_cmd_round_numbers') },
  { text: t('packages_dag_ai_code_dialog_cmd_merge_fields') },
])

/**
 * Extract code from streaming markdown content
 * Handles incomplete markdown like: ```javascript\nfunction...
 */
const extractCodeFromMarkdown = (content: string): string => {
  // Try to match code block with or without closing ```
  const codeBlockMatch = content.match(
    /```(?:javascript|js)?\n?([\s\S]*?)(?:```|$)/,
  )
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim()
  }
  return content.trim()
}

// Computed property for display code (extracted from markdown)
const displayCode = computed(() => {
  if (generatedCode.value) {
    return generatedCode.value
  }
  if (streamingContent.value) {
    return extractCodeFromMarkdown(streamingContent.value)
  }
  return ''
})

const handleQuickCommand = (text: string) => {
  userInput.value = text
}

const scrollToBottom = () => {
  nextTick(() => {
    if (codePreviewRef.value) {
      codePreviewRef.value.scrollTop = codePreviewRef.value.scrollHeight
    }
  })
}

const handleCopy = async () => {
  await copyToClipboard(displayCode.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const handleGenerate = () => {
  if (!userInput.value.trim()) return

  loading.value = true
  errorMessage.value = ''
  streamingContent.value = ''
  generatedCode.value = ''

  abortController = generateAiCodeStream(
    { prompt: userInput.value, fields: props.fields },
    {
      onChunk: (content: string) => {
        streamingContent.value += content
        scrollToBottom()
      },
      onDone: (code: string) => {
        loading.value = false
        generatedCode.value = code
        streamingContent.value = ''
        ElMessage.success(t('packages_dag_ai_code_dialog_generate_success'))
      },
      onError: (error: string) => {
        loading.value = false
        errorMessage.value = error
        ElMessage.error(
          error || t('packages_dag_ai_code_dialog_generate_failed'),
        )
      },
    },
  )
}

const handleApply = () => {
  if (generatedCode.value) {
    emit('generate', generatedCode.value)
    visible.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}

const handleClose = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  visible.value = false
  userInput.value = ''
  loading.value = false
  errorMessage.value = ''
  streamingContent.value = ''
  generatedCode.value = ''
}

const open = () => {
  visible.value = true
}

onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort()
  }
})

defineExpose({
  open,
})
</script>

<template>
  <ElDialog
    v-model="visible"
    width="600px"
    :show-close="true"
    :close-on-click-modal="false"
    append-to-body
    @closed="handleClose"
  >
    <template #header="{ titleClass }">
      <div class="flex align-center gap-2">
        <div
          class="flex justify-center align-center p-2 header-icon color-white rounded-xl shadow-sm"
        >
          <el-icon :size="20"><i-lucide-sparkles /></el-icon>
        </div>

        <div>
          <div :class="titleClass">
            {{ t('packages_dag_ai_code_dialog_title') }}
          </div>
          <div class="ai-code-dialog__subtitle text-xs">
            {{ t('packages_dag_ai_code_dialog_subtitle') }}
          </div>
        </div>
      </div>
    </template>

    <div class="ai-code-dialog__content">
      <!-- Input Area -->
      <div v-if="!loading && !generatedCode" class="ai-code-dialog__input">
        <ElInput
          v-model="userInput"
          type="textarea"
          :rows="4"
          :placeholder="t('packages_dag_ai_code_dialog_placeholder')"
          :disabled="loading"
          resize="none"
        />
      </div>

      <!-- Quick Commands -->
      <div
        v-if="!loading && !generatedCode"
        class="ai-code-dialog__quick-commands"
      >
        <div class="quick-commands-label">
          {{ t('packages_dag_ai_code_dialog_quick_commands') }}
        </div>
        <div class="quick-commands-list">
          <el-tag
            v-for="cmd in quickCommands"
            :key="cmd.text"
            round
            type="info"
            class="quick-command-tag cursor-pointer"
            @click="handleQuickCommand(cmd.text)"
          >
            {{ cmd.text }}
          </el-tag>
        </div>
      </div>

      <!-- Code Preview Area (Streaming) -->
      <div v-if="loading || displayCode" class="ai-code-dialog__preview">
        <div class="code-block">
          <!-- Code Block Header (ChatGPT style) -->
          <div class="code-block-header">
            <span class="code-language">js</span>
            <el-button
              size="small"
              :class="{ copied }"
              text
              @click="handleCopy"
            >
              <el-icon v-if="!copied"><i-lucide-copy /></el-icon>
              <el-icon v-else><i-lucide-check /></el-icon>
              <span>{{
                copied ? t('public_message_copied') : '复制代码'
              }}</span>
            </el-button>
          </div>
          <!-- Code Content -->
          <div ref="codePreviewRef" class="code-block-content">
            <Highlight language="javascript" :code="displayCode" />
            <!-- <span v-if="loading" class="streaming-cursor">|</span> -->
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="ai-code-dialog__error">
        {{ errorMessage }}
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">
          {{ t('packages_dag_ai_code_dialog_cancel') }}
        </ElButton>
        <ElButton
          v-if="!generatedCode"
          type="primary"
          :loading="loading"
          :disabled="!userInput.trim()"
          @click="handleGenerate"
        >
          {{ t('packages_dag_ai_code_dialog_generate') }}
        </ElButton>
        <ElButton v-else type="primary" @click="handleApply">
          {{ t('packages_dag_ai_code_dialog_apply') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss">
.ai-code-dialog {
  .el-dialog__header {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 12px 20px;
    border-top: 1px solid #ebeef5;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;

    .ai-title-icon {
      color: #409eff;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__subtitle {
    color: #909399;
  }

  &__input {
    .el-textarea__inner {
      font-size: 14px;
      line-height: 1.6;
      border-radius: 8px;
    }
  }

  &__quick-commands {
    .quick-commands-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 10px;
    }

    .quick-commands-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .quick-command-tag {
        &:hover {
          --el-tag-text-color: var(--el-color-primary);
          --el-tag-bg-color: var(--el-color-primary-light-9);
          --el-tag-border-color: var(--el-color-primary-light-8);
          --el-tag-hover-color: var(--el-color-primary);
        }
      }
    }
  }

  &__preview {
    --bg-color: #f9f9f9;
    .code-block {
      border-radius: 16px;
      overflow: hidden;
    }

    .code-block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 16px;
      background-color: var(--bg-color);

      .code-language {
        font-size: 12px;
        font-weight: 500;
        color: #6b7280;
        text-transform: lowercase;
      }

      .copy-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border: none;
        background: transparent;
        color: #6b7280;
        font-size: 12px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background-color: #e5e7eb;
          color: #374151;
        }

        &.copied {
          color: #10b981;
        }

        .el-icon {
          font-size: 14px;
        }
      }
    }

    .code-block-content {
      background-color: var(--bg-color);
      max-height: 300px;
      overflow: auto;
      position: relative;

      // Highlight component renders <pre><code>...</code></pre>
      pre {
        margin: 0;
        padding: 16px;
        white-space: pre-wrap;
        word-wrap: break-word;
        background: transparent;

        code.hljs {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
          background: transparent;
          padding: 0;
        }
      }

      .streaming-cursor {
        position: absolute;
        bottom: 16px;
        animation: blink 1s infinite;
        color: var(--el-color-primary);
        font-weight: bold;
      }
    }
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  &__error {
    padding: 12px;
    background-color: #fef0f0;
    border-radius: 8px;
    color: #f56c6c;
    font-size: 13px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.header-icon {
  background-image: linear-gradient(
    to right bottom,
    oklch(0.623 0.214 259.815) 0%,
    oklch(0.585 0.233 277.117) 100%
  );
}
</style>
