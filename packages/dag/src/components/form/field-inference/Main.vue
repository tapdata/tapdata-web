<script setup lang="ts">
import { fetchDatabaseTypeByPdkHash } from '@tap/api/src/core/database-types'
import {
  getNodeSchemaPage,
  multiTransform,
} from '@tap/api/src/core/metadata-instances'
import noData from '@tap/assets/images/noData.png'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { FieldSelect, mapFieldsData } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { cloneDeep, debounce } from 'lodash-es'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'
import { getCanUseDataTypes, getMatchedDataTypeLevel } from '../../../util'
import Dialog from './Dialog.vue'
import List from './List.vue'

defineOptions({ name: 'FieldInference' })

const props = defineProps<{
  form: any
  readOnly?: boolean
  disabled?: boolean
  uniqueIndexEnable?: boolean
}>()

const { t } = useI18n()
const dataflowStore = useDataflowStore()

const listRef = useTemplateRef<any>('list')

// Vuex → Pinia
const activeNode = computed(() => dataflowStore.selectedNode)
const stateIsReadonly = computed(() => dataflowStore.stateIsReadonly)

// Data
const navLoading = ref(false)
const fieldsLoading = ref(false)
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
    label: '',
  },
  {
    type: 'updateEx',
    title: t('packages_dag_field_inference_main_gengxintiaojianyi'),
    total: 0,
    label: '',
  },
  {
    type: 'transformEx',
    title: t('packages_dag_field_inference_main_tuiyanyichang'),
    total: 0,
    label: '',
  },
])
const transformExNum = ref(0)
const updateExNum = ref(0)
const dataTypesJson = ref<any>({})
const fieldOptions = ref<any[]>([])

// Computed
const batchRuleCounts = computed(
  () => fieldChangeRules.value.filter((t: any) => t.scope === 'Node').length,
)

const readonly = computed(() => stateIsReadonly.value)

