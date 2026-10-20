<script setup lang="ts">
import { getAlarmEvent, type AlarmEvent } from '@tap/api/src/core/alarm'
import { getAlarmKeyMap } from '@tap/business/src/shared/alarm'
import {
  ALARM_LEVEL_MAP,
  ALARM_STATUS_MAP,
} from '@tap/business/src/shared/const'
import dayjs from 'dayjs'
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from '@tap/i18n'
import { useRouter } from 'vue-router'
import DeliverySummaryTag from './DeliverySummaryTag.vue'

const props = defineProps<{ id?: string; visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()
const { t } = useI18n()
const router = useRouter()
const alarmKeyMap: Record<string, string> = getAlarmKeyMap()
const hasPermissionByCode = inject<(code: string) => boolean>(
  'hasPermissionByCode',
)
const canViewNotifications =
  hasPermissionByCode?.('v2_notification_record') ?? false

const loading = ref(false)
const detail = ref<AlarmEvent | null>(null)

const open = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const fmt = (time?: string) =>
  time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'

const duration = computed(() => {
  const d = detail.value
  if (!d?.firstOccurrenceTime) return '-'
  const end = d.recoveryTime || d.closeTime || d.lastOccurrenceTime
  const ms = dayjs(end).diff(dayjs(d.firstOccurrenceTime))
  const minutes = Math.max(0, Math.round(ms / 60000))
  return minutes < 60
    ? t('alarm_event_minutes', [minutes])
    : t('alarm_event_hours', [(minutes / 60).toFixed(1)])
})

watch(
  () => [props.visible, props.id],
  async ([visible, id]) => {
    if (!visible || !id) return
    loading.value = true
    try {
      detail.value = await getAlarmEvent(id as string)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

function openTask() {
  const d = detail.value
  if (!d?.taskId || d.objectDeleted) return
  router.push({
    name: d.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor',
    params: { id: d.taskId },
  })
}

function openNotifications() {
  router.push({
    name: 'notificationRecords',
    query: { alarmEventId: detail.value?.id },
  })
}
</script>

<template>
  <el-drawer
    v-model="open"
    :title="t('alarm_event_detail')"
    size="680px"
    append-to-body
  >
    <div v-loading="loading" class="alarm-event-detail">
      <template v-if="detail">
        <h3 class="mb-3">{{ detail.summary }}</h3>
        <el-alert
          v-if="detail.status === 'CLOESE'"
          type="info"
          :closable="false"
          show-icon
          class="mb-3"
          :title="t('alarm_event_close_hint')"
        />
        <el-descriptions :column="2" border :title="t('alarm_event_overview')">
          <el-descriptions-item
            :label="t('packages_dag_components_alert_gaojingjibie')"
          >
            {{ ALARM_LEVEL_MAP[detail.level]?.text || detail.level }}
          </el-descriptions-item>
          <el-descriptions-item
            :label="t('packages_dag_components_alert_gaojingzhuangtai')"
          >
            {{ ALARM_STATUS_MAP[detail.status]?.text || detail.status }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_id')">
            {{ detail.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_type')">
            {{ alarmKeyMap[detail.metric] || detail.metric }}
          </el-descriptions-item>
          <el-descriptions-item
            :label="t('packages_dag_components_alert_gaojingshoucifa')"
          >
            {{ fmt(detail.firstOccurrenceTime) }}
          </el-descriptions-item>
          <el-descriptions-item
            :label="t('packages_dag_components_alert_gaojingzuijinfa')"
          >
            {{ fmt(detail.lastOccurrenceTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_duration')">
            {{ duration }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_occurrence_count')">
            {{ detail.occurrenceCount ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_recovery_time')">
            {{ fmt(detail.recoveryTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_close_time')">
            {{ fmt(detail.closeTime) }}
            <span v-if="detail.archived"
              >（{{ t('alarm_event_archived') }}）</span
            >
            <span v-else-if="detail.closeBy">（{{ detail.closeBy }}）</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_current_value')">
            {{ detail.currentValue ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_threshold')">
            {{ detail.threshold ?? '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions
          :column="2"
          border
          class="mt-4"
          :title="t('alarm_event_related_object')"
        >
          <el-descriptions-item :label="t('alarm_event_object_type')">
            {{ t(`alarm_object_type_${detail.objectType}`) }}
          </el-descriptions-item>
          <el-descriptions-item
            :label="t('daas_notification_systemalarm_gaojingduixiang')"
          >
            {{ detail.objectName || '-' }}
            <el-tag
              v-if="detail.objectDeleted"
              size="small"
              type="info"
              class="ml-1"
            >
              {{ t('alarm_event_object_deleted') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="detail.taskId"
            :label="t('alarm_event_task')"
          >
            {{ detail.taskName }}（{{ detail.taskId }}）
          </el-descriptions-item>
          <el-descriptions-item
            v-if="detail.nodeId"
            :label="t('alarm_event_node')"
          >
            {{ detail.nodeName || detail.nodeId }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="detail.agentId"
            :label="t('alarm_event_agent')"
          >
            {{ detail.agentId }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="mt-2">
          <el-button
            v-if="detail.taskId"
            text
            type="primary"
            :disabled="detail.objectDeleted"
            @click="openTask"
            >{{ t('alarm_event_open_monitor') }}</el-button
          >
          <el-button
            text
            type="primary"
            @click="router.push({ name: 'alarmSetting' })"
            >{{ t('alarm_event_open_setting') }}</el-button
          >
        </div>

        <h4 class="mt-4 mb-2">{{ t('alarm_event_notification_overview') }}</h4>
        <div class="flex align-center gap-3">
          <DeliverySummaryTag :summary="detail.deliverySummary" />
          <span
            v-if="detail.deliverySummary?.latestDeliveryTime"
            class="color-info"
          >
            {{ t('alarm_event_latest_notify') }}：{{
              fmt(detail.deliverySummary.latestDeliveryTime)
            }}
          </span>
          <el-button
            v-if="canViewNotifications"
            text
            type="primary"
            @click="openNotifications"
            >{{ t('alarm_event_view_notifications') }}</el-button
          >
        </div>
      </template>
    </div>
  </el-drawer>
</template>
