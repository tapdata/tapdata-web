<script setup lang="ts">
import {
  checkMultipleDataType,
  dataType2TapType,
} from '@tap/api/src/core/metadata-instances'
import { VTable } from '@tap/component/src/base/v-table'
import { Modal } from '@tap/component/src/modal'
import i18n from '@tap/i18n'
import { uuid } from '@tap/shared'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'

defineOptions({ name: 'List' })

const props = withDefaults(
  defineProps<{
    data?: {
      qualified_name: string
      fields: any[]
      nodeId?: string
      [key: string]: any
    }
    showColumns?: any[]
    showDelete?: boolean
    readonly?: boolean
    fieldChangeRules?: any[]
    singleTable?: boolean
    type?: string
    ignoreError?: boolean
    dataTypesJson?: Record<string, any>
  }>(),
  {
    data: () => ({ qualified_name: '', fields: [] }),
    showColumns: () => [],
    showDelete: false,
    readonly: false,
    fieldChangeRules: () => [],
    singleTable: false,
    type: 'target',
    ignoreError: false,
    dataTypesJson: () => ({}),
  },
)

const emit = defineEmits<{
  'update-rules': [data: any[]]
  'open-update-rules': []
  'update-fields': [updater: (fields: any[]) => void]
}>()

const dataflowStore = useDataflowStore()
const activeNode = computed(() => dataflowStore.selectedNode)

const tableRef = useTemplateRef<InstanceType<typeof VTable>>('table')

const columns = [
  {
    label: '#',
    type: 'index',
    prop: 'index',
    minWidth: 40,
  },
  {
    label: i18n.t('packages_form_field_add_del_index_ziduanmingcheng'),
    prop: 'field_name',
    slotName: 'field_name',
    'min-width': '90px',
    'show-overflow-tooltip': true,
  },
  {
    label: i18n.t('packages_form_dag_dialog_field_mapping_type'),
    prop: 'data_type',
    slotName: 'data_type',
    'min-width': '126px',
  },
  {
    label: i18n.t('packages_form_field_inference_list_feikong'),
    prop: 'is_nullable',
    slotName: 'is_nullable',
    width: '60px',
  },
  {
    label: i18n.t('packages_form_field_inference_list_ziduanzhushi'),
    prop: 'comment',
  },
  {
    label: i18n.t('public_operation'),
    prop: 'operation',
    slotName: 'operation',
    headerSlot: 'operationHeader',
    minWidth: 70,
  },
]

const nullableMap: Record<string, string> = {
  true: i18n.t('packages_dag_meta_table_true'),
  false: i18n.t('packages_dag_meta_table_false'),
}

const editDataTypeVisible = ref(false)
const currentData = reactive({
  changeRuleId: '',
  fieldName: '',
  dataTypeTemp: '',
  dataType: '',
  newDataType: '',
  selectDataType: '',
  useToAll: false,
  errorMessage: '',
  source: {} as any,
  canUseDataTypes: [] as any[],
  coefficient: 1,
  customInputData: {} as Record<string, any>,
  selectedDataType: '',
})
const customInputDataValue = ref('')
const customInputLabelMap: Record<string, string> = {
  precision: i18n.t('packages_dag_meta_table_precision'),
  scale: i18n.t('packages_dag_meta_table_scale'),
  byte: i18n.t('packages_dag_meta_table_precision'),
  fraction: i18n.t('packages_dag_meta_table_precision'),
}
const editBtnLoading = ref(false)
const rules = ref<any[]>([])
const modeType = ref('custom')
const originType = ref('')

// Computed
const columnsList = computed(() => {
  let result = columns
  if (props.readonly) {
    result = result.filter((t) => t.prop !== 'operation')
  }
  if (!props.showColumns.length) {
    return result
  }
  return props.showColumns
    .map((t) => result.find((f) => f.prop === t || f.type === t))
    .filter((t) => t)
})

const tableList = computed(() => {
  const { fields } = props.data
  const list = (fields || []).sort(
    (a: any, b: any) => a.columnPosition - b.columnPosition,
  )
  return props.showDelete ? list : list.filter((t: any) => !t.is_deleted)
})

const revokeTableDisabled = computed(() => {
  const { qualified_name } = props.data
  if (props.singleTable) return !rules.value.length
  return rules.value.every((t) => t.namespace?.[1] !== qualified_name)
})

