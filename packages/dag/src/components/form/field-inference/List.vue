<template>
  <div class="field-inference__list">
    <VTable
      :columns="columnsList"
      :data="tableList"
      :has-pagination="false"
      ref="table"
      height="100%"
      :key="revokeTableDisabled + ''"
      :row-class-name="tableRowClassName"
    >
      <template v-slot:field_name="scope">
        <span class="flex align-center"
          ><span class="ellipsis">{{ scope.row.field_name }}</span>
          <VIcon v-if="scope.row.primary_key_position > 0" size="12" class="text-warning ml-1">key</VIcon>
        </span>
      </template>
      <template v-slot:dataTypeHeader>
        <span class="pl-4">
          {{ $t('packages_dag_meta_table_field_type') }}
        </span>
      </template>
      <template v-slot:data_type="scope">
        <div
          class="position-relative"
          :class="{
            'pl-5': !ignoreError && !!getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel),
          }"
        >
          <ElTooltip
            v-if="!ignoreError"
            transition="tooltip-fade-in"
            :disabled="scope.row.matchedDataTypeLevel !== 'error'"
            :content="getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel)"
            class="type-warning position-absolute"
          >
            <VIcon size="16" class="color-warning" :class="{ 'opacity-0': !scope.row.matchedDataTypeLevel }"
              >warning</VIcon
            >
          </ElTooltip>
          <span v-if="readonly">{{ getDataType(scope.row) }}</span>
          <div v-else class="cursor-pointer inline-block" @click="openEditDataTypeVisible(scope.row)">
            <span>{{ getDataType(scope.row) }}</span>
            <VIcon class="ml-2">edit-outline</VIcon>
          </div>
        </div>
      </template>
      <template v-slot:is_nullable="scope">
        {{ nullableMap[!scope.row.is_nullable] }}
      </template>
      <template v-slot:operationHeader>
        <ElButton type="text" :class="!revokeTableDisabled ? 'color-primary' : 'color-disable'" @click="revokeAll()">{{
          $t('public_button_revoke')
        }}</ElButton>
      </template>
      <template v-slot:operation="scope">
        <ElTooltip
          :disabled="getFieldScope(scope.row) !== 'Node'"
          :content="$t('packages_form_field_inference_main_gepiliangxiugai')"
          placement="top"
        >
          <ElButton type="text" :class="getRevokeColorClass(scope.row)" @click="revoke(scope.row)">{{
            $t('public_button_revoke')
          }}</ElButton>
        </ElTooltip>
      </template>
    </VTable>
    <ElDialog
      :title="$t('packages_form_field_inference_list_ziduanleixingtiao')"
      append-to-body
      :close-on-click-modal="false"
      v-model="editDataTypeVisible"
      width="820px"
    >
      <div class="mb-6 px-4 py-2" style="background-color: #f4f4f5">
        <span class="mr-3">{{ $t('packages_form_field_inference_list_tuiyanchudelei') }}</span>
        <span v-if="modeType === 'custom'">{{ currentData.dataTypeTemp }}</span>
        <span v-else>{{ originType + ' (n)' }}</span>
      </div>
      <ElForm ref="dataTypeForm" label-width="140px" label-position="top" :model="currentData" @submit.prevent>
        <ElRadioGroup v-if="!!originType" v-model="modeType" class="mb-3">
          <ElRadio label="custom">{{ $t('packages_dag_field_inference_list_zidingyitiaozheng') }}</ElRadio>
          <ElRadio label="coefficient">{{ $t('packages_dag_field_inference_list_anxishutiaozheng') }}</ElRadio>
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
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
                ></ElOption>
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
                class="inline-input"
                v-model="currentData.newDataType"
                :placeholder="$t('public_input_placeholder')"
              ></ElInput>
            </ElFormItem>
            <template v-else>
              <ElFormItem
                v-for="(customInput, customInputKey) in currentData.customInputData"
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
                  class="coefficient-input custom-input"
                  step-strictly
                  @change="handleChangeCustomInput"
                ></ElInputNumber>
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
          <ElFormItem :label="$t('packages_dag_field_inference_list_anzhaoxishu') + ':'">
            <div class="flex align-items-center">
              <span>{{ originType }}</span>
              <span>(</span>
              <ElInputNumber
                v-model="currentData.coefficient"
                controls-position="right"
                :min="0.1"
                class="coefficient-input mx-2"
              ></ElInputNumber>
              <span>* n )</span>
            </div>
          </ElFormItem>
          <div class="flex align-items-center mt-n3 mb-3">
            <VIcon class="color-primary mr-3">info</VIcon>
            <span>{{ $t('packages_dag_field_inference_list_anzhaoxishu_tip') }}</span>
          </div>
        </template>
      </ElForm>
      <template v-slot:footer>
        <ElButton @click="editDataTypeVisible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton type="primary" :disabled="!currentData.newDataType" :loading="editBtnLoading" @click="submitEdit">{{
          $t('public_button_confirm')
        }}</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../../utils/gogocodeTransfer'
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash'

