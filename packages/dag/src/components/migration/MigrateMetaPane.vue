<script setup lang="ts">
import { getNodeSchemaPage } from '@tap/api/src/core/metadata-instances'
import { VEmpty } from '@tap/component/src/base/v-empty'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { mapFieldsData } from '@tap/form/src/components/field-select'
import { useI18n } from '@tap/i18n'
import { cloneDeep, debounce } from 'lodash-es'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useDataflowStore } from '../../stores/dataflow.store'
import { getCanUseDataTypes, getMatchedDataTypeLevel } from '../../util'
import { SchemaFieldList as List } from '../form/field-inference'

defineOptions({ name: 'MigrateMetaPane' })

const props = defineProps<{
  form: any
  isShow: boolean
  readOnly?: boolean
}>()

const { t } = useI18n()
const dataflowStore = useDataflowStore()

// Vuex state/getters
const activeNodeId = computed(() => dataflowStore.selectedNode?.id)
const taskSaving = computed(() => dataflowStore.taskSaving)
const transformLoading = computed(() => dataflowStore.transformLoading)
const activeNode = computed(() => dataflowStore.selectedNode)
const stateIsReadonly = computed(() => dataflowStore.stateIsReadonly)

// Data
const navLoading = ref(false)
const position = ref(0)
const selected = ref<any>({})
const navList = ref<any[]>([])
const page = ref({
  size: 10,
  current: 1,
  total: 0,
  count: 1,
})
const searchTable = ref('')
const searchField = ref('')
const visible = ref(false)
const fieldChangeRules = ref<any[]>([])
const updateList = ref<any[]>([])
const updateConditionFieldMap = ref<Record<string, any>>({})
const activeClassification = ref('')
const tableClassification = ref([
  {
    type: '',
    title: t('packages_dag_field_inference_main_quanbubiao'),
    total: 0,
  },
  {
    type: 'updateEx',
    title: t('packages_dag_field_inference_main_gengxintiaojianyi'),
    total: 0,
  },
  {
    type: 'transformEx',
    title: t('packages_dag_field_inference_main_tuiyanyichang'),
    total: 0,
  },
])
const transformExNum = ref(0)
const updateExNum = ref(0)

const navListRef = useTemplateRef<HTMLElement>('navListRef')
const listRef = useTemplateRef<any>('listRef')

// Computed
const batchRuleCounts = computed(
  () => fieldChangeRules.value.filter((t: any) => t.scope === 'Node').length,
)

const readonly = computed(() => stateIsReadonly.value)

const isErrorSelect = computed(() => {
  const { hasPrimaryKey, hasUnionIndex, hasUpdateField } = selected.value || {}
  return !hasPrimaryKey && !hasUnionIndex && !hasUpdateField
})

const isTarget = computed(() => {
  const { type, $outputs } = activeNode.value || {}
  return (type === 'database' || type === 'table') && !$outputs?.length
})

// Methods from mixin
async function getData(op: Record<string, any> = {}) {
  const nodeId = activeNode.value?.id
  if (!nodeId) return { items: [], total: 0 }
  let data: any = { items: [], total: 0 }
  try {
    const params = Object.assign(
      {
        nodeId,
        fields: [
          'original_name',
          'fields',
          'qualified_name',
          'name',
          'indices',
          'constraints',
        ],
        page: 1,
        pageSize: 20,
      },
      op,
    )
    data = await getNodeSchemaPage(params)
  } catch {
    // catch
  }
  return data
}

