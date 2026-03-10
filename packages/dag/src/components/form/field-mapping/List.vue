<script setup lang="ts">
import { resetTable, saveTable } from '@tap/api/src/core/metadata-instances'
import { getNodeTableInfo } from '@tap/api/src/core/task'
import { getPDKDataTypeMapping } from '@tap/api/src/core/type-mapping'
import fieldMapping_table_error from '@tap/assets/images/fieldMapping_table_error.png'
import noData from '@tap/assets/images/noData.png'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { delayTrigger } from '@tap/shared'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'

defineOptions({ name: 'List' })

const props = defineProps<{
  isMetaData?: boolean
  readOnly?: boolean
  updateList?: boolean
}>()

const emit = defineEmits<{
  'update-visible': []
}>()

const { t } = useI18n()
const dataflowStore = useDataflowStore()
const transformLoading = computed(() => dataflowStore.transformLoading)

// data
const searchTable = ref('')
const searchField = ref('')
const dataFlow = ref<any>('')
const navData = ref<any[]>([])
const target = ref<any[]>([])
const editFields = ref<any[]>([])
const viewTableData = ref<any[]>([])
const loadingTable = ref(true)
const loadingNav = ref(true)
const page = reactive({ size: 10, current: 1, total: 0, count: 1 })
const currentOperationType = ref('')
const editValueType = reactive<Record<string, string>>({
  sourceFieldType: '',
  defaultValue: '',
})
const titleType: Record<string, string> = {
  sourceFieldType: t('packages_form_dag_dialog_field_mapping_tittle_data_type'),
  defaultValue: t('packages_form_dag_dialog_field_mapping_tittle_value'),
}
const position = ref<number | string>(0)
const selectRow = ref<any>('')
const currentOperationData = ref<any>('')
const typeMapping = ref<any[]>([])
const dialogVisible = ref(false)
const fieldCount = ref(0)
const editDataValue = ref('')
const currentTypeRules = ref<any>('')

// methods
function getDataFlow() {
  return {
    dag: dataflowStore.dag,
    editVersion: dataflowStore.editVersion,
    taskId: dataflowStore.dataflow.id,
    activeNodeId: dataflowStore.selectedNode?.id,
  }
}

async function select(item: any, index: number) {
  if (!props.readOnly && editFields.value.length > 0) {
    await save()
  }
  position.value = ''
  searchField.value = ''
  fieldCount.value = 0
  editFields.value = []
  selectRow.value = item
  target.value = selectRow.value?.fieldsMapping
  viewTableData.value = target.value
  fieldCount.value = item.sourceFieldCount - item.userDeletedNum || 0
  position.value = index
}

function getMetadataTransformer(value?: any, type?: string) {
  if (type === 'search') {
    page.current = 1
  }
  const { size, current } = page
  const id = dataFlow.value?.id || dataFlow.value?.taskId
  const where: any = {
    taskId: id,
    nodeId: dataFlow.value.nodeId,
    page: current,
    pageSize: size,
  }
  if (value && current !== value) {
    where.searchTable = value
  } else {
    where.searchTable = searchTable.value
  }
  loadingNav.value = true
  loadingTable.value = true
  getNodeTableInfo(where)
    .then((res: any) => {
      const { total, items } = res
      page.total = total
      page.count = Math.ceil(total / 10) === 0 ? 1 : Math.ceil(total / 10)
      navData.value = items || []
      selectRow.value = navData.value?.[position.value as number] || {}
      target.value = selectRow.value?.fieldsMapping
      viewTableData.value = target.value
      fieldCount.value =
        selectRow.value.sourceFieldCount - selectRow.value.userDeletedNum || 0
      if (!props.readOnly) {
        getTypeMapping()
      }
    })
    .finally(() => {
      loadingNav.value = false
      loadingTable.value = false
    })
}

function search() {
  nextTick(() => {
    delayTrigger(() => {
      if (searchField.value.trim()) {
        searchField.value = searchField.value.trim().toString()
        viewTableData.value = target.value.filter((v: any) => {
          const str = `${v.sourceFieldName}${v.targetFieldName}`.toLowerCase()
          return str.includes(searchField.value.toLowerCase())
        })
      } else {
        viewTableData.value = target.value
      }
    }, 100)
  })
}

function rest() {
  searchField.value = ''
  searchTable.value = ''
  position.value = 0
  getMetadataTransformer()
}

