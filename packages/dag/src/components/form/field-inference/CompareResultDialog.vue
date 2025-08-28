<script setup lang="ts">
import {
  deleteCompareApply,
  deleteInvalidCompareApply,
  getMetadataInstancesCompareResult,
  getTargetSchemaDetection,
  saveCompareApply,
  useRequest,
  type ItemDifferenceFieldList,
} from '@tap/api'
import { dayjs } from '@tap/business/src/shared/dayjs'

import { CloseIcon } from '@tap/component/src/CloseIcon'
import { getFieldIcon } from '@tap/form/src/components/field-select/FieldSelect'
import { useI18n } from '@tap/i18n'
import { template } from 'lodash-es'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useStore } from 'vuex'

const visible = defineModel<boolean>()
const emit = defineEmits(['loadSchema'])

const props = defineProps({
  nodeId: {
    type: String,
    default: '',
  },
})

type TableItem = {
  tableName: string
  qualifiedName: string
  fields: Partial<ItemDifferenceFieldList>[]
  differentNum: number
  additionalNum: number
  missingNum: number
  cannotWriteNum: number
}

const { t } = useI18n()
const store = useStore()
const taskId = store.state.dataflow.taskId
const compareStatus = ref<string | null>(null)
const finishTime = ref<string>()
const tableList = ref<TableItem[]>([])
const tableTotal = ref<number>(0)
const fieldList = ref<TableItem['fields']>([])
const selectedTable = ref<TableItem | null>(null)
const searchKeyword = ref('')
const tableSearchKeyword = ref('')
const hasManual = ref(false)
const invalidApplyNum = ref<number>(0)
const pageSize = ref<number>(10)
const currentPage = ref<number>(1)

const typeMap = {
  Different: {
    text: t('packages_dag_compare_different'),
    type: 'warning',
    doneText: 'packages_dag_compare_done_modify',
    btnText: t('public_button_revise'),
  },
  Additional: {
    text: t('packages_dag_compare_additional'),
    type: 'success',
    doneText: 'packages_dag_compare_done_add',
    btnText: t('public_add'),
  },
  Missing: {
    text: t('packages_dag_compare_missing'),
    type: 'danger',
    doneText: 'packages_dag_compare_done_delete',
    btnText: t('public_button_delete'),
  },
  CannotWrite: {
    text: t('packages_dag_compare_cannot_write'),
    type: 'danger',
    doneText: 'packages_dag_compare_done_delete',
    btnText: t('public_button_delete'),
  },
}

const isLoading = computed(() => {
  return compareResultLoading.value || compareStatus.value === 'running'
})

const totalPage = computed(() => {
  return Math.ceil(tableTotal.value / pageSize.value)
})

const {
  loading: compareResultLoading,
  run: fetchCompareResult,
  runAsync: fetchCompareResultAsync,
  refresh: refreshCompareResult,
  cancel: cancelFetchCompareResult,
} = useRequest(
  async () => {
    const res = await getMetadataInstancesCompareResult({
      nodeId: props.nodeId,
      taskId,
      page: currentPage.value,
      pageSize: pageSize.value,
      tableFilter: tableSearchKeyword.value,
    })

    if (!res) {
      invalidApplyNum.value = 0
      compareStatus.value = null
      cancelFetchCompareResult()
      return
    }

    compareStatus.value = res.status
    invalidApplyNum.value = res.invalidApplyDtos?.length || 0

    if (compareStatus.value !== 'running') {
      cancelFetchCompareResult()

      if (compareStatus.value === 'done') {
        finishTime.value = dayjs(res.finishTime).fromNow()
      }
    } else {
      return
    }

    tableTotal.value = res.compareDtos.total
    tableList.value = res.compareDtos.items.map((item): TableItem => {
      const totalMap = {
        Different: 0,
        Additional: 0,
        Missing: 0,
        CannotWrite: 0,
      }
      const fields: TableItem['fields'] = []

      item.differenceFieldList.forEach((field) => {
        totalMap[field.type as keyof typeof totalMap]++

        let fieldType
        let isPrimaryKey
        let icon

        if (field.sourceField) {
          fieldType = field.sourceField.data_type
          isPrimaryKey = field.sourceField.primary_key_position > 0
          icon = getFieldIcon(field.sourceField.tapType)
        } else {
          fieldType = field.targetField.data_type
          isPrimaryKey = field.targetField.primary_key_position > 0
          icon = getFieldIcon(field.targetField.tapType)
        }

        fields.push({
          applyType: field.applyType,
          fieldName: field.columnName,
          type: field.type,
          targetFieldType:
            field.type === 'Different'
              ? field.targetField.data_type
              : undefined,
          fieldType,
          icon,
          isPrimaryKey,
        })
      })

      return {
        tableName: item.tableName,
        qualifiedName: item.qualifiedName,
        fields,
        differentNum: totalMap.Different,
        additionalNum: totalMap.Additional,
        missingNum: totalMap.Missing,
        cannotWriteNum: totalMap.CannotWrite,
      }
    })

    if (tableList.value.length > 0) {
      if (!selectedTable.value) {
        selectedTable.value = tableList.value[0] as TableItem
      } else {
        selectedTable.value =
          tableList.value.find(
            (item) => item.tableName === selectedTable.value?.tableName,
          ) || selectedTable.value
      }
    } else {
      selectedTable.value = null
    }
  },
  {
    manual: true,
    pollingInterval: 3000,
    debounceInterval: 200,
  },
)

