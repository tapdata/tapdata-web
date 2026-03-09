<script setup lang="ts">
import { getTaskById } from '@tap/api/src/core/task'
import {
  getTaskInspectConfig,
  updateTaskInspectConfig,
  type TaskInspectConfig,
} from '@tap/api/src/core/task-inspect'
import { useI18n } from '@tap/i18n'

import { reactive, ref } from 'vue'
import { useDataflowStore } from '../stores/dataflow.store'
import type { ElDialog } from 'element-plus'

const dataflowStore = useDataflowStore()
const { t } = useI18n()

interface Props {
  taskId: string
  syncType: string
}

const props = withDefaults(defineProps<Props>(), {})

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
  tableFilter: {
    type: 'NONE',
    tables: [],
    regex: '',
  },
})
const dialogRef = ref<InstanceType<typeof ElDialog> | null>(null)
const queueCapacityType = ref<'auto' | 'custom'>('auto')
const filterOptions = [
  {
    label: t('public_include_tables'),
    value: 'INCLUDES',
  },
  {
    label: t('public_include_regex'),
    value: 'INCLUDE_REGEX',
  },
  {
    label: t('public_exclude_tables'),
    value: 'EXCLUDES',
  },
  {
    label: t('public_exclude_regex'),
    value: 'EXCLUDE_REGEX',
  },
]
const tableFilterEnabled = ref(false)
const tableOptions = ref([])

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
    config.queueCapacity = res.queueCapacity ?? 1000
    config.tableFilter = res.tableFilter || { type: 'NONE' }
    queueCapacityType.value = 'queueCapacity' in res ? 'custom' : 'auto'
    tableFilterEnabled.value =
      config.tableFilter.type && config.tableFilter.type !== 'NONE'

    if (props.syncType === 'migrate') {
      loadTableOptions()
    }
  } catch (error) {
    console.error('Failed to load validation settings:', error)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  dialogRef.value!.handleClose()
}

