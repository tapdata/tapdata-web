<script setup lang="ts">
import {
  getTaskInspectHistoriesResults,
  getTaskInspectResultsGroupByTable,
  getTaskInspectResultsLastOp,
  manualCheck,
  manualRecover,
  useRequest,
  type DiffRow,
  type InspectionRow,
} from '@tap/api'
import { CloseIcon } from '@tap/component/src/CloseIcon'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { ref } from 'vue'
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

const activeTab = ref('details')
const inspectList = ref<InspectionRow[]>([])
const rowDiffList = ref<DiffRow[]>([])
const loadingList = ref(false)
const loadingDetails = ref(false)
const currentSelectedRow = ref<InspectionRow | null | undefined>()
const onlyShowDiffFields = ref(true)
const showCheckProgress = ref(false)
const showRecoverProgress = ref(false)
const progress = ref(0)

function onClose(): void {
  resetData()
  stopPolling()
}

function resetData(): void {
  activeTab.value = 'details'
  currentSelectedRow.value = null
}

async function fetchDiffList(): Promise<void> {
  loadingList.value = true
  try {
    const data = await getTaskInspectResultsGroupByTable(props.inspectId)
    inspectList.value = data?.items || []

    if (inspectList.value.length > 0) {
      if (currentSelectedRow.value) {
        const item = inspectList.value.find(
          (item) => item.sourceTable === currentSelectedRow.value?.sourceTable,
        )
        currentSelectedRow.value = item || inspectList.value[0]
      } else {
        currentSelectedRow.value = inspectList.value[0]
      }

      fetchTableDiff(currentSelectedRow.value!.sourceTable)
    }
  } catch (error) {
    console.error('Failed to fetch inspect list:', error)
  } finally {
    loadingList.value = false
  }
}