const isErrorSelect = computed(() => {
  const { hasPrimaryKey, hasUnionIndex, hasUpdateField } = selected.value || {}
  return !hasPrimaryKey && !hasUnionIndex && !hasUpdateField
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
  fieldsLoading.value = true
  // TODO 获取原字段类型
  const rules = props.form.getValuesIn('fieldChangeRules') || []
  const nodeAttrs = props.form.getValuesIn('attrs') || {}
  const pdkHashData = await fetchDatabaseTypeByPdkHash(nodeAttrs.pdkHash)
  dataTypesJson.value = pdkHashData
    ? JSON.parse(pdkHashData?.expression || '{}')
    : {}
  if (rules.length) {
    const allTableFields: any[] = []
    navList.value.forEach((el: any) => {
      allTableFields.push(...el.fields.filter((t: any) => !!t.changeRuleId))
    })
    rules.forEach((el: any) => {
      const f = allTableFields.find((t: any) => t.changeRuleId === el.id)
      if (f && el.accept !== f.dataTypeTemp) {
        el.accept = f.dataTypeTemp
      }
    })
  }
  fieldChangeRules.value = rules
  listRef.value?.setRules(fieldChangeRules.value)
  updateConditionFieldMap.value = cloneDeep(
    props.form.getValuesIn('updateConditionFieldMap') || {},
  )
  const { size, current } = page.value
  const tableFilterRegex = searchTable.value ? `.*${searchTable.value}.*` : ''
  const res = await getData({
    page: current,
    pageSize: size,
    tableFilter: tableFilterRegex,
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
    el.label = `${el.title}(${el.total})`
  })
  page.value.count = total ? Math.ceil(total / page.value.size) : 1
  if (resetSelect) {
    handleSelect(position.value)
  } else {
    handleSelect()
  }
  navLoading.value = false
}

function refresh() {
  loadData()
}

async function filterFields() {
  fieldsLoading.value = true
  const item = navList.value[position.value]
  let fields = await getCurrentTableFields(item, fieldChangeRules.value)
  const { fields: newFields } = mapFieldsData(item)
  newFields.forEach((t: any) => {
    delete t.dataType
  })
  fields = newFields
  item.fields = fields
  const findPossibleDataTypes = item?.findPossibleDataTypes || {}
  if (searchField.value) {
    fields = item.fields.filter((t: any) =>
      t.field_name.toLowerCase().includes(searchField.value?.toLowerCase()),
    )
  }
  selected.value = Object.assign({}, item, { fields, findPossibleDataTypes })
  updateList.value = updateConditionFieldMap.value[selected.value.name] || []
  fieldsLoading.value = false

  fieldOptions.value = fields
  selected.value.fields = fields
}

function handleSelect(index = 0) {
  position.value = index
  filterFields()
}

function handleOpen() {
  visible.value = true
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

async function handleUpdateRules(val: any[] = []) {
  fieldChangeRules.value = val
  handleUpdate()
  updateSelectedAllFields(await getCurrentTableFields(selected.value, val))
}

function updateSelectedAllFields(fields: any[] = []) {
  selected.value.fields.forEach((t: any) => {
    const f = fields.find((el: any) => el.field_name === t.field_name)
    if (f) {
      t.data_type = f.data_type
      t.changeRuleId = f.changeRuleId
    }
  })
}

async function getCurrentTableFields(item: any = {}, rules: any[] = []) {
  const { qualified_name, nodeId, source = {}, fields = [] } = item
  const { database_type } = source
  const params = {
    rules: rules.filter(
      (t: any) =>
        t.namespace.length === 1 || t.namespace.includes(qualified_name),
    ),
    qualifiedName: qualified_name,
    nodeId,
    databaseType: database_type,
    fields,
  }
  const data = (await multiTransform(params)) || {
    fields: [],
  }
  return data.fields.length ? data.fields : fields
}

function changeUniqueIndexEnable(val: boolean) {
  props.form.setValuesIn('uniqueIndexEnable', val)
}

// Watch
watch(updateExNum, (newVal, oldVal) => {
  if (oldVal === 1 && newVal === 0) {
    activeClassification.value = ''
    loadData()
  }
})

// Mounted
onMounted(() => {
  activeClassification.value = tableClassification.value[0].type
  loadData()
})

defineExpose({
  refresh,
  loadData,
})
</script>

<template>
  <div class="field-inference">
    <div class="field-inference__main rounded-xl bg-light flex">
      <div class="field-inference__nav flex flex-column">
        <div class="p-2 flex flex-column gap-3">
          <ElSelect v-model="activeClassification" @change="loadData">
            <ElOption
              v-for="(item, index) in tableClassification"
              :key="index"
              :value="item.type"
              :label="item.label"
            >
              <span>{{ item.title }}</span>
              <span
                :class="[
                  item.total && item.type ? 'color-danger' : 'color-info',
                ]"
                >({{ item.total }})</span
              >
            </ElOption>
          </ElSelect>
        </div>

        <div
          v-loading="navLoading"
          class="flex-1 flex-fill flex flex-column min-h-0 bg-card"
        >
          <div class="p-2">
            <ElInput
              v-model="searchTable"
              :placeholder="
                $t('packages_form_field_mapping_list_qingshurubiaoming')
              "
              clearable
              @input="handleSearchTable"
            >
              <template #prefix>
                <ElIcon><ElIconSearch /></ElIcon>
              </template>
            </ElInput>
          </div>
          <div class="nav-list flex-fill font-color-normal">
            <ul v-if="navList.length">
              <li
                v-for="(item, index) in navList"
                :key="index"
                :class="{ active: position === index }"
                class="flex align-items-center justify-content-between"
                @click="handleSelect(index)"
              >
                <div
                  class="task-form-text-box pl-2 inline-block flex-1 min-w-0"
                >
                  <OverflowTooltip
                    class="w-100 text-truncate target"
                    :text="item.name"
                    placement="right"
                  />
                </div>
                <!--<ElTooltip
                      v-if="item.matchedDataTypeLevel === 'error'"
                      placement="top"
                      transition="tooltip-fade-in"
                      :content="$t('packages_dag_field_inference_main_gaibiaocunzaibu')"
                      class="mr-1"
                    >
                      <VIcon size="16" class="color-warning">warning</VIcon>
                    </ElTooltip>-->
              </li>
            </ul>
            <div
              v-else
              class="task-form-left__ul flex flex-column align-items-center"
            >
              <div class="table__empty_img" style="margin-top: 22%">
                <img style="" :src="noData" />
              </div>
              <div class="noData">{{ $t('public_data_no_data') }}</div>
            </div>
          </div>
        </div>

        <ElPagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          small
          class="flex py-1 mx-auto"
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
      <div
        v-loading="fieldsLoading"
        class="field-inference__content flex-fill flex flex-column p-3"
      >
        <div>
          <div class="flex align-center">
            <span class="font-color-dark">{{
              $t('packages_dag_nodes_table_gengxintiaojianzi')
            }}</span>
            <ElTooltip
              transition="tooltip-fade-in"
              :content="$t('packages_dag_field_inference_main_xuanzemorengeng')"
            >
              <VIcon size="16" class="color-primary ml-1">info</VIcon>
            </ElTooltip>
          </div>
          <!-- formily 上下文使用 dataSource 属性 -->
          <FieldSelect
            v-model="updateList"
            :disabled="navLoading || disabled"
            allow-create
            multiple
            filterable
            :placeholder="$t('public_select_option_default')"
            :class="['update-list-select', { error: isErrorSelect }]"
            :data-source="fieldOptions"
            @visible-change="handleVisibleChange"
            @remove-tag="handleRemoveTag"
          />
        </div>
        <div
          class="flex-fill flex flex-column bg-card mt-4 rounded-xl overflow-hidden border"
        >
          <div class="flex align-items-center p-2 font-color-dark">
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
            ref="list"
            v-model:field-change-rules="fieldChangeRules"
            :data="selected"
            :show-columns="['index', 'field_name', 'data_type', 'operation']"
            :data-types-json="dataTypesJson"
            :readonly="readonly"
            ignore-error
            class="content__list flex-fill"
            @update-rules="handleUpdateRules"
            @open-update-rules="handleOpen"
          />
        </div>
      </div>
    </div>
    <Dialog
      v-model:visible="visible"
      v-model:field-change-rules="fieldChangeRules"
      :form="form"
      :readonly="readonly"
    />
  </div>
</template>

<style lang="scss" scoped>
.field-inference__header {
  position: relative;
  z-index: 1;
  height: 30px;
}
.field-inference__main {
  height: 60vh;
  border: 1px solid var(--el-border-color);
}
.field-inference__nav {
  width: 210px;
}
.field-inference__content {
  width: 0;
  border-left: 1px solid var(--el-border-color);
}
.nav-list {
  overflow: hidden auto;
  li {
    color: var(--el-text-color-regular);
    background-color: var(--card);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid var(--border-light);
    border-left: 2px solid transparent;
    &:hover,
    &.active {
      background: rgba(106, 161, 255, 0.1);
      cursor: pointer;
      color: #3b47e5;
      border-left-color: #3b47e5;
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
    border-color: #3b47e5;
    background-color: #fff;
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
  color: #3b47e5;
  line-height: 22px;
  background-color: rgba(44, 101, 255, 0.08);
}
.nav-filter__list {
  background-color: #e5e6eb;
}
.nav-filter__item {
  &.active {
    background: rgba(106, 161, 255, 0.1);
  }
}
.update-list-select {
  &.error {
    :deep(.el-input__inner) {
      border-color: #f54a45;
    }
  }
}
</style>
