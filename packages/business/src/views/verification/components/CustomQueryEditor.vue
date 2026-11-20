<script setup lang="ts">
import { testInspectQuery } from '@tap/api/src/core/inspects'
import { SqlEditor } from '@tap/form/src/components/sql-editor'
import { reactive, watch } from 'vue'
import { autoMappings, defaultQueryConfig, type QueryItem } from './customQuery'
const props = defineProps<{ item: QueryItem }>()
const sides = ['source', 'target'] as const
const busy = reactive({ source: false, target: false })
const errors = reactive({ source: '', target: '' })
let applyingTimezone = false
const item = props.item
const columnIdentity = (snapshot: QueryItem['source']['querySnapshot']) =>
  JSON.stringify(snapshot?.columns.map(({ name, type }) => [name, type]).sort())
const testedColumns = {
  source: columnIdentity(item.source.querySnapshot),
  target: columnIdentity(item.target.querySnapshot),
}
item.customQueryConfig ||= defaultQueryConfig()
function identity(side: 'source' | 'target') {
  const s = item[side]
  return JSON.stringify([
    s.connectionId,
    s.customQuery,
    s.queryKind,
    s.table,
    s.queryTimezone,
  ])
}
for (const side of sides) {
  const s = item[side]
  s.queryKind ||= /mongo/i.test(s.databaseType || '') ? 'mongoPipeline' : 'sql'
  watch(
    () => s.databaseType,
    (type) => {
      s.queryKind = /mongo/i.test(type || '') ? 'mongoPipeline' : 'sql'
    },
  )
  watch(
    () => identity(side),
    () => {
      if (applyingTimezone) return
      s.querySnapshot = null
      testedColumns[side] = columnIdentity(null)
      item.customQueryConfig!.mappings = []
      errors[side] = ''
    },
    { flush: 'sync' },
  )
}
watch(
  () => item.customQueryConfig!.ignoreCase,
  () => {
    // Alias uniqueness depends on this policy; confirm both schemas under the new policy.
    for (const side of sides) item[side].querySnapshot = null
  },
  { flush: 'sync' },
)
async function test(side: 'source' | 'target') {
  const s = item[side]
  const current = identity(side)
  const ignoreCase = item.customQueryConfig!.ignoreCase
  busy[side] = true
  s.querySnapshot = null
  errors[side] = ''
  try {
    const result = await testInspectQuery({
      connectionId: s.connectionId,
      query: s.customQuery,
      kind: s.queryKind,
      collection: s.table,
      timezone: s.queryTimezone,
      timeoutSeconds: item.customQueryConfig!.timeoutSeconds,
      ignoreCase,
    })
    if (
      current !== identity(side) ||
      ignoreCase !== item.customQueryConfig!.ignoreCase
    )
      return
    if (testedColumns[side] !== columnIdentity(result))
      item.customQueryConfig!.mappings = []
    testedColumns[side] = columnIdentity(result)
    applyingTimezone = true
    try {
      s.queryTimezone = result.timezone || s.queryTimezone
    } finally {
      applyingTimezone = false
    }
    s.querySnapshot = result
    if (
      item.source.querySnapshot &&
      item.target.querySnapshot &&
      !item.customQueryConfig!.mappings.length
    )
      item.customQueryConfig!.mappings = autoMappings(item)
  } catch (error: any) {
    if (
      current === identity(side) &&
      ignoreCase === item.customQueryConfig!.ignoreCase
    )
      errors[side] = error?.message || String(error)
  } finally {
    busy[side] = false
  }
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4 mt-3">
    <div v-for="side in sides" :key="side" class="min-w-0">
      <el-form-item
        v-if="item[side].queryKind === 'mongoPipeline'"
        :label="$t('packages_business_verification_cq_collection')"
      >
        <el-input v-model="item[side].table" />
      </el-form-item>
      <el-form-item
        :label="
          $t(
            item[side].queryKind === 'mongoPipeline'
              ? 'packages_business_verification_cq_pipeline'
              : 'packages_business_verification_cq_sql',
          )
        "
      >
        <SqlEditor v-model:value="item[side].customQuery" />
      </el-form-item>
      <el-form-item :label="$t('packages_business_verification_cq_timezone')">
        <el-input v-model="item[side].queryTimezone" />
      </el-form-item>
      <el-button
        :loading="busy[side]"
        :disabled="!item[side].connectionId || !item[side].customQuery?.trim()"
        @click="test(side)"
        >{{ $t('packages_business_verification_cq_test') }}</el-button
      >
      <el-alert
        v-if="errors[side]"
        class="mt-2"
        type="error"
        :title="errors[side]"
        :closable="false"
      />
      <el-alert
        v-if="!item[side].querySnapshot"
        class="mt-2"
        type="info"
        :title="$t('packages_business_verification_cq_testRequired')"
        :closable="false"
      />
      <template v-else>
        <p class="my-2">
          {{ $t('packages_business_verification_cq_preview') }}
        </p>
        <el-table
          :data="item[side].querySnapshot!.rows"
          max-height="240"
          border
        >
          <el-table-column
            v-for="column in item[side].querySnapshot!.columns"
            :key="column.name"
            :prop="column.name"
            :label="`${column.name} (${column.type})`"
            min-width="130"
          />
        </el-table>
      </template>
      <el-alert
        v-if="/paimon/i.test(item[side].databaseType || '')"
        class="mt-2"
        :title="$t('packages_business_verification_cq_paimon')"
        type="warning"
        :closable="false"
      />
    </div>
  </div>
  <el-alert
    class="my-3"
    type="info"
    :closable="false"
    :title="$t('packages_business_verification_cq_rules')"
  />
  <el-table
    v-if="item.source.querySnapshot && item.target.querySnapshot"
    :data="item.customQueryConfig!.mappings"
    border
  >
    <el-table-column
      :label="$t('packages_business_verification_sourceFieldName')"
    >
      <template #default="{ row }"
        ><el-select v-model="row.source" clearable
          ><el-option
            v-for="c in item.source.querySnapshot.columns"
            :key="c.name"
            :value="c.name"
            :label="`${c.name} (${c.type})`" /></el-select
      ></template>
    </el-table-column>
    <el-table-column
      :label="$t('packages_business_verification_targetFieldName')"
    >
      <template #default="{ row }"
        ><el-select v-model="row.target" clearable
          ><el-option
            v-for="c in item.target.querySnapshot.columns"
            :key="c.name"
            :value="c.name"
            :label="`${c.name} (${c.type})`" /></el-select
      ></template>
    </el-table-column>
    <el-table-column :label="$t('packages_business_verification_cq_role')">
      <template #default="{ row }"
        ><el-select v-model="row.role"
          ><el-option
            v-for="role in ['key', 'compare', 'ignore']"
            :key="role"
            :value="role"
            :label="
              $t(`packages_business_verification_cq_${role}`)
            " /></el-select
      ></template>
    </el-table-column>
    <el-table-column width="80"
      ><template #default="{ $index }"
        ><el-button
          text
          @click="item.customQueryConfig!.mappings.splice($index, 1)"
          >{{ $t('public_button_delete') }}</el-button
        ></template
      ></el-table-column
    >
  </el-table>
  <el-button
    v-if="item.source.querySnapshot && item.target.querySnapshot"
    class="my-2"
    @click="item.customQueryConfig!.mappings.push({ role: 'compare' })"
    >{{ $t('packages_business_verification_cq_addMapping') }}</el-button
  >
  <div class="flex gap-4 mt-3">
    <el-form-item :label="$t('packages_business_verification_cq_timeout')"
      ><el-input-number
        v-model="item.customQueryConfig!.timeoutSeconds"
        :min="1"
        :max="3600"
        :precision="0"
    /></el-form-item>
    <el-form-item :label="$t('packages_business_verification_cq_maxRows')"
      ><el-input-number
        v-model="item.customQueryConfig!.maxRows"
        :min="1"
        :max="10000"
        :precision="0"
    /></el-form-item>
    <el-checkbox v-model="item.customQueryConfig!.ignoreCase">{{
      $t('packages_business_verification_cq_ignoreCase')
    }}</el-checkbox>
  </div>
</template>