async function handleSave() {
  if (!validateAllowSave()) {
    return
  }

  const settings: Partial<TaskInspectConfig> = {
    mode: validationEnabled.value ? 'CUSTOM' : 'CLOSE',
    ...config,
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

  if (queueCapacityType.value === 'auto') {
    delete settings.queueCapacity
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

function validateAllowSave() {
  if (!validationEnabled.value) {
    return true
  }

  const sourceNodes = []
  const targetNodes = []
  dataflowStore.dag.nodes.forEach((node) => {
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

  const sourceNodeHasCapability = dataflowStore.hasCapability(
    sourceNode,
    'query_by_advance_filter_function',
  )
  const targetNodeHasCapability = dataflowStore.hasCapability(
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

async function loadTableOptions() {
  const data = await getTaskById(props.taskId)
  const tables = data.dag.nodes
    .find(
      (node: Record<string, any>) =>
        node.type === 'database' &&
        node.migrateTableSelectType &&
        node.tableNames,
    )
    ?.tableNames?.map((value: string) => ({ label: value, value }))

  tableOptions.value = tables || []
}

function handleTableFilterChange(enable) {
  if (enable) {
    config.tableFilter.type = 'INCLUDES'
  } else {
    config.tableFilter.type = 'NONE'
  }
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
    :close-on-click-modal="false"
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

        <div
          v-if="cdcEnabled"
          class="validation-frequency border rounded-xl ml-6"
        >
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

        <div v-if="syncType === 'migrate'" class="mb-4">
          <div class="flex align-center justify-content-between mb-3">
            <div class="fw-sub">{{ $t('public_table_filter') }}</div>
            <ElSwitch
              v-model="tableFilterEnabled"
              @change="handleTableFilterChange"
            />
          </div>

          <div
            v-if="tableFilterEnabled"
            class="bg-color-disable border p-4 rounded-xl"
          >
            <el-form-item
              :label="$t('public_filter_type')"
              label-position="top"
              inline-message
            >
              <el-select
                v-model="config.tableFilter.type"
                :options="filterOptions"
              />
            </el-form-item>
            <el-form-item
              v-if="
                config.tableFilter.type === 'INCLUDES' ||
                config.tableFilter.type === 'EXCLUDES'
              "
              :label="
                $t(
                  config.tableFilter.type === 'INCLUDES'
                    ? 'public_tables_included'
                    : 'public_tables_excluded',
                )
              "
              label-position="top"
              inline-message
              class="mb-0"
            >
              <el-select-v2
                v-model="config.tableFilter.tables"
                multiple
                filterable
                :options="tableOptions"
              />
            </el-form-item>
            <el-form-item
              v-else-if="config.tableFilter.type.includes('REGEX')"
              label-position="top"
              inline-message
              class="mb-0"
            >
              <template #label>
                <div class="flex align-center gap-1">
                  <span>{{ $t('public_regex') }}</span>
                  <el-tooltip placement="top">
                    <template #content>
                      <div class="lh-4">
                        <p class="fw-sub mb-1">
                          {{ $t('public_regex_example') }}
                        </p>
                        <ul class="ml-4 list-disc flex flex-column gap-0.5">
                          <li class="list-disc">
                            <code class="font-mono rounded px-1 bg-white/15"
                              >user_.*</code
                            >
                            - {{ $t('public_table_regex_example_1') }}
                          </li>
                          <li class="list-disc">
                            <code class="font-mono rounded bg-white/15 px-1"
                              >.*_temp</code
                            >
                            - {{ $t('public_table_regex_example_2') }}
                          </li>
                          <li class="list-disc">
                            <code class="font-mono rounded bg-white/15 px-1"
                              >test|demo</code
                            >
                            - {{ $t('public_table_regex_example_3') }}
                          </li>
                        </ul>
                      </div>
                    </template>
                    <el-icon>
                      <i-lucide-info />
                    </el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input
                v-model="config.tableFilter.regex"
                type="textarea"
                :placeholder="$t('public_table_regex_placeholder')"
                :autosize="{ minRows: 1, maxRows: 3 }"
              />
            </el-form-item>
          </div>
        </div>

        <div class="flex flex-column gap-4">
          <div class="flex align-center">
            <div class="flex-1">
              <label class="fw-sub">{{ t('public_time_precision') }}</label>
            </div>

            <el-segmented
              v-model="config.timeCheckMode"
              :options="timeCheckModeOptions"
            />
          </div>

          <div class="flex align-center">
            <div class="flex-1">
              <label class="fw-sub flex align-center gap-1"
                >{{ t('public_queue_capacity') }}
              </label>
            </div>

            <el-radio-group v-model="queueCapacityType">
              <el-radio value="auto">
                <span class="align-middle mr-1">{{ $t('public_auto') }}</span>
                <el-tooltip
                  :content="t('public_queue_capacity_auto_tip')"
                  placement="top"
                >
                  <el-icon class="align-middle">
                    <i-lucide-info /> </el-icon></el-tooltip
              ></el-radio>
              <el-radio value="custom">
                <span class="align-middle mr-1">{{ $t('public_custom') }}</span>
                <el-tooltip
                  :content="t('public_queue_capacity_tip')"
                  placement="top"
                >
                  <el-icon class="align-middle"
                    ><i-lucide-info
                  /></el-icon> </el-tooltip
              ></el-radio>
            </el-radio-group>
          </div>

          <div v-if="queueCapacityType === 'custom'" class="text-end">
            <el-input-number
              v-model="config.queueCapacity"
              class="ml-auto"
              :min="1"
              controls-position="right"
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
      <ElButton type="primary" :loading="saving" @click="handleSave">{{
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

.validation-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.validation-option {
  .el-checkbox {
    --el-checkbox-input-width: 16px;
    --el-checkbox-input-height: 16px;
    :deep(.el-checkbox__inner::after) {
      height: 8px;
    }
  }
}

.validation-frequency {
  background-color: var(--bg-disable);
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
