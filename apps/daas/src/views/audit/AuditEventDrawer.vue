<script setup lang="ts">
import {
  fetchAuditOperation,
  type AuditEvent,
  type AuditOperation,
} from '@tap/api/src/core/audit-events'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'
import { useI18n } from '@tap/i18n'
import {
  batchSummary,
  changeText,
  displayValue,
  operatorText,
  outcomeView,
} from './audit-log'

const props = defineProps<{ id?: string; visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()
const { t } = useI18n()

const loading = ref(false)
const operation = ref<AuditOperation | null>(null)
const open = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const fmt = (time?: string) =>
  time
    ? dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    : t('audit_value_unavailable')
const tr = (key: string, args?: any) => t(key, args)

async function load(id: string) {
  loading.value = true
  try {
    const list = await fetchAuditOperation(id)
    operation.value = list?.[0] || null
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

const initiator = computed(() => operation.value?.initiator)

function message(key?: string) {
  if (!key) return ''
  const text = t(key)
  return text === key ? key : text
}

function requiredRows(e: AuditEvent): [string, string][] {
  const legacy = !!e.legacy
  return [
    ['audit_field_event_id', e.eventId || displayValue(null, legacy, tr)],
    ['audit_field_operation_id', displayValue(e.operationId, legacy, tr)],
    ['audit_field_time', `${fmt(e.timestamp)} (${timeZone})`],
    [
      'audit_field_event_type',
      e.eventType
        ? t(`audit_event_type_${e.eventType.toLowerCase()}`)
        : displayValue(null, legacy, tr),
    ],
    ['audit_field_operator', operatorText(e, tr)],
    [
      'audit_field_source',
      e.source
        ? t(`audit_source_${e.source.toLowerCase()}`)
        : displayValue(null, legacy, tr),
    ],
    [
      'audit_field_source_ip',
      displayValue(e.sourceIp, legacy, tr) +
        (e.sourceIpNote ? ` (${message(e.sourceIpNote)})` : ''),
    ],
    [
      'audit_field_action',
      e.legacy
        ? e.legacyMessage || displayValue(null, true, tr)
        : e.actionName || displayValue(e.action, false, tr),
    ],
    [
      'audit_field_object',
      displayValue(e.objectName || e.objectId, legacy, tr),
    ],
    ['audit_field_outcome', outcomeView(e.outcome, tr).text],
  ]
}
</script>

<template>
  <el-drawer
    v-model="open"
    :title="t('audit_detail_title')"
    size="760px"
    append-to-body
  >
    <div v-loading="loading">
      <template v-if="operation && initiator">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item
            v-for="[label, value] in requiredRows(initiator)"
            :key="label"
            :label="t(label)"
          >
            {{ value }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="initiator.reason"
            :label="t('audit_field_reason')"
          >
            {{ message(initiator.reason) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="initiator.summary"
            :label="t('audit_field_summary')"
          >
            {{ message(initiator.summary) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="initiator.node"
            :label="t('audit_field_node')"
          >
            {{
              [initiator.node.service, initiator.node.host, initiator.node.ip]
                .filter(Boolean)
                .join(' / ')
            }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="initiator.forwardedFor"
            :label="t('audit_field_forwarded_for')"
          >
            {{ initiator.forwardedFor }}
            <span class="color-info">{{
              t('audit_forwarded_unverified')
            }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <template v-if="!initiator.legacy && initiator.detailLevel">
          <div class="fw-sub mt-4 mb-2">{{ t('audit_section_changes') }}</div>
          <ul v-if="initiator.changes?.length" class="audit-list">
            <li v-for="change in initiator.changes" :key="change.field">
              {{ changeText(change, tr) }}
            </li>
          </ul>
          <div v-else class="color-info">{{ t('audit_value_no_diff') }}</div>
          <div class="color-info fs-8 mt-1">{{ t('audit_secret_note') }}</div>
        </template>

        <template v-if="initiator.batch">
          <div class="fw-sub mt-4 mb-2">
            {{ t('audit_section_batch') }}：{{
              batchSummary(initiator.batch, tr)
            }}
          </div>
          <el-table :data="initiator.batch.items" size="small" max-height="260">
            <el-table-column :label="t('audit_field_object')" min-width="180">
              <template #default="{ row }">{{
                row.objectName || row.objectId
              }}</template>
            </el-table-column>
            <el-table-column :label="t('audit_field_outcome')" width="110">
              <template #default="{ row }">
                <el-tag
                  :type="outcomeView(row.outcome, tr).type"
                  size="small"
                  >{{ outcomeView(row.outcome, tr).text }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column :label="t('audit_field_reason')" min-width="180">
              <template #default="{ row }">{{ message(row.reason) }}</template>
            </el-table-column>
          </el-table>
        </template>

        <div class="fw-sub mt-4 mb-2">{{ t('audit_section_timeline') }}</div>
        <el-timeline>
          <el-timeline-item
            v-for="event in operation.events"
            :key="event.eventId"
            :timestamp="`${fmt(event.timestamp)} · ${event.eventId}`"
            :type="outcomeView(event.outcome, tr).type"
          >
            {{ t(`audit_phase_${(event.phase || 'SINGLE').toLowerCase()}`) }} ·
            {{ operatorText(event, tr) }} ·
            {{ outcomeView(event.outcome, tr).text }}
            <span v-if="event.reason" class="color-info"
              >（{{ message(event.reason) }}）</span
            >
          </el-timeline-item>
          <el-timeline-item v-if="operation.pending" type="info">
            {{ t('audit_pending_final') }}
          </el-timeline-item>
        </el-timeline>
      </template>
      <el-empty
        v-else-if="!loading"
        :description="t('audit_detail_not_found')"
      />
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
.audit-list {
  margin: 0;
  padding-left: 18px;
  line-height: 22px;
}
</style>
