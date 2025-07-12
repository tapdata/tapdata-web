<script setup lang="ts">
import {
  getTaskInspectConfig,
  updateTaskInspectConfig,
  type TaskInspectConfig,
} from '@tap/api'
import { useI18n } from '@tap/i18n'
import { reactive, ref } from 'vue'

import { useStore } from 'vuex'
import type { ElDialog } from 'element-plus'

const store = useStore()
const { t } = useI18n()

interface Props {
  taskId: string
}

const props = withDefaults(defineProps<Props>(), {
  taskId: '',
})

const loading = ref(false)
const saving = ref(false)
const validationEnabled = ref(false)
const cdcEnabled = ref(false)
const fullEnabled = ref(false)
const frequencyTime = ref(1)
const frequencyRecords = ref(10)
const recoverEnabled = ref(false)
const timeCheckModeOptions = [
  { label: t('public_time_precision_normal'), value: 'NORMAL' },
  { label: t('public_time_precision_round'), value: 'ROUND' },
  { label: t('public_time_precision_truncate'), value: 'TRUNCATE' },
]
const config = reactive<Partial<TaskInspectConfig>>({
  checkNoPkTable: false,
  timeCheckMode: 'NORMAL',
})
const dialogRef = ref<InstanceType<typeof ElDialog> | null>(null)