async function fetchTableDiff(sourceTable: string): Promise<void> {
  if (!props.inspectId) return

  loadingDetails.value = true

  try {
    const data = await getTaskInspectHistoriesResults(
      props.inspectId,
      sourceTable,
    )

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

const loadLastOp = async () => {
  const data = await getTaskInspectResultsLastOp(props.taskId)

  if (!data) {
    showCheckProgress.value = false
    showRecoverProgress.value = false
    progress.value = 0
    return
  }

  if (data.manualType === 'manualCheck') {
    showCheckProgress.value = data.unfinished > 0
    showRecoverProgress.value = false
  } else if (data.manualType === 'manualRecover') {
    showRecoverProgress.value = data.unfinished > 0
    showCheckProgress.value = false
  }

  progress.value =
    data.totals > 0
      ? Math.round((data.totals - data.unfinished) / data.totals)
      : 0
}

const { run: handleManualCheck, loading: manualCheckLoading } = useRequest(
  async () => {
    showCheckProgress.value = false
    await manualCheck(props.taskId)
    startPolling()
    ElMessage.success(t('public_start_check'))
  },
  {
    manual: true,
    loadingKeep: 500,
  },
)

const { run: handleManualRecover, loading: manualRecoverLoading } = useRequest(
  async () => {
    showRecoverProgress.value = false
    await manualRecover(props.taskId)
    startPolling()
    ElMessage.success(t('public_start_repair'))
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

    if (!showCheckProgress.value && !showRecoverProgress.value) {
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
  fetchTableDiff(row.sourceTable)
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
    t('public_start_check_confirm'),
  )

  if (result) {
    handleManualCheck()
  }
}

async function handleConfirmRecover(): Promise<void> {
  const result = await Modal.confirm(
    t('public_last_operation_not_finished'),
    t('public_start_repair_confirm'),
  )

  if (result) {
    handleManualRecover()
  }
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
        <VIcon class="text-muted ml-4 mr-1" :size="14">time</VIcon>
        <span class="text-muted fs-8"
          >{{ $t('packages_dag_inspect_last_verify_time') }}:
          {{ pingTime }}</span
        >
        <div class="flex-1" />

        <template v-if="inspectList.length">
          <el-button
            v-if="!showCheckProgress"
            text
            :loading="manualCheckLoading"
            :disabled="manualRecoverLoading || showRecoverProgress"
            @click="handleManualCheck"
          >
            <template #icon>
              <i-lucide:git-compare-arrows />
            </template>
            {{ $t('public_diff_check') }}
          </el-button>

          <el-button v-else text @click="handleConfirmCheck">
            <template #icon>
              <el-icon class="is-loading" size="16">
                <i-mingcute:loading-line />
              </el-icon>
            </template>
            {{ $t('public_checking') }} ({{ progress }}%)
          </el-button>

          <el-button
            v-if="!showRecoverProgress"
            text
            :loading="manualRecoverLoading"
            :disabled="manualCheckLoading || showCheckProgress"
            @click="handleManualRecover"
          >
            <template #icon>
              <i-lucide:wand-sparkles />
            </template>
            {{ $t('public_one_key_repair') }}
          </el-button>

          <el-button v-else text @click="handleConfirmRecover">
            <!-- <el-progress
            class="mr-1"
            type="circle"
            :percentage="80"
            width="16"
            :show-text="false"
            :stroke-width="2"
            color="var(--el-color-primary)"
          /> -->
            <template #icon>
              <el-icon class="is-loading" size="16">
                <i-mingcute:loading-line />
              </el-icon>
            </template>
            {{ $t('public_repairing') }} ({{ progress }}%)
          </el-button>
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
        :class="inspectList.length || loadingList ? 'flex' : 'none'"
        style="min-height: 400px"
      >
        <div class="inspection-result-list bg-light p-3 overflow-y-auto">
          <div class="flex flex-column gap-3">
            <div
              v-for="(row, index) in inspectList"
              :key="index"
              class="inspection-result-card p-3 bg-white rounded-xl shadow-sm"
              :class="{ 'border-primary': currentSelectedRow === row }"
              @click="handleRowClick(row)"
            >
              <div>
                <div class="flex align-items-center gap-2 fs-6 font-color-dark">
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
          </div>
        </div>

        <div
          v-loading="loadingDetails"
          class="bg-white border-left flex-1 flex flex-column"
        >
          <div class="flex gap-3 px-4 py-3 border-bottom">
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
          </div>
          <div class="overflow-y-auto p-4 min-height-0">
            <div class="flex flex-column gap-4">
              <div
                v-for="(row, index) in rowDiffList"
                :key="index"
                class="border rounded-xl overflow-hidden"
              >
                <div class="flex align-items-center gap-2 p-3 bg-light">
                  <span class="bg-fill-hover rounded-lg px-2 py-1">
                    {{ $t('packages_dag_inspect_row_id') }}: {{ row.id }}
                  </span>
                  <ElTag
                    v-if="row.diffType === 'DIFF'"
                    class="rounded-4"
                    size="small"
                    type="danger"
                  >
                    {{ $t('packages_dag_inspect_diff_type_diff') }}
                  </ElTag>

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

                  <div class="flex-1" />

                  <el-button text type="primary" @click="handleRecordClick(row)"
                    >{{ $t('packages_dag_inspect_operation_record') }}
                  </el-button>
                </div>

                <table
                  v-if="row.diffType === 'DIFF'"
                  class="w-100 row-diff-table font-color-dark"
                >
                  <thead class="bg-light border-bottom">
                    <tr>
                      <th
                        class="text-start p-3 text-sm fw-sub text-muted-foreground w-1/4"
                      >
                        {{
                          $t('packages_business_verification_result_field_name')
                        }}
                      </th>
                      <th class="text-start p-3 text-sm fw-sub w-[37.5%]">
                        {{ $t('packages_dag_inspect_source_value') }}
                      </th>
                      <th
                        class="text-start p-3 text-sm fw-sub text-destructive w-[37.5%]"
                      >
                        {{ $t('packages_dag_inspect_target_value') }}
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
                          <div>
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
                          <div>
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
                        <span>{{ row.source[row.sourceFields[i]] }}</span>
                      </td>
                      <td
                        class="p-3 text-sm font-medium"
                        :class="{
                          'color-danger':
                            row.diffFieldsMap[row.sourceFields[i]],
                        }"
                      >
                        <span>{{ row.target[targetField] }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-else class="font-color-dark border-top">
                  <div
                    v-for="(value, key) in row.source || row.target"
                    :key="key"
                    class="flex border-bottom last:border-0 hover:bg-light"
                  >
                    <div class="flex-1 p-3 text-sm text-muted-foreground">
                      {{ key }}
                    </div>
                    <div class="flex-1 p-3 text-sm font-medium">
                      <span>{{ value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty
        v-show="!loadingList && !loadingDetails && !inspectList.length"
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
}
</style>

<style lang="scss" scoped>
.inspect-detail-container {
  display: flex;
  flex-direction: column;
  min-height: 0;

  .tag-amber {
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
    &::v-deep .el-tabs__header {
      margin-bottom: 15px;
    }
  }

  .inspection-result-list {
    width: 320px;
  }

  .inspection-result-header {
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
      background-color: rgba(31, 35, 41, 0.08);
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
</style>