import { VTable, VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import { metadataInstancesApi } from '@tap/api'
import { uuid } from '@tap/shared'

export default {
  name: 'List',
  components: { VTable, VIcon },
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          qualified_name: '',
          fields: [],
        }
      },
    },
    showColumns: {
      type: Array,
      default: () => [],
    },
    showDelete: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    fieldChangeRules: {
      type: Array,
      default: () => [],
    },
    singleTable: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'target',
    },
    ignoreError: Boolean,
    dataTypesJson: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      columns: [
        {
          label: i18n.t('packages_form_field_mapping_list_xuhao'),
          type: 'index',
          prop: 'index',
          minWidth: '42px',
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
          width: '60px',
        },
      ],
      nullableMap: {
        true: i18n.t('packages_dag_meta_table_true'),
        false: i18n.t('packages_dag_meta_table_false'),
      },
      editDataTypeVisible: false,
      currentData: {
        changeRuleId: '',
        fieldName: '',
        dataTypeTemp: '',
        dataType: '',
        newDataType: '',
        selectDataType: '',
        useToAll: false,
        errorMessage: '',
        source: {},
        canUseDataTypes: [],
        coefficient: 1,
        customInputData: {},
        selectedDataType: '',
      },
      customInputDataValue: '',
      customInputLabelMap: {
        precision: i18n.t('packages_dag_meta_table_precision'),
        scale: i18n.t('packages_dag_meta_table_scale'),
        byte: i18n.t('packages_dag_meta_table_precision'),
        fraction: i18n.t('packages_dag_meta_table_precision'),
      },
      editBtnLoading: false,
      rules: [],
      modeType: 'custom',
      originType: '',
    }
  },
  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'stateIsReadonly']),

    columnsList() {
      const { showColumns, columns, readonly } = this
      let result = columns
      if (readonly) {
        result = result.filter((t) => t.prop !== 'operation')
      }
      if (!showColumns.length) {
        return result
      }
      return showColumns
        .map((t) => {
          return result.find((f) => f.prop === t || f.type === t)
        })
        .filter((t) => t)
    },

    tableList() {
      const { fields } = this.data
      let list = (fields || []).sort((a, b) => a.columnPosition - b.columnPosition)
      return this.showDelete ? list : list.filter((t) => !t.is_deleted)
    },

    revokeTableDisabled() {
      const { qualified_name } = this.data
      if (this.singleTable) return !this.rules.length
      return this.rules.every((t) => t.namespace?.[1] !== qualified_name)
    },

    computedDataTypes() {
      return [
        {
          label: i18n.t('packages_dag_field_inference_list_zidingyileixing'),
          value: '',
        },
        ...this.currentData.canUseDataTypes,
      ]
    },
  },
  watch: {
    fieldChangeRules: {
      deep: true,
      handler(val = []) {
        this.setRules(val)
      },
    },
  },
  mounted() {
    this.setRules(this.fieldChangeRules)
  },
  methods: {
    setRules(data = []) {
      this.rules = cloneDeep(data)
    },

    findInRulesById(id) {
      return this.rules.find((t) => t.id === id)
    },

    findNodeRuleByType(type) {
      return this.rules.find((t) => t.accept === type && t.scope === 'Node')
    },

    deleteRuleById(id) {
      const index = this.rules.findIndex((t) => t.id === id)
      this.rules.splice(index, 1)
    },

    async openEditDataTypeVisible(row) {
      const { source = {}, canUseDataTypes = [] } = row || {}
      this.currentData.changeRuleId = row.changeRuleId
      this.currentData.dataType = this.getDataType(row)
      this.currentData.dataTypeTemp = row.dataTypeTemp
      this.currentData.fieldName = row.field_name
      this.currentData.newDataType = this.currentData.dataType
      this.currentData.useToAll = false
      this.currentData.errorMessage = ''
      this.currentData.source = source
      this.currentData.canUseDataTypes = await this.getTypeJson()
      const findRule = this.rules.find((t) => t.id === this.currentData.changeRuleId)
      this.currentData.selectDataType = findRule?.result?.selectDataType || ''
      this.currentData.coefficient = findRule?.multiple || 1
      this.currentData.selectedDataType = '' // 下拉框选择的类型，仅前端使用

      const dataTypeCheckMultiple = await metadataInstancesApi.dataTypeCheckMultiple({
        databaseType: this.activeNode.databaseType,
        dataType: this.currentData.dataType,
      })

      let modeType = 'custom'
      if (dataTypeCheckMultiple?.result) {
        this.originType = dataTypeCheckMultiple.originType
        const rule = this.findInRulesById(this.currentData.changeRuleId)
        if (rule?.scope !== 'Field') {
          this.fieldChangeRules
            .filter((t) => t.type !== 'Field')
            .forEach((item = {}) => {
              const { namespace = [] } = item
              if (item.type === 'MutiDataType' && item.accept === this.originType) {
                this.currentData.coefficient = item.multiple
                modeType = 'coefficient'
              } else {
                const flag =
                  namespace[0] === this.data.nodeId &&
                  (namespace.length === 1 ||
                    (namespace[1] === this.data.qualified_name && namespace[2] === this.currentData.fieldName))
                if (flag) {
                  modeType = 'custom'
                }
              }
            })
        }
      } else {
        this.originType = ''
      }

      this.modeType = modeType
      this.editDataTypeVisible = true
    },

    handleUpdate(data) {
      $emit(this, 'update-rules', cloneDeep(data || this.rules))
    },

    submitEdit() {
      const { qualified_name, nodeId } = this.data
      const {
        changeRuleId,
        fieldName,
        dataType,
        dataTypeTemp,
        newDataType,
        useToAll,
        selectDataType,
        coefficient = 1,
      } = this.currentData
      const params = {
        databaseType: this.activeNode.databaseType,
        dataTypes: [newDataType],
      }

      if (this.modeType === 'coefficient') {
        const f = this.findInRulesById(changeRuleId)
        let ruleId = f?.id
        let ruleAccept = f?.accept
        if (f?.type === 'MutiDataType') {
          f.multiple = coefficient
          f.accept = this.originType
          f.result = {
            dataType: `${this.originType}(${coefficient}n)`,
            dataTypeTemp,
          }
          const index = this.rules.findIndex((t) => t.id === ruleId)
          this.rules.splice(index, 1)
          this.rules.push(f)
        } else {
          const index = this.rules.findIndex((t) => t.accept === this.originType && t.type === 'MutiDataType')
          if (index > -1) {
            this.rules.splice(index, 1)
          }
          const op = {
            id: uuid(),
            scope: 'Node',
            namespace: [nodeId],
            type: 'MutiDataType',
            accept: this.originType,
            multiple: coefficient,
            result: {
              dataType: `${this.originType}(${coefficient}n)`,
              dataTypeTemp,
            },
          }
          ruleId = op.id
          ruleAccept = op.accept
          this.rules.push(op)
        }

        // 刷新字段
        this.data.fields.forEach((t) => {
          const fieldOriginType = t.data_type?.split('(')[0]
          if (fieldOriginType === this.originType) {
            t.data_type = t.dataTypeTemp.replace(/(\w+\()(\w+)([,)][\w\W]*)/, function (val, sub1, sub2, sub3) {
              return `${sub1}${sub2 * coefficient}${sub3}`
            })
            t.changeRuleId = ruleId
          }
        })
        this.handleUpdate()
        this.$message.success(i18n.t('public_message_operation_success'))
        this.editDataTypeVisible = false
        return
      }

      this.editBtnLoading = true
      this.currentData.errorMessage = ''
      metadataInstancesApi
        .dataType2TapType(params)
        .then((data) => {
          const val = data[newDataType]
          const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
          if (!tapType) {
            this.currentData.errorMessage = i18n.t('packages_form_field_inference_list_geshicuowu')
            this.editBtnLoading = false
            return
          }
          const f = this.findInRulesById(changeRuleId)
          let ruleId = f?.id
          if (f?.scope === 'Field') {
            if (useToAll) {
              let batchRule = this.findNodeRuleByType(f.accept)
              if (batchRule) {
                // 删除节点规则
                this.deleteRuleById(f.id)
                // 修改批量规则
                batchRule.result = {
                  dataType: newDataType,
                  tapType,
                  selectDataType,
                }
                ruleId = batchRule.id
              } else {
                // 修改规则为批量规则 scope、namespace
                f.scope = 'Node'
                f.namespace = [nodeId]
                f.result = { dataType: newDataType, tapType, selectDataType }
              }
            } else {
              // 修改字段规则
              f.result = { dataType: newDataType, tapType, selectDataType }
            }
            const index = this.rules.findIndex((t) => t.id === ruleId)
            this.rules.splice(index, 1)
            this.rules.push(f)
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
            this.rules.push(op)
          }

          this.data.fields.forEach((t) => {
            if (
              (useToAll && t.data_type === t.dataTypeTemp && t.dataTypeTemp === dataTypeTemp) ||
              t.field_name === fieldName
            ) {
              t.data_type = newDataType
              t.changeRuleId = ruleId
            }
          })
          this.handleUpdate()
          this.editBtnLoading = false
          this.$message.success(i18n.t('public_message_operation_success'))
          this.editDataTypeVisible = false
        })
        .catch(() => {
          this.editBtnLoading = false
        })
    },

    revoke(row) {
      if (this.getRevokeDisabled(row)) return
      const f = this.findInRulesById(row.changeRuleId)
      if (!f) return
      if (f.scope === 'Node') {
        return
      }
      if (f.scope === 'Field') {
        row.data_type = f.accept
        const index = this.rules.findIndex((t) => t.id === f.id)
        this.rules.splice(index, 1)
      }
      row.data_type = row.dataTypeTemp
      this.handleUpdate()
    },

    revokeAll() {
      if (this.revokeTableDisabled) {
        return
      }
      this.$confirm(i18n.t('packages_form_field_inference_list_ninquerenyaohui'), '', {
        type: 'warning',
        closeOnClickModal: false,
      }).then((resFlag) => {
        if (resFlag) {
          const { qualified_name } = this.data
          if (this.singleTable) {
            this.rules = [] // 清空数据
            this.handleUpdate()
          } else {
            this.rules = this.rules.filter((t) => t.namespace?.[1] !== qualified_name) // 清空当前表的数据
            this.handleUpdate()
          }
          this.$message.success(i18n.t('public_message_operation_success'))
        }
      })
    },

    doLayout() {
      this.$refs.table.doLayout()
    },

    getRevokeDisabled(row) {
      return !this.fieldChangeRules.find((t) => t.id === row.changeRuleId)?.scope
    },

    getFieldScope(row = {}) {
      return this.fieldChangeRules.find((t) => t.id === row.changeRuleId)?.scope
    },

    getRevokeColorClass(row = {}) {
      const map = {
        Node: 'color-warning',
        Field: 'color-primary',
      }
      return map[this.getFieldScope(row)] || 'color-disable'
    },

    tableRowClassName({ row }) {
      return !this.ignoreError && row.matchedDataTypeLevel === 'error' ? 'warning-row' : ''
    },

    getCanUseDataTypesTooltip(matchedDataTypeLevel) {
      const map = {
        error:
          this.type === 'target'
            ? i18n.t('packages_dag_field_inference_list_gaiziduanshuju')
            : i18n.t('packages_dag_field_inference_list_gaiziduanwufa'),
        // warning: i18n.t('packages_dag_field_inference_list_gaiziduanyingshe')
      }
      return map[matchedDataTypeLevel]
    },

    querySearch(val, cb) {
      cb(
        this.currentData.canUseDataTypes?.map((t) => {
          return { value: t }
        }) || [],
      )
    },

    handleAutocomplete(itemValue) {
      if (!itemValue) {
        this.currentData.newDataType = this.currentData.dataTypeTemp
        return
      }
      const item = this.computedDataTypes.find((t) => t.value === itemValue)
      this.currentData.customInputData = {}

      /**
       * 1.选中选项后，检查选项是否有变量；有变量向下走
       * 2.把括号内字符串提取出来，并进行分割
       * 3.根据多个变量名（$开头的），获取输入框的范围；默认最小值
       * 4.每次修改输入框都会改变最终结果
       * */
      this.customInputDataValue = itemValue // 记录原始值
      this.currentData.selectDataType = itemValue
      const contentStr = item.value.match(/\(([^)]+)\)/)?.[1]
      if (contentStr) {
        const contentArr = contentStr.split(',')
        contentArr.forEach((el) => {
          const key = el.replace(/^\$/, '')
          console.log('key', key)
          this.currentData.customInputData[key] = {
            min: item.attrs[key]?.[0] ? item.attrs[key]?.[0] * 1 : undefined,
            max: item.attrs[key]?.[1] ? item.attrs[key]?.[1] * 1 : undefined,
            label: this.customInputLabelMap[key] || key,
          }
          const defaultValue =
            item.attrs['default'] ??
            item.attrs['default' + key.charAt(0).toUpperCase() + key.slice(1)] ??
            item.attrs[key]?.[0] ??
            null
          this.currentData.customInputData[key].value = defaultValue ? defaultValue * 1 : null
        })
      }
      this.handleChangeCustomInput()
    },

    getDataType(row = {}) {
      // 这里不清楚为要返回 dataTypeTemp，不过 dataTypeTemp 可能为空，所以加上 || row.data_type
      if (!this.rules.length || !this.rules.find((t) => t.id === row.changeRuleId))
        return row.dataTypeTemp || row.data_type
      return row.data_type
    },

    async getTypeJson() {
      const dataTypes = this.dataTypesJson
      let result = []
      for (let key in dataTypes) {
        const item = dataTypes[key]
        result.push({
          label: key.replace(/[([]([^)]+)[)]]/, ''),
          value: key,
          attrs: item,
        })
      }
      return result
    },

    handleChangeCustomInput() {
      const { customInputData } = this.currentData
      this.currentData.newDataType = this.customInputDataValue
        .replace('[', '')
        .replace(']', '')
        .replace(/\$[^,]*\b/g, function (val) {
          return '' + customInputData[val.replace(/^\$/, '')]?.value || val
        })
    },
  },
  emits: ['update-rules'],
}
</script>

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

.custom-input,
.el-input-number {
  width: 240px;
}

.coefficient-input {
  width: 100px;
}

/*::v-deep {
  .el-dialog__body {
    padding-top: 24px;
    border-top: 1px solid #e5e6eb;
  }
}*/
</style>
