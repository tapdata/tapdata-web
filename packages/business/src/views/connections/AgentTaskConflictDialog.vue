<script setup lang="ts">
import {
  checkConnectionAgentSettings,
  type BatchUpdateConnectionAgentSettingsParams,
  type ConnectionAgentConflictReport,
} from '@tap/api/src/core/connections'
import { useI18n } from '@tap/i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { conflictTaskRoutes } from './connectionAgentConflicts'
import { STATUS_MAP } from '../../shared'

const { t } = useI18n()
const router = useRouter()
const visible = ref(false)
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const report = ref<ConnectionAgentConflictReport>({
  total: 0,
  hiddenCount: 0,
  hasConflicts: false,
  items: [],
})
let payload: BatchUpdateConnectionAgentSettingsParams | null = null
let generation = 0

function open(
  settings: BatchUpdateConnectionAgentSettingsParams,
  data: ConnectionAgentConflictReport,
) {
  generation += 1
  payload = settings
  report.value = data
  page.value = 1
  loading.value = false
  visible.value = true
}

async function changePage(nextPage: number) {
  if (!payload || loading.value) return
  const current = generation
  loading.value = true
  try {
    const data = await checkConnectionAgentSettings({
      ...payload,
      skip: (nextPage - 1) * pageSize,
      limit: pageSize,
    })
    if (current !== generation) return
    report.value = data
    page.value = nextPage
  } catch {
    // The request client displays the error; keep the current page available for retry.
  } finally {
    if (current === generation) loading.value = false
  }
}

function statusLabel(status: string) {
  const entry = STATUS_MAP[status as keyof typeof STATUS_MAP]
  return entry ? t(entry.i18n) : status
}

function openTask(item: ConnectionAgentConflictReport['items'][number]) {
  const name = conflictTaskRoutes[item.syncType]
  if (!name || !router.hasRoute(name)) return
  window.open(
    router.resolve({ name, query: { keyword: item.name } }).href,
    '_blank',
    'noopener',
  )
}

defineExpose({ open })
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="t('packages_business_agent_conflict_title')"
    width="900px"
    append-to-body
    @closed="generation += 1"
  >
    <ElAlert
      type="warning"
      :closable="false"
      :title="
        t('packages_business_agent_conflict_summary', {
          count: report.total + report.hiddenCount,
        })
      "
    />
    <ElAlert
      v-if="report.hiddenCount"
      class="mt-3"
      type="warning"
      :closable="false"
      :title="
        t('packages_business_agent_conflict_hidden', {
          count: report.hiddenCount,
        })
      "
    />
    <ElTable
      v-loading="loading"
      class="mt-4"
      :data="report.items"
      max-height="420"
    >
      <ElTableColumn
        :label="t('public_task_name')"
        min-width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <ElLink
            v-if="router.hasRoute(conflictTaskRoutes[row.syncType] || '')"
            type="primary"
            @click="openTask(row)"
            >{{ row.name }}</ElLink
          >
          <span v-else>{{ row.name }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_type')"
        width="110"
      >
        <template #default="{ row }">{{
          t(`packages_business_agent_conflict_type_${row.syncType}`)
        }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_status')"
        width="100"
      >
        <template #default="{ row }">{{ statusLabel(row.status) }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_connections')"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="{ row }">{{
          row.connections
            .map((connection) => connection.name || connection.id)
            .join(', ')
        }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_agent_conflict_reason')"
        min-width="230"
      >
        <template #default="{ row }">{{
          t(
            row.code === 'Task.SourceAgentConflict'
              ? 'packages_business_agent_conflict_reason_connections'
              : 'packages_business_agent_conflict_reason_task',
          )
        }}</template>
      </ElTableColumn>
    </ElTable>
    <ElPagination
      v-if="report.total > pageSize"
      class="mt-4"
      :disabled="loading"
      :current-page="page"
      :page-size="pageSize"
      :total="report.total"
      layout="total, prev, pager, next"
      @current-change="changePage"
    />
    <template #footer>
      <ElButton @click="visible = false">{{
        t('public_button_cancel')
      }}</ElButton>
    </template>
  </ElDialog>
</template>
