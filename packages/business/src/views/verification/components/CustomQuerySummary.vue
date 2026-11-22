<script setup lang="ts">
defineProps<{ stats: any; details?: any[] }>()
const states: Record<string, string> = {
  success: 'success',
  pending: 'pending',
  running: 'running',
  cancelled: 'cancelled',
  timeout: 'timeoutState',
  error: 'error',
}
function display(
  record: Record<string, unknown> | null | undefined,
  field?: string,
) {
  if (!record) return '—'
  const value = field ? record[field] : record
  return value === null ? 'NULL' : (JSON.stringify(value) ?? '—')
}
</script>

<template>
  <div class="p-3">
    <h4 class="mb-3">{{ $t('packages_business_verification_cq_summary') }}</h4>
    <el-table
      :data="[
        { label: $t('public_source_connection'), ...stats.sourceQuery },
        { label: $t('public_target_connection'), ...stats.targetQuery },
      ]"
      border
    >
      <el-table-column prop="label" />
      <el-table-column :label="$t('packages_business_verification_cq_status')"
        ><template #default="{ row }">{{
          $t(
            `packages_business_verification_cq_${states[row.status] || 'pending'}`,
          )
        }}</template></el-table-column
      >
      <el-table-column
        prop="rows"
        :label="$t('packages_business_verification_cq_rows')"
      />
      <el-table-column
        prop="durationMillis"
        :label="$t('packages_business_verification_cq_duration')"
      />
    </el-table>
    <el-alert
      v-if="stats.bothEmpty"
      class="my-2"
      type="success"
      :closable="false"
      :title="$t('packages_business_verification_cq_bothEmpty')"
    />
    <el-descriptions
      v-if="stats.status === 'done'"
      class="my-3"
      :column="3"
      border
    >
      <el-descriptions-item
        :label="$t('packages_business_verification_cq_matched')"
        >{{ stats.row_passed }}</el-descriptions-item
      >
      <el-descriptions-item
        :label="$t('packages_business_verification_cq_sourceOnly')"
        >{{ stats.source_only }}</el-descriptions-item
      >
      <el-descriptions-item
        :label="$t('packages_business_verification_cq_targetOnly')"
        >{{ stats.target_only }}</el-descriptions-item
      >
      <el-descriptions-item
        :label="$t('packages_business_verification_cq_differentRows')"
        >{{ stats.row_failed }}</el-descriptions-item
      >
      <el-descriptions-item
        :label="$t('packages_business_verification_cq_differentFields')"
        >{{ stats.differentFields }}</el-descriptions-item
      >
    </el-descriptions>
    <p class="my-2">
      {{ $t('packages_business_verification_cq_ignored') }}:
      {{
        stats.customQueryConfig?.mappings
          ?.filter((m: any) => m.role === 'ignore')
          .map((m: any) => [m.source, m.target].filter(Boolean).join(' / '))
          .join(', ') || '—'
      }}
    </p>
    <el-table v-if="details?.length" :data="details" border>
      <el-table-column
        :label="$t('packages_business_verification_cq_resultKey')"
        ><template #default="{ row }">{{
          row.resultKey
        }}</template></el-table-column
      >
      <el-table-column :label="$t('packages_business_verification_cq_role')"
        ><template #default="{ row }">{{
          $t(`packages_business_verification_cq_${row.differenceType}`)
        }}</template></el-table-column
      >
      <el-table-column :label="$t('packages_business_verification_cq_field')"
        ><template #default="{ row }"
          >{{ row.sourceField }} / {{ row.targetField }}</template
        ></el-table-column
      >
      <el-table-column
        :label="$t('packages_business_verification_cq_sourceValue')"
        ><template #default="{ row }">{{
          display(row.source, row.sourceField)
        }}</template></el-table-column
      >
      <el-table-column
        :label="$t('packages_business_verification_cq_targetValue')"
        ><template #default="{ row }">{{
          display(row.target, row.targetField)
        }}</template></el-table-column
      >
    </el-table>
  </div>
</template>
