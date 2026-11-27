<script setup lang="ts">
import {
  getTaskThrottleSampleConfig,
  updateTaskThrottleSampleConfig,
  type TaskThrottleSampleConfigView,
} from '@tap/api/src/core/task-throttle'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import {
  CDC_SAMPLE_DEFAULT_SECONDS,
  CDC_SAMPLE_MAX_SECONDS,
  CDC_SAMPLE_MIN_SECONDS,
  validateCdcSampleInterval,
} from './utils'

const props = withDefaults(
  defineProps<{
    canEdit?: boolean
  }>(),
  {
    canEdit: false,
  },
)

const emit = defineEmits<{
  saved: [config: TaskThrottleSampleConfigView]
}>()

const { t } = useI18n()

const loading = ref(false)
const saving = ref(false)
const intervalInput = ref<string>(String(CDC_SAMPLE_DEFAULT_SECONDS))
const configView = ref<TaskThrottleSampleConfigView | null>(null)
const errorMessage = ref('')
const activeFaq = ref<string[]>([])

async function loadConfig() {
  loading.value = true
  try {
    const data = await getTaskThrottleSampleConfig()
    configView.value = data
    intervalInput.value = String(
      data?.intervalSeconds ?? CDC_SAMPLE_DEFAULT_SECONDS,
    )
    errorMessage.value = ''
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadConfig()
})

const hasPartialRollout = computed(() => {
  const list = configView.value?.agentStatuses || []
  return list.some((s) => s.status !== 'APPLIED')
})

function statusTagType(status: string): 'success' | 'warning' | 'info' {
  if (status === 'APPLIED') return 'success'
  if (status === 'APPLYING') return 'warning'
  return 'info'
}

function statusText(row: {
  status: string
  appliedIntervalSeconds?: number | null
}): string {
  if (row.status === 'APPLIED') {
    return t('packages_business_cdc_sample_status_applied', {
      seconds:
        row.appliedIntervalSeconds ??
        configView.value?.intervalSeconds ??
        CDC_SAMPLE_DEFAULT_SECONDS,
    })
  }
  if (row.status === 'APPLYING') {
    return t('packages_business_cdc_sample_status_applying')
  }
  return t('packages_business_cdc_sample_status_legacy')
}

function formatUpdatedAt(ts?: number | null): string {
  return ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '-'
}

async function handleSave() {
  const check = validateCdcSampleInterval(intervalInput.value)
  if (!check.valid || check.value === undefined) {
    if (check.errorCode === 'REQUIRED') {
      errorMessage.value = t('packages_business_cdc_sample_err_required')
    } else if (check.errorCode === 'INTEGER') {
      errorMessage.value = t('packages_business_cdc_sample_err_integer')
    } else {
      errorMessage.value = t('packages_business_cdc_sample_err_range')
    }
    return
  }

  errorMessage.value = ''
  saving.value = true
  try {
    const updated = await updateTaskThrottleSampleConfig(check.value)
    configView.value = updated
    intervalInput.value = String(updated.intervalSeconds)
    emit('saved', updated)
    ElMessage.success(
      t('packages_business_cdc_sample_save_success', {
        version: updated.configVersion,
      }),
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    v-loading="loading"
    class="cdc-sample-refresh-setting flex flex-column gap-4"
  >
    <el-form-item :label="t('packages_business_cdc_sample_title')">
      <div class="flex flex-column gap-2 w-100" style="max-width: 680px">
        <div class="flex align-center gap-3 flex-wrap">
          <el-input
            v-model="intervalInput"
            :disabled="!props.canEdit || saving"
            style="width: 220px"
            :placeholder="`${CDC_SAMPLE_MIN_SECONDS}–${CDC_SAMPLE_MAX_SECONDS}`"
            @input="errorMessage = ''"
          >
            <template #append>
              {{ t('packages_business_cdc_sample_unit_sec') }}
            </template>
          </el-input>
          <el-button
            v-if="props.canEdit"
            type="primary"
            :loading="saving"
            @click="handleSave"
          >
            {{ t('public_button_save') }}
          </el-button>
          <el-button :loading="loading" @click="loadConfig">
            {{ t('public_button_refresh') }}
          </el-button>
        </div>

        <div v-if="errorMessage" class="color-danger fs-8">
          {{ errorMessage }}
        </div>

        <div class="fs-8 font-color-normal lh-base">
          {{ t('packages_business_cdc_sample_purpose') }}
        </div>

        <el-collapse v-model="activeFaq" class="my-1">
          <el-collapse-item
            name="when"
            :title="t('packages_business_cdc_sample_when_title')"
          >
            <div class="fs-8 font-color-light lh-base">
              {{ t('packages_business_cdc_sample_when_example') }}
            </div>
          </el-collapse-item>
        </el-collapse>

        <div class="fs-8 font-color-sslight lh-base">
          {{ t('packages_business_cdc_sample_cpu_hint') }}
        </div>
      </div>
    </el-form-item>

    <div
      v-if="configView"
      class="p-4 rounded-lg border bg-light flex flex-column gap-3"
      style="max-width: 780px"
    >
      <div
        class="flex justify-content-between align-center flex-wrap gap-2 fs-8 font-color-light"
      >
        <span>
          {{
            t('packages_business_cdc_sample_meta', {
              version: configView.configVersion,
              time: formatUpdatedAt(configView.updatedAt),
            })
          }}
        </span>
      </div>

      <el-alert
        v-if="hasPartialRollout"
        type="warning"
        :closable="false"
        show-icon
      >
        <span class="fs-8">{{
          t('packages_business_cdc_sample_partial_warn')
        }}</span>
      </el-alert>

      <el-table
        v-if="configView.agentStatuses?.length"
        :data="configView.agentStatuses"
        size="small"
        border
      >
        <el-table-column
          prop="agentId"
          :label="t('packages_business_cdc_sample_agent_id')"
          min-width="180"
        />
        <el-table-column
          :label="t('packages_business_cdc_sample_agent_status')"
          width="170"
        >
          <template #default="{ row }">
            <el-tag
              :type="statusTagType(row.status)"
              size="small"
              effect="light"
            >
              {{ statusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('packages_business_cdc_sample_agent_detail')"
          min-width="220"
        >
          <template #default="{ row }">
            {{ row.reason || '-' }}
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="fs-8 font-color-sslight">
        {{ t('packages_business_cdc_sample_no_agents') }}
      </div>
    </div>
  </div>
</template>