const onOpen = () => {
  hasManual.value = false
  // currentPage.value = 1
  fetchCompareResult()
}

const handleSelectTable = (item: TableItem) => {
  selectedTable.value = item
}

const saveApply = async (isAll: boolean, data?: any) => {
  hasManual.value = true
  await saveCompareApply(isAll, props.nodeId, data)
  fetchCompareResult()
  ElMessage.success(t('public_message_operation_success'))
}

const deleteApply = async (isAll: boolean, data?: any) => {
  hasManual.value = true
  await deleteCompareApply(isAll, props.nodeId, data)
  fetchCompareResult()
  ElMessage.success(t('public_message_operation_success'))
}

const handleApply = (item: Partial<ItemDifferenceFieldList>) => {
  saveApply(false, [
    {
      qualifiedName: selectedTable.value?.qualifiedName,
      fieldNames: [item.fieldName],
    },
  ])
}

const handleApplyTable = () => {
  saveApply(false, [
    {
      qualifiedName: selectedTable.value?.qualifiedName,
    },
  ])
}

const handleApplyAll = () => {
  saveApply(true)
}

const handleUndo = (item: Partial<ItemDifferenceFieldList>) => {
  deleteApply(false, [
    {
      qualifiedName: selectedTable.value?.qualifiedName,
      fieldNames: [item.fieldName],
    },
  ])
}

const handleUndoTable = () => {
  deleteApply(false, [
    {
      qualifiedName: selectedTable.value?.qualifiedName,
    },
  ])
}

const handleUndoAll = () => {
  deleteApply(true)
}

let unwatch: () => void

const handleCompareTargetModel = async () => {
  await getTargetSchemaDetection({
    nodeId: props.nodeId,
    taskId,
  })

  await fetchCompareResultAsync()

  unwatch = watch(
    compareStatus,
    (newVal) => {
      if (newVal === 'done') {
        unwatch()
        ElMessage.success(t('packages_dag_compare_result_done'))
      } else if (newVal === 'error' || newVal === 'timeOut') {
        unwatch()
        ElMessage.error(t('packages_dag_compare_result_error'))
      }
    },
    {
      immediate: true,
    },
  )
}

// 计算过滤后的字段列表
const filteredFields = computed(() => {
  if (!selectedTable.value || !searchKeyword.value.trim()) {
    return selectedTable.value?.fields || []
  }

  const keyword = searchKeyword.value.toLowerCase().trim()
  return selectedTable.value.fields.filter(
    (field) =>
      field.fieldName?.toLowerCase().includes(keyword) ||
      field.fieldType?.toLowerCase().includes(keyword) ||
      field.targetFieldType?.toLowerCase().includes(keyword),
  )
})

const onClose = () => {
  if (hasManual.value) {
    emit('loadSchema')
  }
}

const handleClearInvalidApply = async () => {
  await deleteInvalidCompareApply(props.nodeId)
  fetchCompareResult()
  ElMessage.success(t('public_message_operation_success'))
}

onBeforeUnmount(() => {
  unwatch?.()
})
</script>

