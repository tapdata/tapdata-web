<script setup lang="ts">
import {
  downloadRecoverSql,
  exportRecoverSql,
  getTaskInspectHistoriesResults,
  getTaskInspectResultsGroupByTable,
  getTaskInspectResultsLastOp,
  manualCheck,
  manualRecover,
  type DiffRow,
  type InspectionRow,
} from '@tap/api/src/core/task-inspect'
import { useRequest } from '@tap/api/src/request'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { CloseIcon } from '@tap/component/src/CloseIcon'
import FilterItemSelect from '@tap/component/src/filter-bar/FilterItemSelect.vue'
import { FilterConditionsOutlined } from '@tap/component/src/icon/FilterConditionsOutlined'
import { SettingInterOutlined } from '@tap/component/src/icon/SettingInterOutlined'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { copyToClipboard, downloadBlob } from '@tap/shared/src/util'
import { debounce } from 'lodash-es'
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import InspectRecordDialog from './InspectRecordDialog.vue'

const props = defineProps({
  inspectId: {
    type: String,
    default: '',
  },
  pingTime: {
    type: String,
    default: '',
  },
  taskId: {
    type: String,
    default: '',
  },
})

const visible = defineModel<boolean>('modelValue', {
  required: true,
})

const { t } = useI18n()
const diffListContainer = useTemplateRef<HTMLElement>('diffListContainer')
const inspectList = ref<InspectionRow[]>([])
const rowDiffList = ref<DiffRow[]>([])
const loadingDetails = ref(false)
const currentSelectedRow = ref<InspectionRow | null | undefined>()
const onlyShowDiffFields = ref(true)
const progress = ref(0)
const lastOpTime = ref('')
const lastOpDate = ref('')
const diffFilterType = ref()
const exportClicked = ref(false)
const pageState = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})
const tablePageState = reactive({
  keyword: '',
  page: 1,
  pageSize: 10,
  total: 0,
})
const opState = reactive({
  type: '',
  loading: false,
  progress: 0,
  fromNow: '',
  date: '',
  manualId: '',
})
const innerFields = [
  { label: t('packages_dag_inspect_row_id'), value: 'rowId' },
  { label: t('packages_dag_inspect_manual_id'), value: 'manualId' },
]
const sourceFields = ref<{ label: string; value: string }[]>([])
const targetFields = ref<{ label: string; value: string }[]>([])

const conditions = reactive({
  inner: {
    field: '',
    operator: '$eq',
    value: '',
  },
  source: {
    field: '',
    operator: '$eq',
    value: '',
  },
  target: {
    field: '',
    operator: '$eq',
    value: '',
  },
})

const showExportRecoverSqlProgress = computed(() => {
  return opState.loading && opState.type === 'exportRecoverSql'
})

const showCheckProgress = computed(() => {
  return opState.loading && opState.type === 'manualCheck'
})

const showRecoverProgress = computed(() => {
  return opState.loading && opState.type === 'manualRecover'
})

// Constants
const diffFilterTypes = [
  {
    label: t('packages_dag_inspect_diff_type_diff'),
    value: 'DIFF',
    type: 'danger',
  },
  {
    label: t('packages_dag_inspect_diff_type_miss'),
    value: 'MISS',
  },
  {
    label: t('packages_dag_inspect_diff_type_more'),
    value: 'MORE',
    type: 'warning',
  },
]
const conditionOperators = [
  { label: t('public_equal'), value: '$eq' },
  { label: t('public_not_equal'), value: '$ne' },
  { label: t('public_greater_than'), value: '$gt' },
  { label: t('public_greater_than_or_equal'), value: '$gte' },
  { label: t('public_less_than'), value: '$lt' },
  { label: t('public_less_than_or_equal'), value: '$lte' },
  { label: t('public_contains'), value: '$regex' },
  { label: t('public_not_contains'), value: '$not' },
  { label: t('public_is_null'), value: '$null' },
  { label: t('public_is_not_null'), value: '$notNull' },
]

const tableTotalPage = computed(() => {
  return Math.ceil(tablePageState.total / tablePageState.pageSize)
})

const conditionCount = computed(() => {
  return Object.values(conditions).filter(
    (condition) =>
      condition.field &&
      (['$null', '$notNull'].includes(condition.operator) ||
        condition.value !== ''),
  ).length
})

watch(conditions, () => {
  if (currentSelectedRow.value) fetchDiffListDebounced(1)
})

function onClose(): void {
  resetData()
  stopPolling()
}

function resetData(): void {
  currentSelectedRow.value = null
  exportClicked.value = false
  tablePageState.page = 1
  tablePageState.keyword = ''
  pageState.page = 1
  diffFilterType.value = undefined
  clearAllConditions()
}