function handleClose() {
  dialogVisible.value = false
  currentOperationData.value = ''
  editDataValue.value = ''
}

function edit(row: any, type: string) {
  dialogVisible.value = true
  editValueType[type] = row[type]
  currentOperationType.value = type
  currentOperationData.value = row
  initDataType(row.sourceFieldType)
}

function editSave() {
  const id = currentOperationData.value.sourceFieldName
  const key =
    currentOperationType.value === 'sourceFieldType'
      ? 'sourceFieldType'
      : 'defaultValue'
  const value = editValueType[currentOperationType.value]
  updateTargetView(id, key, value)
  updateTarget(currentOperationData.value, key)
  handleClose()
}

function updateMetaData() {
  const id = dataFlow.value?.id || dataFlow.value?.taskId
  const data = { taskId: id, nodeId: dataFlow.value?.nodeId }
  searchField.value = ''
  resetTable(data).then(() => {
    getMetadataTransformer()
  })
}

function updateTargetView(id: string, key: string, value: any) {
  viewTableData.value.forEach((field: any) => {
    if (field.sourceFieldName === id) {
      field[key] = value
    }
  })
}

function updateTarget(row: any, type: string) {
  if (editFields.value.length === 0) {
    editFields.value.push({
      fieldName: row.sourceFieldName,
      fieldType:
        type === 'sourceFieldType'
          ? editValueType[currentOperationType.value]
          : row.sourceFieldType,
      defaultValue:
        type === 'defaultValue'
          ? editValueType[currentOperationType.value]
          : editDataValue.value,
    })
  } else {
    for (let i = 0; i < editFields.value.length; i++) {
      if (editFields.value[i].fieldName === row.sourceFieldName) {
        if (type === 'defaultValue') {
          editFields.value[i].defaultValue =
            editValueType[currentOperationType.value] || ''
        } else {
          editFields.value[i].fieldType =
            editValueType[currentOperationType.value] || ''
        }
      } else {
        editFields.value.push({
          fieldName: row.sourceFieldName,
          fieldType:
            type === 'sourceFieldType'
              ? editValueType[currentOperationType.value]
              : row.sourceFieldType,
          defaultValue:
            type === 'defaultValue'
              ? editValueType[currentOperationType.value]
              : editDataValue.value,
        })
      }
    }
  }
}

function save(val?: any) {
  const id = dataFlow.value?.id || dataFlow.value?.taskId
  const data = {
    taskId: id,
    nodeId: dataFlow.value?.nodeId,
    tableName: selectRow.value?.sourceObjectName,
    fields: editFields.value || [],
  }
  saveTable(data).then(() => {
    if (val) {
      closeDialog()
      emit('update-visible')
    }
  })
}

function closeDialog() {
  searchField.value = ''
  searchTable.value = ''
}

function getTypeMapping() {
  getPDKDataTypeMapping('Mysql').then((res: any) => {
    const targetObj = JSON.parse(res || '{}')
    for (const key in targetObj) {
      typeMapping.value.push({ dbType: key, rules: targetObj[key] })
    }
  })
}

function initDataType(val: string) {
  const found = typeMapping.value.filter((type: any) => type.dbType === val)
  if (found?.length > 0) {
    currentTypeRules.value = found[0]?.rules || []
  } else {
    currentTypeRules.value = ''
  }
}

function querySearchPdkType(
  _queryString: string,
  cb: (results: any[]) => void,
) {
  const result = typeMapping.value.map((t: any) => ({ value: t.dbType }))
  cb(result)
}

function getPdkEditValueType() {
  const findOne = typeMapping.value.find(
    (t: any) => t.dbType === editValueType[currentOperationType.value],
  )
  return findOne?.rules || ''
}

// watch
watch(
  () => props.updateList,
  () => {
    getMetadataTransformer()
  },
)

watch(transformLoading, (v) => {
  if (!v) {
    getMetadataTransformer()
  }
})

// lifecycle
onMounted(() => {
  dataFlow.value = getDataFlow()
  dataFlow.value.id = dataFlow.value.taskId
  dataFlow.value.nodeId = dataFlow.value.activeNodeId
  getMetadataTransformer()
})
</script>

