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

import { FilterOutlined } from '@tap/component/src/icon'
import { getFieldIcon } from '@tap/form/src/components/field-select/FieldSelect'
import { useI18n } from '@tap/i18n'
import { computed, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { useStore } from 'vuex'

const visible = defineModel<boolean>()
const emit = defineEmits(['loadSchema', 'changeRules', 'close'])

const props = defineProps({
  nodeId: {
    type: String,
    default: '',
  },
  singleTable: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array as PropType<string[]>,
    default: () => [],
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
const selectedTable = ref<TableItem | null>(null)
const searchKeyword = ref('')
const tableSearchKeyword = ref('')
const hasManual = ref(false)
const invalidApplyNum = ref<number>(0)
const pageSize = ref<number>(10)
const currentPage = ref<number>(1)
const applyCompareRules = ref<string[]>(props.rules)
const filterType = ref(['Different', 'Missing', 'CannotWrite'])

const typeMap = {
  Different: {
    text: t('packages_dag_compare_different'),
    type: 'warning',
    doneText: 'packages_dag_compare_done_modify',
    btnText: t('public_button_revise'),
    numKey: 'differentNum',
  },
  Missing: {
    text: t('packages_dag_compare_missing'),
    type: 'danger',
    doneText: 'packages_dag_compare_done_delete',
    btnText: t('public_button_delete'),
    numKey: 'missingNum',
  },
  CannotWrite: {
    text: t('packages_dag_compare_cannot_write'),
    type: 'danger',
    doneText: 'packages_dag_compare_done_delete',
    btnText: t('public_button_delete'),
    numKey: 'cannotWriteNum',
  },
}

const filterOptions = ref([
  {
    label: t('packages_dag_compare_different'),
    value: 'Different',
  },
  {
    label: t('packages_dag_compare_missing'),
    value: 'Missing',
  },
  {
    label: t('packages_dag_compare_cannot_write'),
    value: 'CannotWrite',
  },
  {
    label: t('packages_dag_compare_missing_source'),
    value: 'Additional',
  },
  {
    label: t('packages_dag_compare_precision'),
    value: 'Precision',
  },
])

const ruleOptions = filterOptions.value.filter((item) => {
  return item.value !== 'Additional'
})

const totalMap = ref<Record<string, number>>({})

const isLoading = computed(() => {
  return compareResultLoading.value || compareStatus.value === 'running'
})

const totalPage = computed(() => {
  return Math.ceil(tableTotal.value / pageSize.value)
})

const differentTotal = computed(() => {
  return filterOptions.value.reduce((acc, item) => {
    return acc + (totalMap.value?.[item.value] || 0)
  }, 0)
})

const {
  loading: compareResultLoading,
  run: fetchCompareResult,
  runAsync: fetchCompareResultAsync,
  refresh: refreshCompareResult,
  cancel: cancelFetchCompareResult,
} = useRequest(
  async (page?: number) => {
    if (page) {
      currentPage.value = page
    }

    const res = await getMetadataInstancesCompareResult({
      nodeId: props.nodeId,
      taskId,
      page: currentPage.value,
      pageSize: pageSize.value,
      tableFilter: tableSearchKeyword.value,
      types: filterType.value,
    })

    if (!res) {
      invalidApplyNum.value = 0
      compareStatus.value = null
      totalMap.value = {}
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

    totalMap.value = res.differentFieldNumberMap || {}
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
        if (!field.applyType) totalMap[field.type as keyof typeof totalMap]++

        let fieldType
        let isPrimaryKey
        let isNullable
        let icon

        if (field.sourceField) {
          fieldType = field.sourceField.data_type
          isPrimaryKey = field.sourceField.primary_key_position > 0
          isNullable = field.sourceField.is_nullable
          icon = getFieldIcon(field.sourceField.tapType)
        } else {
          fieldType = field.targetField.data_type
          isPrimaryKey = field.targetField.primary_key_position > 0
          isNullable = field.targetField.is_nullable
          icon = getFieldIcon(field.targetField.tapType)
        }

        fields.push({
          applyType: field.applyType,
          fieldName: field.columnName,
          type: field.type,
          targetFieldType: field.targetField?.data_type,
          sourceFieldType: field.sourceField?.data_type,
          sourceFieldTypeDisplay: compareFieldTypes(
            field.sourceField?.data_type,
            field.targetField?.data_type,
          ),
          fieldType,
          icon,
          isPrimaryKey,
          isNullable,
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

    return true
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
      fieldNames: filteredFields.value.map((field) => field.fieldName),
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
      fieldNames: filteredFields.value.map((field) => field.fieldName),
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
      field.sourceFieldType?.toLowerCase().includes(keyword) ||
      field.targetFieldType?.toLowerCase().includes(keyword),
  )
})

const taskSaving = computed(() => {
  return store.state.dataflow.taskSaving
})

// 比较字段类型并返回带有红色高亮的 HTML 字符串
const compareFieldTypes = (sourceType: string, targetType: string): string => {
  if (!sourceType || !targetType) {
    return sourceType || targetType || ''
  }

  // 如果类型完全相同，直接返回
  if (sourceType === targetType) {
    return sourceType
  }

  // 尝试解析类型和精度
  const sourceMatch = sourceType.match(/^(.+?)(?:\(([^)]+)\))?$/)
  const targetMatch = targetType.match(/^(.+?)(?:\(([^)]+)\))?$/)

  if (!sourceMatch || !targetMatch) {
    // 无法解析，整个源类型用红色包裹
    return `<span class="color-danger">${sourceType}</span>`
  }

  const [, sourceBaseType, sourcePrecision] = sourceMatch
  const [, targetBaseType, targetPrecision] = targetMatch

  // 如果基础类型不同，整个源类型用红色包裹
  if (sourceBaseType !== targetBaseType) {
    return `<span class="color-danger">${sourceType}</span>`
  }

  // 如果基础类型相同但精度不同，只高亮精度部分
  if (
    sourcePrecision &&
    targetPrecision &&
    sourcePrecision !== targetPrecision
  ) {
    const precisionIndex = sourceType.indexOf(`(${sourcePrecision})`)
    if (precisionIndex !== -1) {
      const beforePrecision = sourceType.slice(0, precisionIndex)
      const afterPrecision = sourceType.slice(
        precisionIndex + sourcePrecision.length + 2,
      )
      return `${beforePrecision}(<span class="color-danger">${sourcePrecision}</span>)${afterPrecision}`
    }
  }

  // 其他情况，整个源类型用红色包裹
  return `<span class="color-danger">${sourceType}</span>`
}

const onClose = () => {
  if (hasManual.value) {
    emit('loadSchema')
  }
  cancelFetchCompareResult?.()
  emit('close')
}

const handleClearInvalidApply = async () => {
  await deleteInvalidCompareApply(props.nodeId)
  fetchCompareResult()
  ElMessage.success(t('public_message_operation_success'))
}

const applyAfterLoading = ref(false)

const handleApplyCompareRulesChange = async (value: string[]) => {
  applyAfterLoading.value = true
  emit('changeRules', value)

  await afterTaskSaved()

  fetchCompareResult()

  applyAfterLoading.value = false
}

const afterTaskSaved = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (taskSaving.value) {
        const unwatch = watch(taskSaving, () => {
          unwatch()
          resolve(true)
        })
      } else {
        resolve(true)
      }
    }, 300)
  })
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
          <div class="mr-2">
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
          <!-- <template v-if="compareStatus && tableTotal > 0"> -->
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
          <!-- <el-button
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
            </el-button> -->
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
          <el-select
            v-model="filterType"
            class="w-auto ml-3"
            multiple
            placeholder=""
            @change="fetchCompareResult(1)"
          >
            <el-option
              v-for="item in filterOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }} ({{ totalMap[item.value] || 0 }})
            </el-option>

            <template #tag="{ data, deleteTag }">
              <el-icon color="var(--icon-n1)" class="mx-1">
                <FilterOutlined />
              </el-icon>
              <span v-if="!data.length" class="text-caption">{{
                t('packages_dag_compare_result_detail_all')
              }}</span>
              <el-tag
                v-for="item in data"
                :key="item.value"
                :type="typeMap[item.value]?.type || 'info'"
                closable
                @close="deleteTag($event, item)"
              >
                {{ item.currentLabel }}
              </el-tag>
            </template>
          </el-select>
          <el-divider class="mx-3" direction="vertical" />
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
      <div class="p-3 px-6 flex align-center flex-wrap">
        <div
          class="p-1.5 bg-gray-100 rounded-lg flex align-center justify-center mr-2"
        >
          <el-icon size="16" color="var(--icon-n1)"
            ><i-lucide:settings
          /></el-icon>
        </div>
        <div class="fw-sub">
          {{ t('packages_dag_compare_result_auto_process') }}
        </div>
        <el-checkbox-group
          v-model="applyCompareRules"
          class="ml-4"
          @change="handleApplyCompareRulesChange"
        >
          <el-checkbox
            v-for="item in ruleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <el-tag
              disable-transitions
              :type="typeMap[item.value]?.type || 'info'"
              class="px-1.5"
            >
              <span class="flex align-center">
                {{ item.label }}
                <el-icon><i-lucide:chevrons-right /></el-icon>
                {{
                  item.value === 'Different' || item.value === 'Precision'
                    ? $t('public_button_update')
                    : $t('public_button_delete')
                }}
              </span>
            </el-tag>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div v-loading="applyAfterLoading" class="border-top">
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
          v-else-if="compareStatus === 'done' && !differentTotal"
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
            v-if="!singleTable"
            style="width: 320px"
            class="bg-white overflow-y-auto flex flex-column"
          >
            <div class="flex align-center p-3 border-bottom">
              <span class="font-color-dark fw-sub mr-1">{{
                $t('public_data_table')
              }}</span>
              <span class="font-color-sslight fs-8">({{ tableTotal }})</span>
              <el-divider class="mx-3" direction="vertical" />
              <el-input
                v-model="tableSearchKeyword"
                :placeholder="
                  t('packages_form_table_rename_index_sousuobiaoming')
                "
                class="flex-1"
                clearable
                @input="fetchCompareResult(1)"
              >
                <template #prefix>
                  <el-icon><i-lucide:search /></el-icon>
                </template>
              </el-input>
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
                  <div class="flex gap-1 flex-wrap mt-1 table-item-tags">
                    <template v-for="(v, key) in typeMap" :key="key">
                      <el-tag
                        v-if="item[v.numKey] > 0"
                        :type="v.type"
                        size="small"
                        class="px-1"
                      >
                        {{ v.text
                        }}<span class="ml-0.5">{{ item[v.numKey] }}</span>
                      </el-tag>
                    </template>
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
                <template v-if="singleTable">
                  <el-divider direction="vertical" class="mx-3" />
                  <div class="flex gap-2 flex-wrap">
                    <template v-for="(v, key) in typeMap" :key="key">
                      <el-tag
                        v-if="selectedTable[v.numKey] > 0"
                        :type="v.type"
                        size="small"
                        class="px-1"
                      >
                        {{ t(v.text)
                        }}<span class="ml-0.5">{{
                          selectedTable[v.numKey]
                        }}</span>
                      </el-tag>
                    </template>
                  </div>
                </template>
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
            </div>
            <div v-if="selectedTable" class="p-3 pt-0 min-h-0">
              <div
                class="bg-white rounded-xl p-2 shadow-sm field-list h-100 overflow-y-auto"
              >
                <div
                  class="flex rounded-lg mb-2 field-list-header lh-5 fw-sub text-caption position-sticky top-0 z-10"
                >
                  <div class="px-2 py-1 flex-1 flex align-center">
                    {{ t('packages_dag_compare_result_display_field') }}
                    <div class="flex-1" />
                    <el-tooltip
                      :content="t('packages_dag_compare_result_apply_table')"
                      placement="top"
                    >
                      <el-button
                        type="primary"
                        :disabled="isLoading || !filteredFields.length"
                        text
                        @click="handleApplyTable"
                      >
                        <template #icon>
                          <el-icon><i-lucide:check-check /></el-icon>
                        </template>
                      </el-button>
                    </el-tooltip>

                    <el-tooltip
                      :content="t('packages_dag_compare_result_undo_table')"
                      placement="top"
                    >
                      <el-button
                        type="primary"
                        text
                        :disabled="isLoading || !filteredFields.length"
                        @click="handleUndoTable"
                      >
                        <template #icon>
                          <el-icon><i-lucide:undo /></el-icon>
                        </template>
                      </el-button>
                    </el-tooltip>
                  </div>
                  <div class="p-2 flex-1">
                    {{ t('packages_dag_compare_result_database_field') }}
                  </div>
                </div>
                <div
                  v-for="field in filteredFields"
                  :key="field.fieldName"
                  class="flex align-center bg-white rounded-lg lh-5 field-item"
                  :class="{
                    'field-item-danger': field.type === 'CannotWrite',
                  }"
                >
                  <div class="p-2 flex align-center flex-1 min-w-0">
                    <el-tag
                      v-if="!field.sourceFieldType"
                      type="info"
                      size="small"
                      class="px-1"
                      >{{ $t('packages_dag_compare_missing_source') }}</el-tag
                    >
                    <div v-else class="flex flex-column gap-1">
                      <span
                        :class="{
                          'text-decoration-line-through text-caption':
                            field.applyType &&
                            (field.type === 'Missing' ||
                              field.type === 'CannotWrite'),
                        }"
                        >{{ field.fieldName }}</span
                      >
                      <div class="flex align-center">
                        <el-tag disable-transitions size="small" class="is-code"
                          ><span
                            class="font-mono"
                            :class="{
                              'text-decoration-line-through text-caption':
                                field.applyType,
                            }"
                            v-html="field.sourceFieldTypeDisplay"
                        /></el-tag>
                        <div
                          v-if="field.applyType === 'auto'"
                          class="flex align-center gap-1 color-success fs-8 ml-1"
                        >
                          <el-icon><i-mingcute:check-line /></el-icon>
                          {{
                            t(
                              typeMap[
                                field.type === 'Precision'
                                  ? 'Different'
                                  : field.type
                              ].doneText,
                              {
                                type: t('public_automatically'),
                              },
                            )
                          }}
                        </div>
                        <div
                          v-else-if="field.applyType === 'manual'"
                          class="flex align-center gap-1 color-success fs-8 ml-1"
                        >
                          <el-icon><i-mingcute:check-line /></el-icon>
                          {{
                            t(
                              typeMap[
                                field.type === 'Precision'
                                  ? 'Different'
                                  : field.type
                              ].doneText,
                              {
                                type: t('public_manually'),
                              },
                            )
                          }}
                        </div>
                      </div>
                    </div>
                    <template v-if="!field.applyType">
                      <el-button
                        v-if="
                          field.type === 'Different' ||
                          field.type === 'Precision'
                        "
                        class="field-item-btn ml-auto"
                        type="primary"
                        text
                        size="small"
                        :disabled="isLoading"
                        @click="handleApply(field)"
                      >
                        <template #icon>
                          <el-icon><i-lucide:chevrons-left /></el-icon>
                        </template>
                      </el-button>
                      <el-button
                        v-else-if="
                          field.type === 'CannotWrite' ||
                          field.type === 'Missing'
                        "
                        class="field-item-btn ml-auto"
                        type="primary"
                        text
                        size="small"
                        :disabled="isLoading"
                        @click="handleApply(field)"
                      >
                        <template #icon>
                          <el-icon><i-lucide:trash-2 /></el-icon>
                        </template>
                      </el-button>
                    </template>

                    <el-button
                      v-else-if="field.applyType === 'manual'"
                      class="field-item-btn ml-auto"
                      type="primary"
                      text
                      size="small"
                      :disabled="isLoading"
                      @click="handleUndo(field)"
                    >
                      <template #icon>
                        <el-icon><i-lucide:undo /></el-icon>
                      </template>
                    </el-button>
                  </div>
                  <div class="p-2 flex align-center flex-1 min-w-0">
                    <el-tag
                      v-if="!field.targetFieldType"
                      type="danger"
                      size="small"
                      class="px-1"
                      >{{ $t('packages_dag_compare_missing') }}</el-tag
                    >
                    <div v-else>
                      <div class="mb-1 flex align-center gap-1">
                        <span>{{ field.fieldName }}</span>
                        <el-tag
                          v-if="field.type === 'CannotWrite'"
                          type="danger"
                          size="small"
                          class="px-1"
                          >{{ $t('packages_dag_compare_cannot_write') }}</el-tag
                        >
                      </div>
                      <el-tag disable-transitions size="small" class="is-code"
                        ><span class="font-mono">{{
                          field.targetFieldType
                        }}</span></el-tag
                      >
                    </div>
                  </div>
                </div>
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

  .table-item-tags:empty {
    display: none !important;
  }
}

.field-item {
  // height: 36px;
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

.field-item-success {
  background-color: var(--el-color-success-light-9) !important;
  border-color: var(--el-color-success-light-8) !important;
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

.field-list-header {
  background-color: #f4f4f5;
  box-shadow:
    rgba(0, 0, 0, 0.02) 0px 0px 5px 0px,
    rgba(0, 0, 0, 0.06) 0px 2px 10px 0px,
    rgba(0, 0, 0, 0.3) 0px 0px 1px 0px;
}
</style>