function mapFieldOptions(field: string): { label: string; value: string } {
  return {
    label: field,
    value: field,
  }
}

function setFieldOptions(): void {
  const [item] = rowDiffList.value
  sourceFields.value = item?.sourceFields?.map(mapFieldOptions) || []
  targetFields.value = item?.targetFields?.map(mapFieldOptions) || []
}

const { run: fetchDiffList, loading: loadingList } = useRequest(
  async (page?: number) => {
    if (page) {
      tablePageState.page = page
    }

    try {
      const data = await getTaskInspectResultsGroupByTable(props.inspectId, {
        limit: tablePageState.pageSize,
        skip: tablePageState.pageSize * (tablePageState.page - 1),
        tableName: tablePageState.keyword,
      })

      inspectList.value = data?.items || []
      tablePageState.total = data?.total || 0

      if (inspectList.value.length > 0) {
        if (currentSelectedRow.value) {
          const item = inspectList.value.find(
            (item) =>
              item.sourceTable === currentSelectedRow.value?.sourceTable,
          )
          currentSelectedRow.value = item || inspectList.value[0]
        } else {
          currentSelectedRow.value = inspectList.value[0]
        }

        fetchTableDiff().then(setFieldOptions)
      }
    } catch (error) {
      console.error('Failed to fetch inspect list:', error)
    }
  },
  {
    manual: true,
    debounceInterval: 200,
  },
)

function genWhereCondition(
  condition: 'source' | 'target' | 'inner',
): Record<string, any> {
  const obj = conditions[condition]
  const where: Record<string, any> = {}
  const key = condition !== 'inner' ? `${condition}.${obj.field}` : obj.field

  if (
    !obj.field ||
    (!['$null', '$notNull'].includes(obj.operator) && !obj.value)
  ) {
    return where
  }

  if (obj.operator === '$null') {
    where[key] = null
  } else if (obj.operator === '$notNull') {
    where[key] = { $ne: null }
  } else if (obj.operator === '$not') {
    where[key] = { $not: { $eq: obj.value } }
  } else if (obj.operator === '$eq') {
    where[key] = obj.value
  } else {
    where[key] = { [obj.operator]: obj.value }
  }
  return where
}

async function fetchTableDiff(page?: number): Promise<void> {
  if (!props.inspectId) return

  loadingDetails.value = true

  if (page) {
    pageState.page = page
  }

  const filter = {
    page: pageState.page,
    limit: pageState.pageSize,
    where: {
      sourceTable: currentSelectedRow.value!.sourceTable,
      diffType: diffFilterType.value,
      ...genWhereCondition('source'),
      ...genWhereCondition('target'),
      ...genWhereCondition('inner'),
    },
  }

  try {
    const data = await getTaskInspectHistoriesResults(props.inspectId, filter)

    pageState.total = data?.total || 0

    rowDiffList.value = (data?.items || []).map((item: DiffRow) => {
      if (item.diffType === 'DIFF') {
        return {
          ...item,
          diffFieldsMap: item.diffFields.reduce(
            (acc: Record<string, string>, field: string) => {
              const index = item.sourceFields.indexOf(field)
              if (index !== -1 && item.targetFields[index]) {
                acc[field] = item.targetFields[index]
              }
              return acc
            },
            {},
          ),
        }
      }
      return item
    })
  } catch (error) {
    console.error('Failed to fetch inspect details:', error)
  } finally {
    loadingDetails.value = false
  }
}

const fetchDiffListDebounced = debounce(fetchDiffList, 200)

const loadLastOp = async () => {
  const data = await getTaskInspectResultsLastOp(props.taskId)

  if (!data) {
    progress.value = 0

    opState.type = ''
    opState.loading = false
    opState.progress = 0
    opState.fromNow = ''
    opState.date = ''
    opState.manualId = ''
    return
  }

  const loading = data.unfinished > 0
  const manualId = data.manualId

  if (!loading && opState.loading && opState.manualId === manualId) {
    if (data.manualType === 'exportRecoverSql' && exportClicked.value) {
      handleDownloadSql()
      exportClicked.value = false
    } else {
      ElMessage.success(t('public_message_operation_success'))
    }
  }

  progress.value =
    data.totals > 0
      ? Math.floor(((data.totals - data.unfinished) / data.totals) * 100)
      : 0

  lastOpTime.value = dayjs(data.created).fromNow()
  lastOpDate.value = dayjs(data.created).format('YYYY-MM-DD HH:mm:ss')

  opState.type = data.manualType
  opState.progress =
    data.totals > 0
      ? Math.floor(((data.totals - data.unfinished) / data.totals) * 100)
      : 0
  opState.fromNow = dayjs(data.created).fromNow()
  opState.date = dayjs(data.created).format('YYYY-MM-DD HH:mm:ss')
  opState.loading = loading
  opState.manualId = manualId
}

