<script setup lang="ts">
import { taskInspectApi } from '@tap/api'
import { useI18n } from '@tap/i18n'
import {
  ElButton,
  ElDialog,
  ElInputNumber,
  ElMessage,
  ElRadio,
  ElSwitch,
} from 'element-plus'
import { computed, ref, watch } from 'vue'

// Define type locally based on API structure
interface TaskInspectConfig {
  custom: {
    cdc: {
      enable: boolean
      sample: {
        interval: number
        limit: number
      }
      type: 'CLOSE' | 'SAMPLE'
    }
  }
  mode: 'CLOSE' | 'INTELLIGENT' | 'CUSTOM'
}

// Get i18n instance
const { t } = useI18n()

interface ValidationSettings {
  enabled: boolean
  type: string
  frequency: {
    time: number
    records: number
  }
}

interface Props {
  visible: boolean
  taskId: string
  validationSettings: ValidationSettings
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  taskId: '',
  validationSettings: () => ({
    enabled: false,
    type: 'incremental',
    frequency: {
      time: 1,
      records: 10,
    },
  }),
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const loading = ref(false)
const saving = ref(false)
const validationEnabled = ref(false)
const validationType = ref('cdc')
const frequencyTime = ref(1)
const frequencyRecords = ref(10)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      initFormData()
    }
  },
  { immediate: false },
)

async function initFormData() {
  loading.value = true
  try {
    const res = await taskInspectApi.getConfig(props.taskId, {})
    validationEnabled.value = res.mode && res.mode !== 'CLOSE'
    frequencyTime.value = res.custom.cdc.sample.interval
    frequencyRecords.value = res.custom.cdc.sample.limit
  } catch (error) {
    console.error('Failed to load validation settings:', error)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  dialogVisible.value = false
}

async function handleSave() {
  const settings: TaskInspectConfig = {
    mode: validationEnabled.value ? 'CUSTOM' : 'CLOSE',
    custom: {
      cdc: {
        enable: true,
        sample: {
          interval: frequencyTime.value,
          limit: frequencyRecords.value,
        },
        type: 'SAMPLE',
      },
    },
  }

  saving.value = true
  try {
    await taskInspectApi.putConfig(props.taskId, settings)
    dialogVisible.value = false
    ElMessage.success(t('public_message_save_ok'))
  } catch (error) {
    console.error('Failed to save validation settings:', error)
    ElMessage.error(t('public_message_save_error'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :title="t('public_data_validation')"
    append-to-body
    width="500px"
    custom-class="data-validation-dialog"
    @close="handleClose"
  >
    <div v-loading="loading">
      <div class="validation-header gap-3">
        <div class="header-label">
          {{ t('packages_dag_enable_validation') }}
        </div>
        <div class="switch-container">
          <ElSwitch v-model="validationEnabled" />
        </div>
      </div>

      <div v-if="validationEnabled" class="validation-content">
        <div class="validation-option">
          <ElRadio v-model="validationType" label="cdc">
            <span class="radio-label">{{
              t('packages_dag_incremental_validation')
            }}</span>
          </ElRadio>
        </div>

        <div class="validation-frequency">
          <div class="font-color-dark mb-4">
            {{ t('packages_dag_validation_frequency') }}
          </div>
          <div class="frequency-inputs">
            <span class="frequency-text">{{ t('packages_dag_every') }}</span>
            <div class="input-number-container">
              <ElInputNumber
                v-model="frequencyTime"
                :min="1"
                controls-position="right"
              />
            </div>
            <span class="frequency-text">{{ t('packages_dag_seconds') }}</span>
            <div class="input-number-container">
              <ElInputNumber
                v-model="frequencyRecords"
                :min="1"
                controls-position="right"
              />
            </div>
            <span class="frequency-text">{{ t('packages_dag_records') }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="handleClose">{{ t('public_button_cancel') }}</ElButton>
      <ElButton type="primary" @click="handleSave">{{
        t('public_button_save')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.data-validation-dialog {
  border-radius: 12px;
  overflow: hidden;

  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    display: none;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;

  .dialog-title {
    font-size: 18px;
    font-weight: 500;
    color: #1f2329;
  }

  .close-button {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.validation-container {
  padding: 24px;
}

.validation-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  .switch-container {
    :deep(.el-switch__core) {
      height: 24px;
      border-radius: 12px;
      width: 50px !important;

      &::after {
        height: 20px;
        width: 20px;
        top: 1px;
      }
    }

    :deep(.el-switch.is-checked .el-switch__core::after) {
      margin-left: -21px;
    }
  }
}

.validation-content {
  margin-top: 24px;
}

.validation-option {
  margin-bottom: 24px;

  .custom-radio {
    display: flex;
    align-items: center;

    :deep(.el-radio__input) {
      .el-radio__inner {
        width: 20px;
        height: 20px;
        border-color: #d9d9d9;

        &::after {
          width: 10px;
          height: 10px;
          background-color: #5764f6;
        }
      }

      &.is-checked {
        .el-radio__inner {
          border-color: #5764f6;
          background: #ffffff;
        }
      }
    }

    .radio-label {
      font-size: 15px;
      color: #1f2329;
      margin-left: 4px;
    }
  }
}

.validation-frequency {
  background-color: #f7f8fa;
  padding: 20px;
  border-radius: 8px;

  .frequency-inputs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .frequency-text {
      font-size: 14px;
      color: #3e4152;
      margin: 0 8px;
    }

    .input-number-container {
      .el-input-number {
        width: 100px;
      }
    }
  }
}
</style>