<template>
  <el-dialog
    v-model="visible"
    width="60%"
    class="p-0 overflow-hidden compare-result-dialog"
    :show-close="false"
    @open="onOpen"
    @close="onClose"
  >
    <template #header="{ titleClass }">
      <div class="pt-5 px-6">
        <div class="flex align-center">
          <div
            class="flex align-center justify-center p-1.5 bg-gray-100 rounded-lg mr-4"
          >
            <el-icon size="24" color="var(--icon-n1)"
              ><i-lucide:git-compare-arrows
            /></el-icon>
          </div>
          <div>
            <div :class="titleClass">
              {{ t('packages_dag_compare_result') }}
            </div>
            <div class="text-caption fs-8 lh-sm">
              {{ t('packages_dag_compare_result_desc') }}
              <template v-if="finishTime">
                <el-divider direction="vertical" class="mx-1" />
                {{ finishTime }}
              </template>
            </div>
          </div>
          <div class="flex-1" />
          <template v-if="compareStatus && tableTotal > 0">
            <el-button :loading="isLoading" @click="handleCompareTargetModel">
              <template #icon>
                <el-icon><i-lucide:refresh-cw /></el-icon>
              </template>
              {{
                compareStatus === 'running'
                  ? t('packages_dag_compare_result_running')
                  : t('packages_dag_compare_result_recompare')
              }}
            </el-button>
            <el-button
              :disabled="isLoading"
              type="primary"
              @click="handleApplyAll"
            >
              <template #icon>
                <el-icon><i-lucide:check-check /></el-icon>
              </template>
              {{ t('packages_dag_compare_result_apply_all') }}
            </el-button>
            <el-button :disabled="isLoading" @click="handleUndoAll">
              <template #icon>
                <el-icon><i-lucide:undo /></el-icon>
              </template>
              {{ t('packages_dag_compare_result_undo_all') }}
            </el-button>
            <el-button
              v-if="invalidApplyNum > 0"
              :disabled="isLoading"
              @click="handleClearInvalidApply"
            >
              <template #icon>
                <el-icon><i-lucide:trash-2 /></el-icon>
              </template>
              {{
                t('packages_dag_compare_result_clear_invalid_apply', {
                  num: invalidApplyNum,
                })
              }}
            </el-button>
            <el-divider class="mx-3" direction="vertical" />
          </template>
          <template v-else-if="invalidApplyNum > 0">
            <el-button :disabled="isLoading" @click="handleClearInvalidApply">
              <template #icon>
                <el-icon><i-lucide:trash-2 /></el-icon>
              </template>
              {{
                t('packages_dag_compare_result_clear_invalid_apply', {
                  num: invalidApplyNum,
                })
              }}
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
      </div>
    </template>

    <div class="border-top">
      <div class="flex" style="max-height: 60vh; min-height: 200px">
        <el-empty
          v-if="!compareStatus || (!tableTotal && compareStatus !== 'done')"
          :image-size="48"
          class="mx-auto"
        >
          <template #description>
            <el-button
              type="primary"
              :loading="isLoading"
              @click="handleCompareTargetModel"
            >
              <template #icon>
                <el-icon><i-lucide:git-compare-arrows /></el-icon>
              </template>
              {{
                compareStatus === 'running'
                  ? t('packages_dag_compare_result_running')
                  : t('packages_dag_compare_result_compare_target')
              }}
            </el-button>
          </template>
        </el-empty>

        <el-result
          v-else-if="compareStatus === 'done' && !tableTotal"
          class="mx-auto"
          icon="success"
          :title="t('packages_dag_compare_result_no_diff')"
        >
          <template #extra>
            <el-button type="primary" @click="handleCompareTargetModel">
              <template #icon>
                <el-icon><i-lucide:refresh-cw /></el-icon>
              </template>
              {{ t('packages_dag_compare_result_recompare') }}
            </el-button>
          </template>
        </el-result>

        <template v-else>
          <div
            style="width: 320px"
            class="bg-white overflow-y-auto flex flex-column"
          >
            <div class="flex align-center p-3 border-bottom">
              <span class="font-color-dark fw-sub mr-1">{{
                $t('public_data_table')
              }}</span>
              <span class="font-color-sslight fs-8">({{ tableTotal }})</span>
              <template v-if="tableTotal > 8">
                <el-divider class="mx-3" direction="vertical" />
                <el-input
                  v-model="tableSearchKeyword"
                  :placeholder="
                    t('packages_form_table_rename_index_sousuobiaoming')
                  "
                  class="flex-1"
                  clearable
                  @input="fetchCompareResult()"
                >
                  <template #prefix>
                    <el-icon><i-lucide:search /></el-icon>
                  </template>
                </el-input>
              </template>
            </div>
            <div class="flex flex-column gap-1 p-2 overflow-y-auto">
              <div
                v-for="item in tableList"
                :key="item.tableName"
                class="flex align-center gap-2 rounded-xl px-2 py-1 list-item-hover cursor-pointer table-item"
                :class="{
                  'is-active': selectedTable?.tableName === item.tableName,
                }"
                @click="handleSelectTable(item)"
              >
                <div
                  class="p-1.5 bg-gray-100 rounded-lg flex align-center justify-center table-item-icon"
                >
                  <el-icon size="16" color="var(--icon-n1)"
                    ><i-lucide:table
                  /></el-icon>
                </div>

                <div class="lh-base min-w-0">
                  <div class="flex align-center">
                    <span class="ellipsis">{{ item.tableName }}</span>
                    <span class="ml-1 font-color-sslight fs-8"
                      >({{ item.fields.length }})</span
                    >
                  </div>
                  <div class="flex gap-1 flex-wrap mt-1">
                    <el-tag
                      v-if="item.missingNum > 0"
                      type="danger"
                      size="small"
                      class="px-1"
                    >
                      {{ t('packages_dag_compare_missing')
                      }}{{ item.missingNum }}
                    </el-tag>
                    <el-tag
                      v-if="item.additionalNum > 0"
                      type="success"
                      size="small"
                      class="px-1"
                    >
                      {{ t('packages_dag_compare_additional')
                      }}{{ item.additionalNum }}
                    </el-tag>
                    <el-tag
                      v-if="item.differentNum > 0"
                      type="warning"
                      size="small"
                      class="px-1"
                    >
                      {{ t('packages_dag_compare_different')
                      }}{{ item.differentNum }}
                    </el-tag>
                    <el-tag
                      v-if="item.cannotWriteNum > 0"
                      type="danger"
                      size="small"
                      class="px-1"
                    >
                      {{ t('packages_dag_compare_cannot_write')
                      }}{{ item.cannotWriteNum }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
            <el-pagination
              v-model:current-page="currentPage"
              hide-on-single-page
              class="table-pagination justify-center border-top py-2"
              layout="prev, jumper, slot, next"
              :total="tableTotal"
              :page-size="pageSize"
              @change="fetchCompareResult()"
            >
              <span class="mx-3">/</span>
              <span class="mr-2">{{ totalPage }}</span>
            </el-pagination>
          </div>
          <div class="flex-1 bg-light border-start min-w-0 flex flex-column">
            <div v-if="selectedTable" class="flex align-center p-3">
              <div class="flex align-center min-w-0">
                <div
                  class="mr-2 p-1.5 bg-gray-100 rounded-lg flex align-center justify-center table-item-icon"
                >
                  <el-icon size="16" color="var(--icon-n1)"
                    ><i-lucide:table
                  /></el-icon>
                </div>
                <span class="fw-sub ellipsis">{{
                  selectedTable.tableName
                }}</span>
                <span class="ml-1 font-color-sslight fs-8"
                  >({{ selectedTable.fields.length }})</span
                >
              </div>
              <el-divider direction="vertical" class="mx-3" />
              <el-input
                v-model="searchKeyword"
                :placeholder="t('packages_dag_compare_result_search_field')"
                clearable
                class="flex-shrink-0 mr-3"
                style="width: 200px"
              >
                <template #prefix>
                  <el-icon><i-lucide:search /></el-icon>
                </template>
              </el-input>
              <div class="flex-1" />
              <el-tooltip
                :content="t('packages_dag_compare_result_apply_table')"
                placement="top"
              >
                <el-button
                  :disabled="isLoading"
                  circle
                  class="rounded-lg"
                  @click="handleApplyTable"
                >
                  <template #icon>
                    <el-icon><i-lucide:check-check /></el-icon>
                  </template>
                  <!-- {{ t('packages_dag_compare_result_apply_table') }} -->
                </el-button>
              </el-tooltip>

              <el-tooltip
                :content="t('packages_dag_compare_result_undo_table')"
                placement="top"
              >
                <el-button
                  :disabled="isLoading"
                  circle
                  class="rounded-lg"
                  @click="handleUndoTable"
                >
                  <template #icon>
                    <el-icon><i-lucide:undo /></el-icon>
                  </template>
                  <!-- {{ t('packages_dag_compare_result_undo_table') }} -->
                </el-button>
              </el-tooltip>
            </div>
            <div
              v-if="selectedTable"
              class="flex flex-column gap-3 p-3 pt-0 overflow-y-auto"
            >
              <div
                v-if="searchKeyword.trim() && filteredFields.length === 0"
                class="text-center py-8 text-placeholder"
              >
                <el-icon size="48" class="mb-2"><i-lucide:search-x /></el-icon>
                <div>{{ t('packages_dag_compare_result_no_match_field') }}</div>
              </div>

              <div
                v-for="field in filteredFields"
                :key="field.fieldName"
                class="flex align-center gap-2 bg-white rounded-xl px-2 py-1 border border-gray-200 field-item"
                :class="{
                  'field-item-danger': field.type === 'CannotWrite',
                }"
              >
                <VIcon style="color: var(--icon-n2)">{{ field.icon }}</VIcon>
                <div>{{ field.fieldName }}</div>
                <div
                  v-if="field.type !== 'Different'"
                  class="fs-8 font-mono border rounded-lg px-1.5 lh-5"
                >
                  {{ field.fieldType }}
                </div>
                <template v-else>
                  <div
                    class="fs-8 font-mono border rounded-lg px-1.5 lh-5 text-decoration-line-through text-caption"
                  >
                    {{ field.fieldType }}
                  </div>
                  <el-icon size="12"><i-mingcute:arrow-right-line /></el-icon>
                  <div class="fs-8 font-mono border rounded-lg px-1.5 lh-5">
                    {{ field.targetFieldType }}
                  </div>
                </template>
                <el-tag
                  :type="
                    typeMap[field.type as keyof typeof typeMap].type as any
                  "
                  size="small"
                  class="px-1"
                  >{{
                    typeMap[field.type as keyof typeof typeMap].text
                  }}</el-tag
                >
                <div class="flex-1" />
                <template v-if="!field.applyType">
                  <el-button
                    :type="
                      field.type === 'Missing' || field.type === 'CannotWrite'
                        ? 'danger'
                        : 'primary'
                    "
                    text
                    class="field-item-btn"
                    :disabled="isLoading"
                    @click="handleApply(field)"
                    >{{
                      typeMap[field.type as keyof typeof typeMap].btnText
                    }}</el-button
                  >
                </template>
                <div
                  v-else-if="field.applyType === 'auto'"
                  class="flex align-center gap-1 color-success fs-8"
                >
                  <el-icon><i-mingcute:check-line /></el-icon>
                  {{
                    t(typeMap[field.type].doneText, {
                      type: t('public_automatically'),
                    })
                  }}
                </div>
                <template v-else-if="field.applyType === 'manual'">
                  <div class="flex align-center gap-1 color-success fs-8">
                    <el-icon><i-mingcute:check-line /></el-icon>
                    {{
                      t(typeMap[field.type].doneText, {
                        type: t('public_manually'),
                      })
                    }}
                  </div>
                  <el-button
                    class="field-item-btn"
                    type="primary"
                    text
                    :disabled="isLoading"
                    @click="handleUndo(field)"
                  >
                    {{ $t('public_button_revoke') }}
                  </el-button>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.table-item {
  &.is-active {
    .table-item-icon {
      background-color: var(--el-color-primary-light-8);
      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

.field-item {
  &:hover {
    background-color: var(--el-fill-color-light) !important;
    .field-item-btn {
      display: inline-flex;
    }
  }

  .field-item-btn {
    display: none;
  }
}

.field-item-danger {
  background-color: var(--el-color-danger-light-9) !important;
  border-color: var(--el-color-danger-light-8) !important;
}

.compare-result-dialog {
  max-height: 80vh;
}

.table-pagination {
  --el-pagination-item-gap: 8px;
  :deep(.el-pagination__goto),
  :deep(.el-pagination__classifier) {
    display: none;
  }
}
</style>