const computedDataTypes = computed(() => {
  return [
    {
      label: i18n.t('packages_dag_field_inference_list_zidingyileixing'),
      value: '',
    },
    ...currentData.canUseDataTypes,
  ]
})

// Watch
watch(
  () => props.fieldChangeRules,
  (val = []) => {
    setRules(val)
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  setRules(props.fieldChangeRules)
})

// Methods
function setRules(data: any[] = []) {
  rules.value = cloneDeep(data)
}

function findInRulesById(id: string) {
  return rules.value.find((t) => t.id === id)
}

function findNodeRuleByType(type: string) {
  return rules.value.find((t) => t.accept === type && t.scope === 'Node')
}

function deleteRuleById(id: string) {
  const index = rules.value.findIndex((t) => t.id === id)
  rules.value.splice(index, 1)
}

async function openEditDataTypeVisible(row: any) {
  const { source = {} } = row || {}
  currentData.changeRuleId = row.changeRuleId
  currentData.dataType = getDataType(row)
  currentData.dataTypeTemp = row.dataTypeTemp
  currentData.fieldName = row.field_name
  currentData.newDataType = currentData.dataType
  currentData.useToAll = false
  currentData.errorMessage = ''
  currentData.source = source
  currentData.canUseDataTypes = await getTypeJson()
  const findRule = rules.value.find((t) => t.id === currentData.changeRuleId)
  currentData.selectDataType = findRule?.result?.selectDataType || ''
  currentData.coefficient = findRule?.multiple || 1
  currentData.selectedDataType = '' // 下拉框选择的类型，仅前端使用

  const dataTypeCheckMultiple = await checkMultipleDataType({
    databaseType: activeNode.value?.databaseType,
    dataType: currentData.dataType,
  })

  let _modeType = 'custom'
  if (dataTypeCheckMultiple?.result) {
    originType.value = dataTypeCheckMultiple.originType
    const rule = findInRulesById(currentData.changeRuleId)
    if (rule?.scope !== 'Field') {
      props.fieldChangeRules
        .filter((t) => t.type !== 'Field')
        .forEach((item: any = {}) => {
          const { namespace = [] } = item
          if (
            item.type === 'MutiDataType' &&
            item.accept === originType.value
          ) {
            currentData.coefficient = item.multiple
            _modeType = 'coefficient'
          } else {
            const flag =
              namespace[0] === props.data.nodeId &&
              (namespace.length === 1 ||
                (namespace[1] === props.data.qualified_name &&
                  namespace[2] === currentData.fieldName))
            if (flag) {
              _modeType = 'custom'
            }
          }
        })
    }
  } else {
    originType.value = ''
  }

  modeType.value = _modeType
  editDataTypeVisible.value = true
}

function handleUpdate(data?: any[]) {
  emit('update-rules', cloneDeep(data || rules.value))
}

