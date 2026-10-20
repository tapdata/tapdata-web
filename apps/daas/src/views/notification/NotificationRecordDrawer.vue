<script setup lang="ts">
import {
  getNotificationRecord,
  updateOneNotificationReadState,
  type NotificationRecordDetail,
} from '@tap/api/src/core/notification'
import { getAlarmKeyMap } from '@tap/business/src/shared/alarm'
import { ALARM_LEVEL_MAP } from '@tap/business/src/shared/const'
import dayjs from 'dayjs'
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from '@tap/i18n'
import { useRouter } from 'vue-router'
import DeliverySummaryTag from './DeliverySummaryTag.vue'

const props = defineProps<{
  id?: string
  visible: boolean
  /** 打开即标为已读；管理员查看他人记录时服务端不会改变他人状态 */
  markReadOnOpen?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'changed'): void
}>()
const { t } = useI18n()
const router = useRouter()
const alarmKeyMap: Record<string, string> = getAlarmKeyMap()
const hasPermissionByCode = inject<(code: string) => boolean>(
  'hasPermissionByCode',
)
const canViewAlarm = hasPermissionByCode?.('v2_alarm_event') ?? false

const loading = ref(false)
const detail = ref<NotificationRecordDetail | null>(null)
const open = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const fmt = (time?: string) =>
  time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'

const STATUS_TYPES: Record<string, string> = {
  SUCCESS: 'success',
  FAILED: 'danger',
  SKIPPED: 'info',
}

async function load(id: string) {
  loading.value = true
  try {
    detail.value = await getNotificationRecord(id)
    if (
      props.markReadOnOpen !== false &&
      detail.value?.readable &&
      detail.value.unread
    ) {
      await updateOneNotificationReadState(id, true)
      detail.value.unread = false
      emit('changed')
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.visible, props.id],
  ([visible, id]) => {
    if (visible && id) load(id as string)
  },
  { immediate: true },
)

async function toggleRead() {
  if (!detail.value) return
  const read = detail.value.unread
  await updateOneNotificationReadState(detail.value.id, read)
  detail.value.unread = !read
  emit('changed')
}

function goTask() {
  if (!detail.value?.taskId) return
  router.push({ name: 'TaskMonitor', params: { id: detail.value.taskId } })
}

function goAlarm() {
  router.push({
    name: 'alarmEvents',
    query: { alarmId: detail.value?.alarmEventId },
  })
}
</script>

<template>
  <el-drawer
    v-model="open"
    :title="t('notification_record_detail')"
    size="720px"
    append-to-body
  >
    <div v-loading="loading">
      <template v-if="detail">
        <h3 class="mb-2">{{ detail.title }}</h3>
        <div class="flex align-center gap-2 mb-3">
          <el-tag size="small">{{
            ALARM_LEVEL_MAP[detail.level]?.text || detail.level
          }}</el-tag>
          <el-tag v-if="!detail.readable" size="small" type="info">
            {{ t('notification_record_others') }}
          </el-tag>
          <el-tag
            v-else
            size="small"
            :type="detail.unread ? 'warning' : 'info'"
          >
            {{
              detail.unread
                ? t('notification_record_unread')
                : t('notification_record_read')
            }}
          </el-tag>
          <span v-if="detail.readAt" class="color-info fs-8"
            >{{ t('notification_record_read_at') }}：{{
              fmt(detail.readAt)
            }}</span
          >
          <span v-if="!detail.readable" class="color-info fs-8 ml-auto">{{
            t('notification_record_others_hint')
          }}</span>
          <el-button
            v-else
            text
            type="primary"
            class="ml-auto"
            @click="toggleRead"
          >
            {{
              detail.unread
                ? t('notification_record_mark_read')
                : t('notification_record_mark_unread')
            }}
          </el-button>
        </div>

        <el-descriptions
          :column="2"
          border
          :title="t('notification_record_basic')"
        >
          <el-descriptions-item :label="t('alarm_event_task')">
            {{ detail.taskName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_type')">
            {{
              (detail.metric && alarmKeyMap[detail.metric]) ||
              detail.metric ||
              '-'
            }}
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
          <el-descriptions-item :label="t('alarm_event_occurrence_count')">
            {{ detail.occurrenceCount ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('notification_record_latest_notify')">
            {{ fmt(detail.latestNotifyTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('alarm_event_id')" :span="2">
            {{ detail.alarmEventId || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="mt-2">
          <el-button
            text
            type="primary"
            :disabled="!detail.taskId"
            @click="goTask"
          >
            {{ t('alarm_event_go_task') }}
          </el-button>
          <el-button
            v-if="canViewAlarm"
            text
            type="primary"
            :disabled="detail.legacy || detail.alarmEventMissing"
            @click="goAlarm"
          >
            {{ t('notification_record_view_alarm') }}
          </el-button>
          <span v-if="detail.alarmEventMissing" class="color-info fs-8">{{
            t('notification_record_alarm_missing')
          }}</span>
        </div>

        <div class="flex align-center gap-3 mt-4 mb-2">
          <h4 class="m-0">{{ t('notification_record_deliveries') }}</h4>
          <DeliverySummaryTag :summary="detail.deliverySummary" />
        </div>
        <el-empty
          v-if="detail.legacy || !detail.batches.length"
          :description="t('notification_record_no_delivery')"
          :image-size="60"
        />
        <div v-for="batch in detail.batches" :key="batch.batchId" class="mb-3">
          <div class="color-info fs-8 mb-1">
            {{ fmt(batch.time) }}
            <span v-if="batch.occurrenceCountSnapshot != null">
              ·
              {{
                t('notification_record_occurrence_snapshot', [
                  batch.occurrenceCountSnapshot,
                ])
              }}
            </span>
          </div>
          <el-table :data="batch.recipients" size="small" border>
            <el-table-column
              :label="t('notification_record_channel')"
              width="90"
            >
              <template #default="{ row }">{{
                t(`delivery_channel_${row.channel.toLowerCase()}`)
              }}</template>
            </el-table-column>
            <el-table-column
              :label="t('notification_record_recipient')"
              prop="address"
              min-width="160"
            >
              <template #default="{ row }">{{ row.address || '-' }}</template>
            </el-table-column>
            <el-table-column
              :label="t('notification_record_status')"
              width="90"
            >
              <template #default="{ row }">
                <el-tag size="small" :type="STATUS_TYPES[row.status]">
                  {{ t(`delivery_recipient_${row.status.toLowerCase()}`) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :label="t('notification_record_sent_at')"
              width="160"
            >
              <template #default="{ row }">{{ fmt(row.sentAt) }}</template>
            </el-table-column>
            <el-table-column
              :label="t('notification_record_reason')"
              min-width="160"
            >
              <template #default="{ row }">
                {{
                  row.failureMessage ||
                  (row.skipReason
                    ? t(`delivery_skip_${row.skipReason.toLowerCase()}`)
                    : '-')
                }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="color-info fs-8">
          {{ t('notification_record_smtp_hint') }}
        </div>
      </template>
    </div>
  </el-drawer>
</template>