async function loadData(resetSelect = false) {
  navLoading.value = true
  fieldChangeRules.value = props.form.getValuesIn('fieldChangeRules') || []
  listRef.value?.setRules(fieldChangeRules.value)
  updateConditionFieldMap.value = cloneDeep(
    props.form.getValuesIn('updateConditionFieldMap') || {},
  )
  const { size, current } = page.value
  const tableFilter = searchTable.value ? `.*${searchTable.value}.*` : ''
  const res = await getData({
    page: current,
    pageSize: size,
    tableFilter,
    filterType: activeClassification.value,
  })
  const { items, total } = res
  updateExNum.value = res.updateExNum
  transformExNum.value = res.transformExNum
  navList.value = items.map((t: any) => {
    const { fields = [], findPossibleDataTypes = {} } = t
    fields.forEach((el: any) => {
      const { dataTypes = [], lastMatchedDataType = '' } =
        findPossibleDataTypes[el.field_name] || {}
      el.canUseDataTypes =
        getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
      el.matchedDataTypeLevel = getMatchedDataTypeLevel(
        el,
        el.canUseDataTypes,
        fieldChangeRules.value,
        findPossibleDataTypes,
      )
    })
    t.matchedDataTypeLevel = fields.some(
      (f: any) => f.matchedDataTypeLevel === 'error',
    )
      ? 'error'
      : fields.some((f: any) => f.matchedDataTypeLevel === 'warning')
        ? 'warning'
        : ''
    return t
  })

  page.value.total = total
  tableClassification.value.forEach((el) => {
    if (!el.type) {
      el.total = res.wholeNum
    } else {
      el.total = res[`${el.type}Num`]
    }
  })
  page.value.count = total ? Math.ceil(total / page.value.size) : 1
  if (resetSelect) {
    handleSelect()
  } else {
    handleSelect(position.value)
  }
  navLoading.value = false
}

function refresh() {
  loadData()
}

function filterFields() {
  const item = navList.value[position.value]
  if (!item) return
  let fields = item?.fields
  const findPossibleDataTypes = item?.findPossibleDataTypes || {}
  if (searchField.value) {
    fields = item.fields.filter((t: any) =>
      t.field_name.toLowerCase().includes(searchField.value?.toLowerCase()),
    )
  }
  selected.value = Object.assign({}, item, { fields, findPossibleDataTypes })
  updateList.value = updateConditionFieldMap.value[selected.value.name] || []

  selected.value.fields = mapFieldsData(selected.value).fields
}

function handleSelect(index = 0) {
  position.value = index
  filterFields()
}

function handleUpdate() {
  props.form.setValuesIn('fieldChangeRules', fieldChangeRules.value)
}

const handleSearchTable = debounce(() => {
  loadData()
}, 200)

const handleSearchField = debounce(() => {
  filterFields()
}, 200)

function handleTableClass(type: string) {
  if (activeClassification.value === type) return
  activeClassification.value = type
  loadData()
}

function handleVisibleChange(val: boolean) {
  !val && handleUpdateList()
}

const handleRemoveTag = debounce(() => {
  handleUpdateList()
}, 1000)

function handleUpdateList() {
  updateConditionFieldMap.value[selected.value.name] = updateList.value
  props.form.setValuesIn(
    'updateConditionFieldMap',
    cloneDeep(updateConditionFieldMap.value),
  )
}

function handleUpdateRules(val: any[] = []) {
  fieldChangeRules.value = val
  handleUpdate()
}

// Watches
let unwatchTaskSaving: (() => void) | undefined

watch(updateExNum, (newVal, oldVal) => {
  if (oldVal === 1 && newVal === 0) {
    activeClassification.value = ''
    loadData()
  }
})

watch(activeNodeId, () => {
  unwatchTaskSaving?.()
  if (props.isShow) {
    if (taskSaving.value) {
      unwatchTaskSaving = watch(taskSaving, () => {
        loadData(true)
        unwatchTaskSaving?.()
      })
    } else {
      loadData(true)
    }
  }
})

watch(
  () => props.isShow,
  (v) => {
    if (v) {
      const { height } = navListRef.value!.getBoundingClientRect()
      page.value.size = Math.max(10, Math.ceil(height / 41))
      loadData()
    }
  },
)

defineExpose({
  refresh,
  loadData,
})
</script>