function submitEdit() {
  const { qualified_name, nodeId } = props.data
  const {
    changeRuleId,
    fieldName,
    dataTypeTemp,
    newDataType,
    useToAll,
    selectDataType,
    coefficient = 1,
  } = currentData
  const params = {
    databaseType: activeNode.value?.databaseType,
    dataTypes: [newDataType],
  }

  if (modeType.value === 'coefficient') {
    const f = findInRulesById(changeRuleId)
    let ruleId = f?.id
    let ruleAccept = f?.accept
    if (f?.type === 'MutiDataType') {
      f.multiple = coefficient
      f.accept = originType.value
      f.result = {
        dataType: `${originType.value}(${coefficient}n)`,
        dataTypeTemp,
      }
      const index = rules.value.findIndex((t) => t.id === ruleId)
      rules.value.splice(index, 1)
      rules.value.push(f)
    } else {
      const index = rules.value.findIndex(
        (t) => t.accept === originType.value && t.type === 'MutiDataType',
      )
      if (index !== -1) {
        rules.value.splice(index, 1)
      }
      const op = {
        id: uuid(),
        scope: 'Node',
        namespace: [nodeId],
        type: 'MutiDataType',
        accept: originType.value,
        multiple: coefficient,
        result: {
          dataType: `${originType.value}(${coefficient}n)`,
          dataTypeTemp,
        },
      }
      ruleId = op.id
      ruleAccept = op.accept
      rules.value.push(op)
    }

    // 刷新字段 - emit 到 Main.vue 对所有表做处理
    const _originType = originType.value
    const _coefficient = coefficient
    const _ruleId = ruleId
    emit('update-fields', (fields: any[]) => {
      fields.forEach((t: any) => {
        const fieldOriginType = t.data_type?.split('(')[0]
        if (fieldOriginType === _originType && t.dataTypeTemp) {
          t.data_type = t.dataTypeTemp.replace(
            /(\w+\()(\w+)([,)][\s\S]*)/,
            function (_val: string, sub1: string, sub2: string, sub3: string) {
              return `${sub1}${(sub2 as any) * _coefficient}${sub3}`
            },
          )
          t.changeRuleId = _ruleId
        }
      })
    })
    handleUpdate()
    ElMessage.success(i18n.t('public_message_operation_success'))
    editDataTypeVisible.value = false
    return
  }

  editBtnLoading.value = true
  currentData.errorMessage = ''
  dataType2TapType(params)
    .then((data) => {
      const val = data[newDataType]
      const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
      if (!tapType) {
        currentData.errorMessage = i18n.t(
          'packages_form_field_inference_list_geshicuowu',
        )
        editBtnLoading.value = false
        return
      }
      const f = findInRulesById(changeRuleId)
      let ruleId = f?.id
      if (f?.scope === 'Field') {
        if (useToAll) {
          const batchRule = findNodeRuleByType(f.accept)
          if (batchRule) {
            deleteRuleById(f.id)
            batchRule.result = {
              dataType: newDataType,
              tapType,
              selectDataType,
            }
            ruleId = batchRule.id
          } else {
            f.scope = 'Node'
            f.namespace = [nodeId]
            f.result = { dataType: newDataType, tapType, selectDataType }
          }
        } else {
          f.result = { dataType: newDataType, tapType, selectDataType }
        }
        const index = rules.value.findIndex((t) => t.id === ruleId)
        rules.value.splice(index, 1)
        rules.value.push(f)
      } else {
        const op = {
          id: uuid(),
          scope: useToAll ? 'Node' : 'Field',
          namespace: useToAll ? [nodeId] : [nodeId, qualified_name, fieldName],
          type: 'DataType',
          accept: dataTypeTemp,
          result: { dataType: newDataType, tapType, selectDataType },
        }
        ruleId = op.id
        rules.value.push(op)
      }

      // emit 到 Main.vue 对所有表做处理
      const _useToAll = useToAll
      const _dataTypeTemp = dataTypeTemp
      const _fieldName = fieldName
      const _newDataType = newDataType
      const _ruleId = ruleId
      emit('update-fields', (fields: any[], qualifiedName: string) => {
        fields.forEach((t: any) => {
          if (
            (_useToAll &&
              t.data_type === t.dataTypeTemp &&
              t.dataTypeTemp === _dataTypeTemp) ||
            (t.field_name === _fieldName && qualifiedName === qualified_name)
          ) {
            t.data_type = _newDataType
            t.changeRuleId = _ruleId
          }
        })
      })
      handleUpdate()
      editBtnLoading.value = false
      ElMessage.success(i18n.t('public_message_operation_success'))
      editDataTypeVisible.value = false
    })
    .catch(() => {
      editBtnLoading.value = false
    })
}

function revoke(row: any) {
  if (getRevokeDisabled(row)) return
  const f = findInRulesById(row.changeRuleId)
  if (!f) return
  if (f.scope === 'Node') {
    emit('open-update-rules')
    return
  }
  if (f.scope === 'Field') {
    row.data_type = f.accept
    const index = rules.value.findIndex((t) => t.id === f.id)
    rules.value.splice(index, 1)
  }
  row.data_type = row.dataTypeTemp
  handleUpdate()
}

function revokeAll() {
  if (revokeTableDisabled.value) {
    return
  }
  Modal.confirm(
    i18n.t('packages_form_field_inference_list_ninquerenyaohui'),
  ).then((resFlag: boolean) => {
    if (resFlag) {
      const { qualified_name } = props.data
      if (props.singleTable) {
        rules.value = [] // 清空数据
        handleUpdate()
      } else {
        rules.value = rules.value.filter(
          (t) => t.namespace?.[1] !== qualified_name,
        ) // 清空当前表的数据
        handleUpdate()
      }
      ElMessage.success(i18n.t('public_message_operation_success'))
    }
  })
}

function doLayout() {
  ;(tableRef.value as any)?.doLayout()
}

function getRevokeDisabled(row: any) {
  return !props.fieldChangeRules.find((t) => t.id === row.changeRuleId)?.scope
}