<template>
  <section v-loading="transformLoading">
    <div class="node-field-mapping flex flex-column">
      <div class="task-form-body">
        <div class="task-form-left flex flex-column">
          <div class="flex mb-2 ml-2 mr-2">
            <div class="flex">
              <ElInput
                v-model="searchTable"
                :placeholder="
                  $t('packages_form_field_mapping_list_qingshurubiaoming')
                "
                clearable
                @input="getMetadataTransformer(searchTable, 'search')"
              >
                <template #suffix>
                  <ElIcon><ElIconSearch /></ElIcon>
                </template>
              </ElInput>
            </div>
          </div>
          <div class="flex bg-main justify-content-between mb-2 pl-2">
            <span class="table-name ml-1">{{
              $t('packages_form_field_mapping_list_biaoming')
            }}</span>
          </div>
          <div
            v-loading="loadingNav"
            class="task-form-left__ul flex flex-column"
          >
            <ul v-if="navData.length > 0">
              <li
                v-for="(item, index) in navData"
                :key="index"
                :class="{ active: position === index }"
                @click="select(item, index)"
              >
                <div v-if="item.invalid" class="task-form__img">
                  <img :src="fieldMapping_table_error" alt="" />
                </div>
                <div class="task-form-text-box">
                  <OverflowTooltip
                    class="w-100 text-truncate target"
                    :text="item.sinkObjectName"
                    placement="right"
                    :open-delay="400"
                  />
                </div>
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
          <ElPagination
            v-model:current-page="page.current"
            v-model:page-size="page.size"
            small
            class="flex mt-3 din-font"
            layout="total, prev, slot, next"
            :total="page.total"
            :pager-count="5"
            @current-change="getMetadataTransformer"
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
        <div class="main">
          <div class="flex ml-2 text-start" style="margin-bottom: 8px">
            <div class="flex">
              <ElInput
                v-model="searchField"
                :placeholder="
                  $t('packages_form_field_mapping_list_qingshuruziduan')
                "
                clearable
                @input="search()"
              >
                <template #suffix>
                  <ElIcon><ElIconSearch /></ElIcon>
                </template>
              </ElInput>
            </div>
            <div class="item ml-2">
              <ElButton plain class="btn-refresh" @click="rest">
                <VIcon>refresh</VIcon>
              </ElButton>
              <ElButton
                v-if="!readOnly"
                text
                class="btn-rest"
                @click="updateMetaData"
              >
                {{ $t('public_button_reset') }}
              </ElButton>
            </div>
          </div>
          <ElTable
            v-loading="loadingTable"
            class="field-mapping-table table-border"
            height="100%"
            :data="viewTableData"
          >
            <ElTableColumn
              type="index"
              width="55"
              :label="$t('packages_form_field_mapping_list_xuhao')"
            />
            <ElTableColumn
              show-overflow-tooltip
              :label="$t('packages_form_dag_dialog_field_mapping_field')"
              prop="field_name"
            >
              <template #default="{ row }">
                <span
                  v-if="row.primary_key_position > 0"
                  :show-overflow-tooltip="true"
                  >{{ row.targetFieldName }}
                  <VIcon size="12" class="color-darkorange">key</VIcon>
                </span>
                <span v-else class="item" :show-overflow-tooltip="true">{{
                  row.targetFieldName
                }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              :label="$t('packages_form_dag_dialog_field_mapping_type')"
              prop="sourceFieldType"
            >
              <template #default="{ row }">
                <div>
                  <span :show-overflow-tooltip="true">{{
                    row.sourceFieldType
                  }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('packages_form_meta_table_default')">
              <template #default="{ row }">
                <div
                  v-if="!readOnly"
                  class="cursor-pointer"
                  @click="edit(row, 'defaultValue')"
                >
                  <ElTooltip
                    class="item"
                    effect="dark"
                    :content="row.defaultValue"
                    placement="left"
                  >
                    <span class="field-mapping-table__default_value">{{
                      row.defaultValue
                    }}</span>
                  </ElTooltip>
                  <el-icon class="field-mapping__icon"><Edit /></el-icon>
                </div>
                <div v-else>{{ row.defaultValue }}</div>
              </template>
            </ElTableColumn>
            <template #empty>
              <div class="field-mapping-table__empty">
                <div class="table__empty_img" style="margin-left: 30%">
                  <img style="" :src="noData" />
                </div>
                <div class="noData">{{ $t('public_data_no_data') }}</div>
              </div>
            </template>
          </ElTable>
        </div>
      </div>
    </div>
    <ElDialog
      v-model="dialogVisible"
      :title="titleType[currentOperationType]"
      width="30%"
      append-to-body
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <div v-if="['sourceFieldType'].includes(currentOperationType)">
        <ElAutocomplete
          v-model="editValueType[currentOperationType]"
          class="inline-input"
          style="width: 350px"
          :fetch-suggestions="querySearchPdkType"
        />
        <div class="mt-3 fs-8">{{ getPdkEditValueType() }}</div>
        <div v-if="currentTypeRules.length > 0" class="field-mapping-data-type">
          <div v-for="(item, index) in currentTypeRules" :key="item.dbType">
            <div
              v-if="
                item.maxPrecision && item.minPrecision !== item.maxPrecision
              "
            >
              <div v-if="index === 0">
                {{
                  $t('packages_form_dag_dialog_field_mapping_range_precision')
                }}
              </div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div
              v-if="item.maxScale && item.minScale !== item.maxScale"
              style="margin-top: 10px"
            >
              <div>
                {{ $t('packages_form_dag_dialog_field_mapping_range_scale') }}
              </div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ElInput
        v-if="['defaultValue'].includes(currentOperationType)"
        v-model="editValueType[currentOperationType]"
        type="textarea"
      />
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose()">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton type="primary" @click="editSave()">{{
            $t('public_button_confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
  </section>
</template>

<style lang="scss">
.node-field-mapping {
  .el-table::before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
  }
  .field-mapping-data-type {
    margin-top: 10px;
    font-size: 12px;
    color: #999;
  }
  .el-pagination button:hover {
    color: var(--color-primary);
  }
}
</style>

<style lang="scss" scoped>
.node-field-mapping {
  flex: 1;
  height: 100%;
  overflow: hidden;
  .icon-error {
    color: red;
  }
  .icon-color {
    color: var(--icon-n2);
  }
  .table__empty_img {
    width: 80px;
    height: 80px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .noData {
    font-size: 12px;
    color: var(--bg-special);
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
  .task-form__text {
    display: inline-block;
    width: 130px;
    text-align: left;
  }
  .btn-rest {
    height: 28px;
    width: 28px;
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
  .task-form-body {
    display: flex;
    height: 60vh;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    .task-form-left {
      padding-top: 8px;
      border-right: 1px solid var(--border-light);
      .table-name {
        height: 40px;
        line-height: 42px;
        font-size: 12px;
        color: var(--text-normal);
        font-weight: 500;
      }
    }
    .task-form-left__ul {
      flex: 1;
      max-width: 210px;
      overflow-x: hidden;
      overflow-y: auto;
      li {
        background: var(--color-white);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
        border-bottom: 1px solid var(--border-light);
        display: flex;
        padding: 10px 0 10px 10px;
        &:hover {
          background: var(--bg-disactive);
          cursor: pointer;
          border-left: 2px solid var(--color-primary);
        }
        &.active {
          background: var(--bg-disactive);
          border-left: 2px solid var(--color-primary);
          cursor: pointer;
        }
        .task-form-text-box {
          margin-left: 10px;
          //width: 140px;
          .target {
            font-size: 12px;
            font-weight: 400;
            color: var(--text-normal);
            line-height: 20px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
    .main {
      display: flex;
      flex: 1;
      overflow: hidden;
      flex-direction: column;
      padding-top: 8px;
    }
    .color-darkorange {
      color: darkorange;
    }
    .field-mapping__icon {
      color: var(--color-primary);
    }
    .field-mapping-table__default_value {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 15px;
    }
  }
  .field-mapping-table {
    :deep(.el-table) {
      border: none;
    }

    :deep(.el-table__empty-block) {
      height: 100% !important;
    }

    :deep(.el-table__header) {
      .el-table__cell {
        border-right: 0;
        &.is-leaf {
          border-bottom: 0;
        }
        &:hover {
          border-right: 1px solid var(--border-light);
        }
      }
      th {
        color: var(--text-normal);
        font-weight: 500;
        white-space: nowrap;
        background-color: var(--bg-normal);
      }
    }

    :deep(.el-table__body) {
      td {
        color: var(--text-light);
      }
    }

    &:after {
      width: 0;
    }
  }
}
</style>