const handleManualCheck = async (resultId?: string) => {
  if (showRecoverProgress.value) {
    const result = await Modal.confirm(
      t('public_last_operation_not_finished'),
      t('public_start_check_confirm_tip', { time: lastOpTime.value }),
    )
    if (!result) {
      return
    }
  }
  runManualCheck(resultId ? [resultId] : undefined)
}

const { run: runManualCheck, loading: manualCheckLoading } = useRequest(
  async (resultIds?: string[]) => {
    await manualCheck(props.taskId, { resultIds })
    startPolling()
    ElMessage.success(t('public_start_check'))
  },
  {
    manual: true,
    loadingKeep: 500,
  },
)

const handleManualRecover = async (resultId?: string) => {
  if (showCheckProgress.value) {
    const result = await Modal.confirm(
      t('public_last_operation_not_finished'),
      t('public_start_repair_confirm_tip', { time: lastOpTime.value }),
    )
    if (!result) {
      return
    }
  }
  runManualRecover(resultId ? [resultId] : undefined)
}

const { run: runManualRecover, loading: manualRecoverLoading } = useRequest(
  async (resultIds?: string[]) => {
    await manualRecover(props.taskId, { resultIds })
    startPolling()
    ElMessage.success(t('public_start_repair'))
  },
  {
    manual: true,
    loadingKeep: 500,
  },
)

const { run: runExportRecoverSql, loading: exportRecoverSqlLoading } =
  useRequest(
    async (resultIds?: string[]) => {
      await exportRecoverSql(props.taskId, {
        resultIds,
      })
      startPolling()
      ElMessage.success(t('public_start_generate_recovery_sql'))
    },
    {
      manual: true,
      loadingKeep: 500,
    },
  )

const { run: startPolling, cancel: stopPolling } = useRequest(
  async () => {
    await loadLastOp()
    await fetchDiffList()

    if (!opState.loading) {
      stopPolling()
    }
  },
  {
    pollingInterval: 3000,
    manual: true,
  },
)

function handleRowClick(row: InspectionRow): void {
  if (currentSelectedRow.value === row) return
  currentSelectedRow.value = row
  diffListContainer.value?.scrollTo({ top: 0 })
  fetchTableDiff(1).then(setFieldOptions)
}

function onOpen(): void {
  if (props.inspectId) {
    // fetchDiffList()
    startPolling()
  }
}

const recordDialogVisible = ref(false)
const resultId = ref('')

function handleRecordClick(row: DiffRow): void {
  resultId.value = row.id
  recordDialogVisible.value = true
}

async function handleConfirmCheck(): Promise<void> {
  const result = await Modal.confirm(
    t('public_last_operation_not_finished'),
    t('public_start_check_confirm', { time: lastOpTime.value }),
  )

  if (result) {
    opState.loading = false
    runManualCheck()
  }
}

async function handleConfirmRecover(): Promise<void> {
  const result = await Modal.confirm(
    t('public_last_operation_not_finished'),
    t('public_start_repair_confirm', { time: lastOpTime.value }),
  )

  if (result) {
    opState.loading = false
    runManualRecover()
  }
}

function clearCondition(condition: 'source' | 'target' | 'inner'): void {
  conditions[condition].field = ''
  conditions[condition].operator = '$eq'
  conditions[condition].value = ''
}

function clearAllConditions(): void {
  clearCondition('source')
  clearCondition('target')
  clearCondition('inner')
}

function handleExportRecoverSql(resultId?: string): void {
  exportClicked.value = true
  runExportRecoverSql(resultId ? [resultId] : undefined)
}

async function handleDownloadSql(): Promise<void> {
  const res = await downloadRecoverSql(props.taskId, opState.manualId)
  downloadBlob(res)
  ElMessage.success(t('public_message_download_ok'))
}