async function initFormData() {
  loading.value = true
  try {
    const res = await getTaskInspectConfig(props.taskId)
    validationEnabled.value = res.mode && res.mode !== 'CLOSE'
    cdcEnabled.value = res.custom.cdc?.enable ?? false
    fullEnabled.value = res.custom.full?.enable ?? false
    recoverEnabled.value = res.custom.recover?.enable ?? false
    frequencyTime.value = res.custom.cdc.sample.interval
    frequencyRecords.value = res.custom.cdc.sample.limit

    config.timeCheckMode = res.timeCheckMode
    config.checkNoPkTable = res.checkNoPkTable
  } catch (error) {
    console.error('Failed to load validation settings:', error)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  dialogRef.value.handleClose()
}

async function handleSave() {
  if (!validateAllowSave()) {
    return
  }

  const settings: TaskInspectConfig = {
    mode: validationEnabled.value ? 'CUSTOM' : 'CLOSE',
    timeCheckMode: config.timeCheckMode!,
    checkNoPkTable: config.checkNoPkTable!,
    custom: {
      cdc: {
        enable: cdcEnabled.value,
        sample: {
          interval: frequencyTime.value,
          limit: frequencyRecords.value,
        },
        type: 'SAMPLE',
      },
      full: {
        enable: fullEnabled.value,
      },
      recover: { enable: recoverEnabled.value },
    },
  }

  saving.value = true
  try {
    await updateTaskInspectConfig(props.taskId, settings)
    ElMessage.success(t('public_message_save_ok'))
    handleClose()
  } catch (error) {
    console.error('Failed to save validation settings:', error)
    ElMessage.error(t('public_message_save_fail'))
  } finally {
    saving.value = false
  }
}

function handleCheckChange() {
  if (!cdcEnabled.value && !fullEnabled.value) {
    recoverEnabled.value = false
  }
}

const hasCapability = (node, capabilityId) =>
  node?.attrs?.capabilities?.some(
    (capability) => capability.id === capabilityId,
  )

function validateAllowSave() {
  if (!validationEnabled.value) {
    return true
  }

  const sourceNodes = []
  const targetNodes = []
  store.getters['dataflow/allNodes'].forEach((node) => {
    if (node.type === 'table' || node.type === 'database') {
      if (!node.$inputs.length) {
        sourceNodes.push(node)
      }
      if (!node.$outputs.length) {
        targetNodes.push(node)
      }
    }
  })

  if (sourceNodes.length !== 1 || targetNodes.length !== 1) {
    // 源节点和目标节点只能有一个
    ElMessage.error(t('packages_dag_task_inspect_enable_fail_1'))
    return false
  }

  const [sourceNode] = sourceNodes
  const [targetNode] = targetNodes

  const sourceNodeHasCapability = hasCapability(
    sourceNode,
    'query_by_advance_filter_function',
  )
  const targetNodeHasCapability = hasCapability(
    targetNode,
    'query_by_advance_filter_function',
  )

  if (!sourceNodeHasCapability || !targetNodeHasCapability) {
    // 源节点和目标节点必须同时具备查询能力
    ElMessage.error(t('packages_dag_task_inspect_enable_fail_2'))
    return false
  }

  return true
}

const validate = async () => {
  await initFormData()

  return validateAllowSave()
}

defineExpose({
  validate,
})
</script>

<template>
  <ElDialog
    ref="dialogRef"
    :title="t('public_data_validation')"
    append-to-body
    width="500px"
    custom-class="data-validation-dialog"
    @open="initFormData"
  >
    <div v-loading="loading">
      <div class="validation-header gap-3 justify-content-between">
        <label
          class="header-label fs-6 fw-sub cursor-pointer"
          for="validation-switch"
        >
          {{ t('packages_dag_enable_validation') }}
        </label>
        <ElSwitch id="validation-switch" v-model="validationEnabled" />
      </div>

      <div v-if="validationEnabled" class="mt-2">
        <div class="validation-option mb-4">
          <ElCheckbox
            v-model="fullEnabled"
            disabled
            @change="handleCheckChange"
          >
            <span class="radio-label flex align-center gap-2">
              <span>{{ $t('packages_dag_full_validation') }}</span>
              <el-tag type="info" size="small">Coming Soon</el-tag>
            </span>
          </ElCheckbox>
        </div>

        <div class="validation-option mb-4">
          <ElCheckbox v-model="cdcEnabled" @change="handleCheckChange">
            <div class="fw-sub">
              {{ $t('packages_dag_incremental_validation') }}
            </div>
          </ElCheckbox>
          <div class="font-color-light fs-8 pl-6 mt-n0.5">
            {{ $t('packages_dag_incremental_validation_tips') }}
          </div>
        </div>

        <div v-if="cdcEnabled" class="validation-frequency rounded-xl ml-6">
          <div class="font-color-dark mb-4">
            {{ $t('packages_dag_validation_frequency') }}
          </div>
          <div class="frequency-inputs">
            <span class="frequency-text">{{ $t('packages_dag_every') }}</span>
            <div class="input-number-container">
              <ElInputNumber
                v-model="frequencyTime"
                :min="1"
                :controls="false"
                controls-position="right"
              />
            </div>
            <span class="frequency-text">{{ $t('packages_dag_seconds') }}</span>
            <div class="input-number-container">
              <ElInputNumber
                v-model="frequencyRecords"
                :min="1"
                :controls="false"
                controls-position="right"
              />
            </div>
            <span class="frequency-text">{{ $t('packages_dag_records') }}</span>
          </div>
        </div>

        <el-divider />

        <div class="flex flex-column gap-4">
          <div class="flex align-center">
            <div class="flex-1">
              <label class="fw-sub cursor-pointer" for="recover-switch">{{
                t('public_time_precision')
              }}</label>
            </div>

            <el-segmented
              v-model="config.timeCheckMode"
              :options="timeCheckModeOptions"
            />
          </div>

          <div class="flex align-center">
            <div class="flex-1">
              <label
                class="fw-sub cursor-pointer"
                for="checkNoPkTable-switch"
                >{{ $t('packages_dag_check_no_pk_table') }}</label
              >
            </div>

            <ElSwitch
              id="checkNoPkTable-switch"
              v-model="config.checkNoPkTable"
            />
          </div>

          <div class="flex align-center">
            <div class="flex-1">
              <label class="fw-sub cursor-pointer" for="recover-switch">{{
                $t('packages_dag_auto_repair')
              }}</label>
              <div class="fs-8 font-color-light mt-1">
                {{
                  !cdcEnabled && !fullEnabled
                    ? $t('packages_dag_auto_repair_disabled_tips')
                    : $t('packages_dag_auto_repair_tips')
                }}
              </div>
            </div>

            <ElSwitch
              id="recover-switch"
              v-model="recoverEnabled"
              :disabled="!cdcEnabled && !fullEnabled"
            />
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
}

.validation-option {
  .el-checkbox {
    --el-checkbox-input-width: 16px;
    --el-checkbox-input-height: 16px;
    :deep(.el-checkbox__inner::after) {
      width: 4px;
      height: 8px;
      left: 4px;
    }
  }

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
        width: 80px;
      }
    }
  }
}
</style>