function getFieldScope(row: any = {}) {
  return props.fieldChangeRules.find((t) => t.id === row.changeRuleId)?.scope
}

function getRevokeColorClass(row: any = {}) {
  const map: Record<string, string> = {
    Node: 'color-warning',
    Field: 'color-primary',
  }
  return map[getFieldScope(row)] || 'color-disable'
}

function tableRowClassName({ row }: { row: any }) {
  return !props.ignoreError && row.matchedDataTypeLevel === 'error'
    ? 'warning-row'
    : ''
}

function getCanUseDataTypesTooltip(matchedDataTypeLevel: string) {
  const map: Record<string, string> = {
    error:
      props.type === 'target'
        ? i18n.t('packages_dag_field_inference_list_gaiziduanshuju')
        : i18n.t('packages_dag_field_inference_list_gaiziduanwufa'),
  }
  return map[matchedDataTypeLevel]
}

function querySearch(val: string, cb: (items: any[]) => void) {
  cb(
    currentData.canUseDataTypes?.map((t) => {
      return { value: t }
    }) || [],
  )
}

function handleAutocomplete(itemValue: string) {
  if (!itemValue) {
    currentData.newDataType = currentData.dataTypeTemp
    return
  }
  const item = computedDataTypes.value.find((t) => t.value === itemValue)
  currentData.customInputData = {}

  /**
   * 1.选中选项后，检查选项是否有变量；有变量向下走
   * 2.把括号内字符串提取出来，并进行分割
   * 3.根据多个变量名（$开头的），获取输入框的范围；默认最小值
   * 4.每次修改输入框都会改变最终结果
   */
  customInputDataValue.value = itemValue // 记录原始值
  currentData.selectDataType = itemValue
  const contentStr = item?.value.match(/\(([^)]+)\)/)?.[1]
  if (contentStr) {
    const contentArr = contentStr.split(',')
    contentArr.forEach((el) => {
      const key = el.replace(/^\$/, '')
      let min: number | undefined, max: number | string | undefined
      if (typeof item.attrs[key] === 'number') {
        max = typeof item.attrs[key]
      } else if (Array.isArray(item.attrs[key])) {
        min = item.attrs[key][0] ? item.attrs[key][0] * 1 : undefined
        max = item.attrs[key][1] ? item.attrs[key][1] * 1 : undefined
      }
      currentData.customInputData[key] = {
        min,
        max,
        label: customInputLabelMap[key] || key,
      }
      const defaultValue =
        item.attrs.default ??
        item.attrs[`default${key.charAt(0).toUpperCase()}${key.slice(1)}`] ??
        item.attrs[key]?.[0] ??
        null
      currentData.customInputData[key].value = defaultValue
        ? defaultValue * 1
        : null
    })
  }
  handleChangeCustomInput()
}

function getDataType(row: any = {}) {
  // 这里不清楚为要返回 dataTypeTemp，不过 dataTypeTemp 可能为空，所以加上 || row.data_type
  if (
    !rules.value.length ||
    !rules.value.find((t) => t.id === row.changeRuleId)
  )
    return row.dataTypeTemp || row.data_type
  return row.data_type
}

async function getTypeJson() {
  const dataTypes = props.dataTypesJson
  const result: any[] = []
  for (const key in dataTypes) {
    const item = dataTypes[key]
    result.push({
      label: key.replace(/[([]([^)]+)\)\]/, ''),
      value: key,
      attrs: item,
    })
  }
  return result
}

function handleChangeCustomInput() {
  const { customInputData } = currentData
  currentData.newDataType = customInputDataValue.value
    .replaceAll(/\[(.*?)\]/g, '$1') // 去掉所有的方括号，保留内容
    .replaceAll(/\$\w+/g, (match) => {
      // 匹配所有 $ 开头的变量
      const key = match.slice(1) // 去掉 $ 前缀
      return customInputData[key]?.value || match
    })
}

defineExpose({ setRules, doLayout })
</script>