function handleCopy(row: DiffRow): void {
  copyToClipboard(JSON.stringify(row, null, 2))
  ElMessage.success(t('public_message_copy_success'))
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="$t('packages_dag_inspect_detail_title')"
    width="80%"
    append-to-body
    class="inspect-detail-dialog p-0"
    :close-on-click-modal="false"
    :show-close="false"
    @open="onOpen"
    @close="onClose"
  >
    <template #title>
      <div class="flex align-items-center">
        <span>{{ $t('packages_dag_inspect_detail_title') }}</span>
        <template v-if="opState.date">
          <VIcon class="text-muted ml-4 mr-1" :size="14">time</VIcon>
          <span class="text-muted fs-8"
            >{{ $t('packages_dag_inspect_last_verify_time') }}:
            {{ opState.date }}</span
          >
        </template>
        <div class="flex-1" />

        <template v-if="inspectList.length">
          <div class="flex btn-group mr-3">
            <el-tooltip
              v-if="showExportRecoverSqlProgress"
              :content="t('public_start_at_time', { time: opState.fromNow })"
              placement="top"
            >
              <el-button bg text>
                <template #icon>
                  <el-icon class="is-loading" size="16">
                    <i-mingcute-loading-line />
                  </el-icon>
                </template>
                {{ $t('public_generate_recovery_sql') }} ({{ progress }}%)
              </el-button>
            </el-tooltip>
            <template v-else>
              <el-button
                text
                :loading="exportRecoverSqlLoading"
                :disabled="opState.loading"
                @click="handleExportRecoverSql()"
              >
                <template #icon>
                  <SettingInterOutlined />
                </template>
                {{ $t('public_generate_recovery_sql') }}
              </el-button>
              <el-button
                v-if="opState.type === 'exportRecoverSql' && !opState.loading"
                text
                @click="handleDownloadSql"
              >
                <el-icon size="16">
                  <i-lucide-download />
                </el-icon>
              </el-button>
            </template>

            <!-- <el-button
              text
              :loading="exportRecoverSqlLoading"
              :disabled="opState.loading"
              @click="handleExportRecoverSql()"
            >
              <template #icon>
                <SettingInterOutlined />
              </template>
              {{ $t('public_generate_recovery_sql') }}
            </el-button>
            <el-button
              v-if="opState.type === 'exportRecoverSql' && !opState.loading"
              text
              @click="handleDownloadSql"
            >
              <el-icon size="16">
                <i-lucide-download />
              </el-icon>
            </el-button> -->
          </div>

          <!-- <el-tooltip
            v-if="showExportRecoverSqlProgress"
            :content="t('public_start_at_time', { time: opState.fromNow })"
            placement="top"
          >
            <el-button bg text>
              <template #icon>
                <el-icon class="is-loading" size="16">
                  <i-mingcute-loading-line />
                </el-icon>
              </template>
              {{ $t('public_generate_recovery_sql') }} ({{ progress }}%)
            </el-button>
          </el-tooltip>
          <el-button
            v-else
            text
            :loading="exportRecoverSqlLoading"
            :disabled="opState.loading"
            @click="handleExportRecoverSql()"
          >
            <template #icon>
              <SettingInterOutlined />
            </template>
            {{ $t('public_generate_recovery_sql') }}
          </el-button> -->

          <el-button
            v-if="!showCheckProgress"
            text
            :loading="manualCheckLoading"
            :disabled="manualRecoverLoading"
            @click="handleManualCheck()"
          >
            <template #icon>
              <i-lucide-git-compare-arrows />
            </template>
            {{ $t('public_diff_check') }}
          </el-button>

          <el-tooltip
            v-else
            :content="t('public_start_at_time', { time: lastOpTime })"
            placement="top"
          >
            <el-button bg text @click="handleConfirmCheck">
              <template #icon>
                <el-icon class="is-loading" size="16">
                  <i-mingcute-loading-line />
                </el-icon>
              </template>
              {{ $t('public_checking') }} ({{ progress }}%)
            </el-button>
          </el-tooltip>

          <el-button
            v-if="!showRecoverProgress"
            text
            :loading="manualRecoverLoading"
            :disabled="manualCheckLoading"
            @click="handleManualRecover()"
          >
            <template #icon>
              <i-lucide-wand-sparkles />
            </template>
            {{ $t('public_one_key_repair') }}
          </el-button>

          <el-tooltip
            v-else
            :content="t('public_start_at_time', { time: lastOpTime })"
            placement="top"
          >
            <el-button bg text @click="handleConfirmRecover">
              <template #icon>
                <el-icon class="is-loading" size="16">
                  <i-mingcute-loading-line />
                </el-icon>
              </template>
              {{ $t('public_repairing') }} ({{ progress }}%)
            </el-button>
          </el-tooltip>
          <el-divider class="mx-3" direction="vertical" />
        </template>

        <el-button
          text
          size="small"
          :icon="CloseIcon"
          @click="visible = false"
        />
      </div>
    </template>
    <div class="inspect-detail-container border-top">
      <div
        v-loading="loadingList"
        :class="
          inspectList.length || loadingList || tablePageState.keyword
            ? 'flex'
            : 'none'
        "
        style="min-height: 400px"
      >
        <div class="inspection-result-list bg-light flex flex-column">
          <div class="p-3">
            <el-input
              v-model="tablePageState.keyword"
              :placeholder="
                $t('packages_form_table_rename_index_sousuobiaoming')
              "
              clearable
              @input="fetchDiffList(1)"
            >
              <template #prefix>
                <el-icon><i-lucide-search /></el-icon>
              </template>
            </el-input>
          </div>
          <div
            class="flex flex-column gap-3 p-3 pt-0 flex-1 min-h-0 overflow-y-auto"
          >
            <div
              v-for="(row, index) in inspectList"
              :key="index"
              class="inspection-result-card p-3 bg-card rounded-xl shadow-sm"
              :class="{ 'border-primary': currentSelectedRow === row }"
              @click="handleRowClick(row)"
            >
              <div>
                <div
                  class="flex align-items-center gap-2 fs-6 font-color-dark break-all"
                >
                  <VIcon :size="20">table</VIcon>
                  <div
                    v-if="row.sourceTable !== row.targetTable"
                    class="flex align-center gap-1"
                  >
                    <VIcon class="mt-1" size="16">ArrowsTurnForward</VIcon>
                    <div>
                      <div class="font-color-light fs-7">
                        {{ row.sourceTable || '-' }}
                      </div>
                      <div>{{ row.targetTable || '-' }}</div>
                    </div>
                  </div>
                  <div v-else>{{ row.targetTable || '-' }}</div>
                </div>
              </div>

              <div class="flex mt-2 gap-3">
                <ElTag
                  v-if="row.countDiff > 0"
                  class="rounded-4"
                  size="small"
                  type="danger"
                >
                  {{
                    $t('packages_dag_inspect_diff_records_num', {
                      num: row.countDiff,
                    })
                  }}
                </ElTag>
                <ElTag
                  v-if="row.countMore > 0"
                  class="rounded-4"
                  size="small"
                  type="warning"
                >
                  {{
                    $t('packages_dag_inspect_target_more_num', {
                      num: row.countMore,
                    })
                  }}
                </ElTag>
                <ElTag
                  v-if="row.countMiss > 0"
                  class="rounded-4 tag-amber"
                  size="small"
                >
                  {{
                    $t('packages_dag_inspect_target_less_num', {
                      num: row.countMiss,
                    })
                  }}
                </ElTag>
              </div>
            </div>

            <el-empty v-if="!loadingList && !inspectList.length" />
          </div>

          <el-pagination
            v-model:current-page="tablePageState.page"
            hide-on-single-page
            class="table-pagination justify-center py-3"
            layout="prev, jumper, slot, next"
            :total="tablePageState.total"
            :page-size="tablePageState.pageSize"
            @change="fetchDiffList()"
          >
            <span class="mx-3">/</span>
            <span class="mr-2">{{ tableTotalPage }}</span>
          </el-pagination>
        </div>

        <div
          v-loading="loadingDetails"
          class="bg-card border-left flex-1 flex flex-column"
        >
          <div class="flex align-center gap-3 px-4 py-3 border-bottom">
            <span
              class="bg-subtle rounded-lg px-3 lh-8 cursor-pointer"
              :class="{
                'active-primary': onlyShowDiffFields,
              }"
              @click="onlyShowDiffFields = true"
              >{{
                $t('packages_business_verification_details_jinxianshichayi')
              }}</span
            >

            <span
              class="bg-subtle rounded-lg px-3 lh-8 cursor-pointer"
              :class="{
                'active-primary': !onlyShowDiffFields,
              }"
              @click="onlyShowDiffFields = false"
              >{{
                $t('packages_business_verification_details_xianshiwanzhengzi')
              }}</span
            >
            <el-divider direction="vertical" class="mx-0" />
            <FilterItemSelect
              v-model="diffFilterType"
              :label="$t('packages_dag_src_editor_leixingguolu')"
              :items="diffFilterTypes"
              clearable
              @change="fetchTableDiff(1)"
            >
              <template #label="{ label, value }">
                <ElTag
                  class="rounded-4"
                  size="small"
                  :type="
                    value === 'DIFF'
                      ? 'danger'
                      : value === 'MORE'
                        ? 'warning'
                        : undefined
                  "
                  :class="{ 'tag-amber': value === 'MISS' }"
                >
                  {{ label }}
                </ElTag>
              </template>
              <template #default="{ item }">
                <div class="flex align-center h-100">
                  <ElTag
                    class="rounded-4"
                    size="small"
                    :type="item.type"
                    :class="{ 'tag-amber': item.value === 'MISS' }"
                  >
                    {{ item.label }}
                  </ElTag>
                </div></template
              >
            </FilterItemSelect>
            <el-popover trigger="click" width="480px" :hide-after="0">
              <template #reference>
                <el-button
                  class="px-3"
                  :class="{ 'is-active': conditionCount > 0 }"
                  style="--el-button-text-color: var(--icon-n2)"
                >
                  <template #icon>
                    <el-icon size="16">
                      <FilterConditionsOutlined />
                    </el-icon>
                  </template>
                  <span v-if="conditionCount > 0" class="mr-1">{{
                    conditionCount
                  }}</span>
                  <span>{{ $t('public_filter') }}</span>
                  <div
                    v-if="conditionCount > 0"
                    class="rounded-4 p-0.5 hover:primary-hover ml-1"
                    @click.stop="clearAllConditions"
                  >
                    <el-icon class="align-top">
                      <i-lucide-x />
                    </el-icon>
                  </div>
                </el-button>
              </template>
              <div>
                <!-- <div class="font-color-sslight">设置筛选条件</div> -->
                <div
                  class="grid"
                  style="
                    grid-template-columns: auto 1fr;
                    row-gap: 0.5rem;
                    column-gap: 1rem;
                  "
                >
                  <div>
                    <FilterItemSelect
                      v-model="conditions.source.field"
                      class="w-100"
                      :label="$t('packages_dag_inspect_source_field')"
                      placeholder=""
                      :items="sourceFields"
                      :teleported="false"
                      clearable
                    />
                  </div>
                  <div class="flex align-center gap-2">
                    <el-select
                      v-model="conditions.source.operator"
                      :options="conditionOperators"
                      class="is-w-auto"
                      :teleported="false"
                    />
                    <el-input
                      v-if="
                        conditions.source.operator !== '$null' &&
                        conditions.source.operator !== '$notNull'
                      "
                      v-model="conditions.source.value"
                      :placeholder="$t('public_input_placeholder')"
                      class="flex-1"
                    />
                    <el-button
                      text
                      size="small"
                      class="ml-auto"
                      @click="clearCondition('source')"
                    >
                      <template #icon>
                        <i-lucide-x />
                      </template>
                    </el-button>
                  </div>
                  <div>
                    <FilterItemSelect
                      v-model="conditions.target.field"
                      :label="$t('packages_dag_inspect_target_field')"
                      placeholder=""
                      class="w-100"
                      :items="targetFields"
                      :teleported="false"
                      clearable
                    />
                  </div>
                  <div class="flex align-center gap-2">
                    <el-select
                      v-model="conditions.target.operator"
                      :options="conditionOperators"
                      class="is-w-auto"
                      :teleported="false"
                    />
                    <el-input
                      v-if="
                        conditions.target.operator !== '$null' &&
                        conditions.target.operator !== '$notNull'
                      "
                      v-model="conditions.target.value"
                      :placeholder="$t('public_input_placeholder')"
                    />
                    <el-button
                      text
                      size="small"
                      class="ml-auto"
                      @click="clearCondition('target')"
                    >
                      <template #icon>
                        <i-lucide-x />
                      </template>
                    </el-button>
                  </div>
                  <div>
                    <FilterItemSelect
                      v-model="conditions.inner.field"
                      label=""
                      class="w-100"
                      :items="innerFields"
                      :teleported="false"
                      clearable
                    />
                  </div>
                  <div class="flex align-center gap-2">
                    <el-select
                      v-model="conditions.inner.operator"
                      :options="conditionOperators"
                      class="is-w-auto"
                      :teleported="false"
                      readonly
                      disabled
                    />
                    <el-input
                      v-model="conditions.inner.value"
                      :placeholder="$t('public_input_placeholder')"
                    />
                    <el-button
                      text
                      size="small"
                      class="ml-auto"
                      @click="clearCondition('inner')"
                    >
                      <template #icon>
                        <i-lucide-x />
                      </template>
                    </el-button>
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
          <div ref="diffListContainer" class="overflow-y-auto p-4 min-h-0">
            <div class="flex flex-column gap-4">
              <div
                v-for="(row, index) in rowDiffList"
                :key="index"
                class="border rounded-xl overflow-hidden"
              >
                <table
                  v-if="row.diffType === 'DIFF'"
                  class="w-100 row-diff-table font-color-dark"
                >
                  <thead class="bg-light border-bottom">
                    <tr>
                      <th
                        class="text-start p-3 text-sm fw-sub text-muted-foreground w-1/4 break-all"
                      >
                        <div class="flex align-center gap-2">
                          {{
                            $t(
                              'packages_business_verification_result_field_name',
                            )
                          }}
                          <ElTag class="rounded-4" size="small" type="danger">
                            {{ $t('packages_dag_inspect_diff_type_diff') }}
                          </ElTag>
                        </div>
                      </th>
                      <th
                        class="text-start p-3 text-sm fw-sub text-muted-foreground w-[37.5%] break-all"
                      >
                        {{ $t('packages_dag_inspect_source_value') }}
                      </th>
                      <th
                        class="text-start px-3 text-sm fw-sub text-muted-foreground text-destructive w-[37.5%] break-all"
                      >
                        <div
                          class="flex align-center gap-2"
                          style="--btn-space: 0"
                        >
                          {{ $t('packages_dag_inspect_target_value') }}
                          <div class="flex-1" />
                          <div class="diff-table-operations">
                            <el-tooltip
                              :content="$t('public_generate_recovery_sql')"
                              :enterable="false"
                              :hide-after="0"
                              :disabled="showExportRecoverSqlProgress"
                              :teleported="false"
                            >
                              <div>
                                <el-button
                                  text
                                  size="small"
                                  :disabled="showExportRecoverSqlProgress"
                                  @click="handleExportRecoverSql(row.id)"
                                >
                                  <template #icon>
                                    <SettingInterOutlined />
                                  </template>
                                </el-button>
                              </div>
                            </el-tooltip>
                            <el-tooltip
                              :content="$t('public_diff_check')"
                              :enterable="false"
                              :hide-after="0"
                              :disabled="showCheckProgress"
                              :teleported="false"
                            >
                              <div>
                                <el-button
                                  text
                                  size="small"
                                  :disabled="showCheckProgress"
                                  @click="handleManualCheck(row.id)"
                                >
                                  <template #icon>
                                    <i-lucide-git-compare-arrows />
                                  </template>
                                </el-button>
                              </div>
                            </el-tooltip>
                            <el-tooltip
                              :content="$t('public_one_key_repair')"
                              :enterable="false"
                              :hide-after="0"
                              :disabled="showRecoverProgress"
                              :teleported="false"
                            >
                              <div>
                                <el-button
                                  text
                                  size="small"
                                  :disabled="showRecoverProgress"
                                  @click="handleManualRecover(row.id)"
                                >
                                  <template #icon>
                                    <i-lucide-wand-sparkles />
                                  </template>
                                </el-button>
                              </div>
                            </el-tooltip>
                            <el-tooltip
                              :content="$t('packages_dag_inspect_copy_row')"
                              :enterable="false"
                              :hide-after="0"
                              :teleported="false"
                            >
                              <el-button
                                text
                                size="small"
                                @click="handleCopy(row)"
                              >
                                <template #icon>
                                  <i-lucide-copy />
                                </template>
                              </el-button>
                            </el-tooltip>
                            <el-divider class="mx-0" direction="vertical" />
                            <el-button
                              text
                              type="primary"
                              @click="handleRecordClick(row)"
                              >{{ $t('packages_dag_inspect_operation_record') }}
                            </el-button>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody v-if="onlyShowDiffFields">
                    <tr
                      v-for="field in row.diffFields"
                      :key="field"
                      class="border-bottom hover:bg-light"
                    >
                      <td class="p-3 text-sm text-muted-foreground">
                        <div
                          v-if="row.diffFieldsMap[field] !== field"
                          class="flex align-center gap-1"
                        >
                          <VIcon class="mt-2" size="16"
                            >ArrowsTurnForward</VIcon
                          >
                          <div class="break-all">
                            <div class="font-color-sslight">
                              {{ field }}
                            </div>
                            <div class="font-color-dark">
                              {{ row.diffFieldsMap[field] }}
                            </div>
                          </div>
                        </div>

                        <div v-else>
                          {{ row.diffFieldsMap[field] }}
                        </div>
                      </td>
                      <td class="p-3 text-sm font-medium">
                        <span>{{ row.source[field] }}</span>
                      </td>
                      <td class="p-3 text-sm font-medium color-danger">
                        <span>{{ row.target[row.diffFieldsMap[field]] }}</span>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr
                      v-for="(targetField, i) in row.targetFields"
                      :key="targetField"
                      class="border-bottom hover:bg-light"
                    >
                      <td class="p-3 text-sm text-muted-foreground">
                        <div
                          v-if="row.sourceFields[i] !== targetField"
                          class="flex align-center gap-1"
                        >
                          <VIcon class="mt-2" size="16"
                            >ArrowsTurnForward</VIcon
                          >
                          <div class="break-all">
                            <div class="font-color-sslight">
                              {{ row.sourceFields[i] }}
                            </div>
                            <div class="font-color-dark">
                              {{ targetField }}
                            </div>
                          </div>
                        </div>
                        <span v-else>{{ targetField }}</span>
                      </td>
                      <td class="p-3 text-sm font-medium">
                        <span class="break-all">{{
                          row.source[row.sourceFields[i]]
                        }}</span>
                      </td>
                      <td
                        class="p-3 text-sm font-medium"
                        :class="{
                          'color-danger':
                            row.diffFieldsMap[row.sourceFields[i]],
                        }"
                      >
                        <span class="break-all">{{
                          row.target[targetField]
                        }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table v-else class="w-100 row-diff-table font-color-dark">
                  <thead class="bg-light border-bottom">
                    <tr>
                      <th
                        class="text-start p-3 text-sm fw-sub text-muted-foreground break-all"
                      >
                        <div class="flex align-center gap-2">
                          {{
                            $t(
                              'packages_business_verification_result_field_name',
                            )
                          }}
                          <ElTag
                            v-if="row.diffType === 'MISS'"
                            class="rounded-4 tag-amber"
                            size="small"
                          >
                            {{ $t('packages_dag_inspect_diff_type_miss') }}
                          </ElTag>

                          <ElTag
                            v-if="row.diffType === 'MORE'"
                            class="rounded-4"
                            size="small"
                            type="warning"
                          >
                            {{ $t('packages_dag_inspect_diff_type_more') }}
                          </ElTag>
                        </div>
                      </th>
                      <th
                        class="text-start px-3 text-sm fw-sub text-muted-foreground break-all font-medium"
                      >
                        <div class="flex align-center gap-2">
                          {{ $t('public_field_value') }}
                          <el-button
                            class="ml-auto"
                            text
                            type="primary"
                            @click="handleRecordClick(row)"
                            >{{ $t('packages_dag_inspect_operation_record') }}
                          </el-button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(value, key) in row.source || row.target"
                      :key="key"
                      class="border-bottom hover:bg-light"
                    >
                      <td class="p-3 text-sm text-muted-foreground break-all">
                        {{ key }}
                      </td>
                      <td class="p-3 text-sm font-medium break-all">
                        {{ value }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <el-empty
              v-if="!loadingList && !loadingDetails && !rowDiffList.length"
            />
          </div>
          <el-pagination
            v-model:current-page="pageState.page"
            v-model:page-size="pageState.pageSize"
            class="py-3 px-6 border-top"
            hide-on-single-page
            :page-sizes="[10, 20, 50, 100]"
            layout="->,total, sizes, prev, pager, next, jumper"
            :total="pageState.total"
            @change="fetchTableDiff"
          />
        </div>
      </div>

      <el-empty
        v-show="
          !loadingList &&
          !loadingDetails &&
          !inspectList.length &&
          !tablePageState.keyword
        "
      />
    </div>

    <InspectRecordDialog v-model="recordDialogVisible" :result-id="resultId" />
  </ElDialog>
</template>

<style lang="scss">
.inspect-detail-dialog {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .table-pagination {
    --el-pagination-item-gap: 8px;
    :deep(.el-pagination__goto),
    :deep(.el-pagination__classifier) {
      display: none;
    }
  }
}
</style>

<style lang="scss" scoped>
.inspect-detail-container {
  display: flex;
  flex-direction: column;
  min-height: 0;

  :global(.tag-amber) {
    background-color: #fceccd;
    color: oklch(0.769 0.188 70.08);
    border-color: oklch(0.83 0.19 84.43 / 0.4);
  }

  .row-diff-table {
    thead > tr > th {
      width: 37.5%;

      &:first-child {
        width: 25%;
      }
    }

    tbody > tr {
      &:last-child {
        border-bottom: none !important;
      }
    }

    .diff-table-operations {
      display: none;
    }

    &:hover {
      .diff-table-operations {
        display: contents;
      }
    }
  }

  .last-verify-time {
    text-align: right;
    color: #909399;
  }

  .text-muted {
    color: #909399;
  }

  .text-danger {
    color: #f56c6c;
  }

  .font-size-small {
    font-size: 12px;
  }

  .inspect-detail-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 15px;
    }
  }

  .inspection-result-list {
    width: 320px;
  }

  .inspection-result-count {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .inspection-result-actions {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
  }

  .inspection-result-card {
    cursor: pointer;
    transition: background-color 0.2s;

    border: 1px solid transparent;

    &:hover {
      background-color: var(--fill-hover);
    }

    &.active {
      background-color: rgb(240, 244, 255) !important;
    }
  }

  .inspection-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    i {
      margin-right: 8px;
      color: #909399;
    }

    .card-title {
      flex: 1;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .diff-tag {
      margin-left: 8px;
    }
  }

  .inspection-card-content {
    padding-left: 24px;
  }

  .inspection-card-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .inspection-card-metric {
    display: flex;
    flex-direction: column;

    .metric-label {
      font-size: 12px;
      color: #909399;
    }

    .metric-value {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.btn-group {
  --btn-space: 0;
  .el-button:first-child:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding-right: 6px;
  }
  .el-button:last-child:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    padding-inline: 6px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      height: 1em;
      left: -1px;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      background-color: var(--el-border-color);
    }
  }

  &:hover {
    .el-button:last-child::before {
      background-color: transparent;
    }
  }
}
</style>
