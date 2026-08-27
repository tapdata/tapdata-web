<script setup lang="ts">
import {
  fetchWorkflowRuns,
  type WorkflowRunDto,
  type WorkflowRunStatus,
  type WorkflowTriggerType,
} from '@tap/api/src/core/workflows'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import {
  RUN_STATUSES,
  runStatusLabelKey,
  runStatusTagType,
  TRIGGER_TYPES,
  triggerLabelKey,
} from './constants'
import { formatDateTime, formatDuration } from './helpers'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const table = ref<any>()

const workflowId = computed(() => (route.params.id as string) || '')

const searchParams = ref({
  triggerType: '',
  status: '',
  from: '',
  to: '',
})

const filterItems = computed(() => [
  {
    label: t('packages_business_workflow_trigger_type'),
    key: 'triggerType',
    type: 'select-inner',
    items: TRIGGER_TYPES.concat(['MANUAL_TEST' as WorkflowTriggerType]).map(
      (type) => ({
        label: t(triggerLabelKey(type)),
        value: type,
      }),
    ),
  },
  {
    label: t('public_status'),
    key: 'status',
    type: 'select-inner',
    items: RUN_STATUSES.map((status) => ({
      label: t(runStatusLabelKey(status)),
      value: status,
    })),
  },
  {
    label: t('packages_business_workflow_time_range'),
    key: 'from,to',
    type: 'datetimerange',
  },
])

const getData = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const { current, size } = page
  const data = await fetchWorkflowRuns({
    workflowId: workflowId.value || undefined,
    triggerType: (searchParams.value.triggerType ||
      undefined) as WorkflowTriggerType,
    status: (searchParams.value.status || undefined) as WorkflowRunStatus,
    from: searchParams.value.from ? Number(searchParams.value.from) : undefined,
    to: searchParams.value.to ? Number(searchParams.value.to) : undefined,
    skip: (current - 1) * size,
    limit: size,
  })
  return { total: data?.total || 0, data: data?.items || [] }
}

function openRun(row: WorkflowRunDto) {
  router.push({ name: 'workflowRunDetail', params: { runId: row.id } })
}
</script>

<template>
  <PageContainer>
    <TablePage ref="table" row-key="id" :remote-method="getData">
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table?.fetch(1)"
        />
      </template>
      <ElTableColumn
        prop="id"
        :label="t('packages_business_workflow_run_id')"
        min-width="180"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <ElLink type="primary" @click="openRun(row)">{{ row.id }}</ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="!workflowId"
        prop="workflowName"
        :label="t('packages_business_workflow_name')"
        min-width="160"
        show-overflow-tooltip
      />
      <ElTableColumn :label="t('public_version')" width="80">
        <template #default="{ row }">v{{ row.workflowVersion }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_trigger_type')"
        min-width="140"
      >
        <template #default="{ row }">
          {{ t(triggerLabelKey(row.triggerType)) }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('public_status')" width="150">
        <template #default="{ row }">
          <ElTag :type="runStatusTagType(row.status)" size="small">
            {{ t(runStatusLabelKey(row.status)) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('public_start_time')" width="170">
        <template #default="{ row }">
          {{ formatDateTime(row.startedAt) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_duration')"
        width="100"
      >
        <template #default="{ row }">
          {{ formatDuration(row.durationMs) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_resume_count')"
        width="90"
      >
        <template #default="{ row }">{{ row.resumeCount || 0 }}</template>
      </ElTableColumn>
      <ElTableColumn
        :label="t('packages_business_workflow_started_by')"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="{ row }">{{ row.startedBy || '-' }}</template>
      </ElTableColumn>
    </TablePage>
  </PageContainer>
</template>