<template>
  <div v-loading="transformLoading" class="field-inference h-100">
    <div class="field-inference__main flex h-100">
      <div class="field-inference__nav flex flex-column">
        <ElInput
          v-model="searchTable"
          :placeholder="
            $t('packages_form_field_mapping_list_qingshurubiaoming')
          "
          clearable
          class="p-2"
          @input="handleSearchTable"
        >
          <template #prefix>
            <ElIcon><ElIconSearch /></ElIcon>
          </template>
        </ElInput>
        <div
          ref="navListRef"
          v-loading="navLoading"
          class="nav-list flex-fill font-color-normal"
        >
          <ul v-if="navList.length">
            <li
              v-for="(item, index) in navList"
              :key="index"
              :class="{ active: position === index }"
              class="flex align-items-center justify-content-between"
              @click="handleSelect(index)"
            >
              <div class="task-form-text-box pl-4 inline-block">
                <OverflowTooltip
                  class="w-100 text-truncate target"
                  :text="item.name"
                  placement="right"
                />
              </div>
            </li>
          </ul>
          <div
            v-else
            class="task-form-left__ul flex flex-column align-items-center"
          >
            <VEmpty />
          </div>
        </div>
        <ElPagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          small
          class="flex p-2 din-font mx-auto"
          layout="total, prev, slot, next"
          :total="page.total"
          :pager-count="5"
          @current-change="loadData"
        >
          <div class="text-center">
            <span class="page__current" style="min-width: 22px">{{
              page.current
            }}</span>
            <span class="icon-color" style="min-width: 22px">/</span>
            <span class="icon-color" style="min-width: 22px">{{
              page.count
            }}</span>
          </div>
        </ElPagination>
      </div>
      <div class="field-inference__content flex-fill flex flex-column">
        <div class="flex align-items-center p-2">
          <ElInput
            v-model="searchField"
            :placeholder="
              $t('packages_form_field_mapping_list_qingshuruziduan')
            "
            clearable
            @input="handleSearchField"
          >
            <template #prefix>
              <ElIcon><ElIconSearch /></ElIcon>
            </template>
          </ElInput>
          <ElButton plain class="btn-refresh ml-2" @click="refresh">
            <VIcon>refresh</VIcon>
          </ElButton>
        </div>
        <List
          ref="listRef"
          v-model:field-change-rules="fieldChangeRules"
          :data="selected"
          :show-columns="['index', 'field_name', 'data_type', 'operation']"
          readonly
          :ignore-error="!isTarget"
          class="content__list flex-fill"
          @update-rules="handleUpdateRules"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.field-inference__header {
  position: relative;
  z-index: 1;
  height: 30px;
}
.field-inference__nav {
  width: 210px;
  border-right: 1px solid var(--el-border-color);
}
.field-inference__content {
  width: 0;
}
.nav-list {
  overflow: hidden auto;
  li {
    background-color: var(--card);
    color: var(--el-text-color-regular);
    border-bottom: 1px solid var(--border-light);
    border-left: 2px solid transparent;
    &:hover,
    &.active {
      background: var(--bg-disactive);
      cursor: pointer;
      border-left-color: var(--color-primary);
    }
    .task-form-text-box {
      //width: 140px;
      .target {
        height: 40px;
        line-height: 40px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
.table__empty_img {
  width: 80px;
  height: 80px;
  img {
    width: 100%;
    height: 100%;
  }
}
.btn-refresh {
  padding: 0;
  height: 28px;
  width: 28px;
  min-width: 28px;
  font-size: 16px;
  &:hover,
  &.is-plain:focus:hover {
    border-color: var(--color-primary);
    background-color: var(--color-white);
  }
}
.content__list {
  height: 0;
}
.page__current {
  width: 22px;
  height: 22px;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-primary);
  line-height: 22px;
  background-color: var(--bg-pageCount);
}
.nav-filter__list {
  background-color: #fafafa;
}
.nav-filter__item {
  &.active {
    background: var(--bg-disactive);
  }
}
.update-list-select {
  &.error {
    :deep(.el-input__inner) {
      border-color: var(--color-danger);
    }
  }
}
</style>