<template>
  <div class="field-inference__list">
    <VTable
      ref="table"
      :key="`${revokeTableDisabled}`"
      :columns="columnsList"
      :data="tableList"
      :has-pagination="false"
      height="100%"
      :row-class-name="tableRowClassName"
    >
      <template #field_name="{ row: field }">
        <template v-if="field.isPrimaryKey">
          <ElTooltip
            v-if="field.isForeignKey"
            placement="top"
            :content="
              $t('public_foreign_key_tip', {
                name: field.constraints[0],
                val: field.constraints[2],
              })
            "
          >
            <VIcon size="12" class="text-warning align-middle">key</VIcon>
          </ElTooltip>
          <VIcon v-else size="12" class="text-warning align-middle">key</VIcon>
        </template>
        <ElTooltip
          v-else-if="field.isForeignKey"
          placement="top"
          :content="
            $t('public_foreign_key_tip', {
              name: field.constraints[0],
              val: field.constraints[2],
            })
          "
          :open-delay="200"
          transition="none"
        >
          <span class="inline-flex align-center align-middle">
            <VIcon size="14">share</VIcon>
            <span
              v-if="field.isMultiForeignKey"
              :style="`--index: '${field.constraints[1]}';`"
              class="fingerprint-sub foreign-sub"
            />
          </span>
        </ElTooltip>
        <ElTooltip
          v-else-if="field.indicesUnique"
          placement="top"
          :content="`${$t(field.indicesUnique[2] ? 'public_unique_index' : 'public_normal_index')}: ${field.indicesUnique[0]}`"
          :open-delay="200"
          transition="none"
        >
          <span
            v-if="field.indicesUnique[2]"
            class="inline-flex align-center align-middle"
            :class="{ 'text-primary': field.indicesUnique[3] }"
          >
            <VIcon size="14">fingerprint</VIcon>
            <span
              v-if="field.isMultiUniqueIndex"
              :style="`--index: '${field.indicesUnique[1]}';`"
              class="fingerprint-sub unique-sub"
            />
          </span>
          <span v-else class="inline-flex align-center align-middle">
            <VIcon size="14">sort-descending</VIcon>
            <span
              v-if="field.isMultiIndex"
              :style="`--index: '${field.indicesUnique[1]}';`"
              class="fingerprint-sub index-sub"
            />
          </span>
        </ElTooltip>
        <VIcon
          v-else-if="field.isPartitionKey"
          size="14"
          class="ml-1 align-middle"
          >circle-dashed-letter-p</VIcon
        >
        <VIcon v-else-if="field.source === 'virtual_hash'" size="14"
          >file-hash</VIcon
        >
        <span
          class="ellipsis ml-1 align-middle"
          :style="field.source === 'virtual_hash' ? 'font-style:italic' : ''"
          >{{ field.field_name }}</span
        >
      </template>
      <template #dataTypeHeader>
        <span class="pl-4">
          {{ $t('packages_dag_meta_table_field_type') }}
        </span>
      </template>
      <template #data_type="scope">
        <div
          class="position-relative"
          :class="{
            'pl-5':
              !ignoreError &&
              !!getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel),
          }"
        >
          <ElTooltip
            v-if="!ignoreError"
            transition="tooltip-fade-in"
            :disabled="scope.row.matchedDataTypeLevel !== 'error'"
            :content="getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel)"
            class="type-warning position-absolute"
          >
            <VIcon
              size="16"
              class="color-warning"
              :class="{ 'opacity-0': !scope.row.matchedDataTypeLevel }"
              >warning</VIcon
            >
          </ElTooltip>
          <span v-if="readonly">{{ getDataType(scope.row) }}</span>
          <div
            v-else
            class="cursor-pointer inline-block"
            @click="openEditDataTypeVisible(scope.row)"
          >
            <span>{{ getDataType(scope.row) }}</span>
            <VIcon class="ml-2">edit-outline</VIcon>
          </div>
        </div>
      </template>
      <template #is_nullable="scope">
        {{ nullableMap[!scope.row.is_nullable] }}
      </template>
      <template #operationHeader>
        <ElButton
          text
          type="primary"
          :class="!revokeTableDisabled ? 'color-primary' : 'color-disable'"
          @click="revokeAll()"
          >{{ $t('public_button_revoke') }}</ElButton
        >
      </template>
      <template #operation="scope">
        <ElTooltip
          :disabled="getFieldScope(scope.row) !== 'Node'"
          :content="$t('packages_form_field_inference_main_gepiliangxiugai')"
          placement="top"
        >
          <ElButton
            text
            type="primary"
            :class="getRevokeColorClass(scope.row)"
            @click="revoke(scope.row)"
            >{{ $t('public_button_revoke') }}</ElButton
          >
        </ElTooltip>
      </template>
    </VTable>
    <ElDialog
      v-model="editDataTypeVisible"
      :title="$t('packages_form_field_inference_list_ziduanleixingtiao')"
      append-to-body
      :close-on-click-modal="false"
      width="820px"
    >
      <div class="mb-6 px-4 py-2 rounded-lg bg-color-main">
        <span class="mr-3">{{
          $t('packages_form_field_inference_list_tuiyanchudelei')
        }}</span>
        <span v-if="modeType === 'custom'">{{ currentData.dataTypeTemp }}</span>
        <span v-else>{{ `${originType} (n)` }}</span>
      </div>
      <ElForm
        ref="dataTypeForm"
        label-width="140px"
        label-position="top"
        :model="currentData"
        @submit.prevent
      >
        <ElRadioGroup v-if="!!originType" v-model="modeType" class="mb-3">
          <ElRadio label="custom">{{
            $t('packages_dag_field_inference_list_zidingyitiaozheng')
          }}</ElRadio>
          <ElRadio label="coefficient">{{
            $t('packages_dag_field_inference_list_anxishutiaozheng')
          }}</ElRadio>
        </ElRadioGroup>
        <template v-if="modeType === 'custom'">
          <div class="flex">
            <ElFormItem
              :label="$t('packages_dag_field_inference_list_xuanzetiaozhengde')"
              prop="selectedDataType"
              inline-message
            >
              <ElSelect
                v-model="currentData.selectedDataType"
                filterable
                :placeholder="$t('public_input_placeholder')"
                @change="handleAutocomplete"
              >
                <ElOption
                  v-for="item in computedDataTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem
              v-if="!currentData.selectedDataType"
              :label="$t('packages_dag_field_inference_list_zidingyileixing')"
              prop="newDataType"
              :error="currentData.errorMessage"
              inline-message
              required
              class="ml-6"
            >
              <ElInput
                v-model="currentData.newDataType"
                class="inline-input"
                :placeholder="$t('public_input_placeholder')"
              />
            </ElFormItem>
            <template v-else>
              <ElFormItem
                v-for="(
                  customInput, customInputKey
                ) in currentData.customInputData"
                :key="customInputKey"
                :label="customInput.label"
                :prop="`customInputData.${customInputKey}.value`"
                required
                class="ml-6"
              >
                <ElInputNumber
                  v-model="customInput.value"
                  controls-position="right"
                  :min="customInput.min"
                  :max="customInput.max"
                  class="custom-input"
                  step-strictly
                  @change="handleChangeCustomInput"
                />
              </ElFormItem>
            </template>
          </div>
          <div>
            <ElCheckbox v-model="currentData.useToAll">{{
              $t('packages_form_field_inference_list_duidangqiantuiyan')
            }}</ElCheckbox>
            <div v-show="currentData.useToAll" class="mt-2 color-danger fs-8">
              {{ $t('packages_form_field_inference_list_piliangyingyonghui') }}
            </div>
          </div>
        </template>
        <template v-else>
          <ElFormItem
            :label="`${$t('packages_dag_field_inference_list_anzhaoxishu')}:`"
          >
            <div class="flex align-items-center">
              <span>{{ originType }}</span>
              <span>(</span>
              <ElInputNumber
                v-model="currentData.coefficient"
                controls-position="right"
                :min="0.1"
                class="coefficient-input mx-2"
              />
              <span>* n )</span>
            </div>
          </ElFormItem>
          <div class="flex align-items-center mt-n3 mb-3">
            <VIcon class="color-primary mr-3">info</VIcon>
            <span>{{
              $t('packages_dag_field_inference_list_anzhaoxishu_tip')
            }}</span>
          </div>
        </template>
      </ElForm>
      <template #footer>
        <ElButton @click="editDataTypeVisible = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          type="primary"
          :disabled="!currentData.newDataType"
          :loading="editBtnLoading"
          @click="submitEdit"
          >{{ $t('public_button_confirm') }}</ElButton
        >
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.field-inference__list {
  height: 100%;
  :deep(.warning-row) {
    background: rgb(254, 229, 216);
    &:hover {
      > td.el-table__cell {
        background: rgb(254, 229, 216);
      }
    }
  }
}
.type-warning {
  top: 3px;
  left: 0;
}

.custom-input {
  width: 180px;
}

.el-input-number {
  width: 240px;
}

.coefficient-input {
  width: 100px;
}
</style>
