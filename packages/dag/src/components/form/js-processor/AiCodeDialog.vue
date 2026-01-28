<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, ref } from 'vue'

const { t } = useI18n()

const visible = ref(false)
const userInput = ref('')
const loading = ref(false)

const emit = defineEmits<{
  (e: 'generate', input: string): void
}>()

// Quick command buttons
const quickCommands = computed(() => [
  { text: t('packages_dag_ai_code_dialog_cmd_camel_case') },
  { text: t('packages_dag_ai_code_dialog_cmd_filter_empty') },
  { text: t('packages_dag_ai_code_dialog_cmd_add_timestamp') },
  { text: t('packages_dag_ai_code_dialog_cmd_round_numbers') },
  { text: t('packages_dag_ai_code_dialog_cmd_merge_fields') },
])

const handleQuickCommand = (text: string) => {
  userInput.value = text
}

const handleGenerate = async () => {
  if (!userInput.value.trim()) return

  loading.value = true
  try {
    emit('generate', userInput.value)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    handleClose()
  } catch (error) {
    console.error('AI code generation failed:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
  userInput.value = ''
  loading.value = false
}

const open = () => {
  visible.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <ElDialog
    v-model="visible"
    width="520px"
    :show-close="true"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <template #header="{ titleClass }">
      <div class="flex align-center gap-2">
        <el-icon><i-lucide-sparkles /></el-icon>
        <span :class="titleClass">{{
          t('packages_dag_ai_code_dialog_title')
        }}</span>
      </div>
    </template>

    <div class="ai-code-dialog__content">
      <!-- Subtitle -->
      <div class="ai-code-dialog__subtitle">
        {{ t('packages_dag_ai_code_dialog_subtitle') }}
      </div>

      <!-- Input Area -->
      <div class="ai-code-dialog__input">
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
      <div class="ai-code-dialog__quick-commands">
        <div class="quick-commands-label">
          {{ t('packages_dag_ai_code_dialog_quick_commands') }}
        </div>
        <div class="quick-commands-list">
          <span
            v-for="cmd in quickCommands"
            :key="cmd.text"
            class="quick-command-tag"
            @click="handleQuickCommand(cmd.text)"
          >
            {{ cmd.text }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">
          {{ t('packages_dag_ai_code_dialog_cancel') }}
        </ElButton>
        <ElButton
          type="primary"
          :loading="loading"
          :disabled="!userInput.trim()"
          @click="handleGenerate"
        >
          {{ t('packages_dag_ai_code_dialog_generate') }}
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
    font-size: 14px;
    color: #909399;
    line-height: 1.5;
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
        display: inline-block;
        padding: 4px 12px;
        border: 1px solid #e4e7ed;
        border-radius: 14px;
        font-size: 12px;
        color: #606266;
        background: #f5f7fa;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #409eff;
          border-color: #c6e2ff;
          background: #ecf5ff;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
