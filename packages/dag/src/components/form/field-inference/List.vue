<template>
  <div class="field-inference__list">
    <VTable
      :columns="columnsList"
      :data="tableList"
      :has-pagination="false"
      ref="table"
      height="100%"
      :key="!!canRevokeRules.length + ''"
      :row-class-name="tableRowClassName"
    >
      <template slot="field_name" slot-scope="scope">
        <span class="flex align-center"
          ><span class="ellipsis">{{ scope.row.field_name }}</span>
          <VIcon v-if="scope.row.primary_key_position > 0" size="12" class="text-warning ml-1">key</VIcon>
        </span>
      </template>
      <template slot="dataTypeHeader">
        <span class="pl-4">
          {{ $t('packages_dag_meta_table_field_type') }}
        </span>
      </template>
      <template slot="data_type" slot-scope="scope">
        <div
          class="position-relative"
          :class="{ 'pl-5': !ignoreError && !!getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel) }"
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
            <VIcon class="ml-2">arrow-down</VIcon>
          </div>
        </div>
      </template>
      <template slot="is_nullable" slot-scope="scope">
        {{ nullableMap[!scope.row.is_nullable] }}
      </template>
      <template slot="operationHeader">
        <VIcon :class="canRevokeRules.length ? 'color-primary' : 'color-disable'" @click="revokeAll()">revoke</VIcon>
      </template>
      <template slot="operation" slot-scope="scope">
        <ElTooltip
          :disabled="getFieldScope(scope.row) !== 'Node'"
          :content="$t('packages_form_field_inference_main_gepiliangxiugai')"
          placement="top"
        >
          <VIcon :class="getRevokeColorClass(scope.row)" @click="revoke(scope.row)">revoke</VIcon>
        </ElTooltip>
      </template>
    </VTable>
    <ElDialog
      :title="$t('packages_form_field_inference_list_ziduanleixingtiao')"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="editDataTypeVisible"
      width="35%"
    >
      <ElForm ref="dataTypeForm" label-width="140px" label-position="left" :model="currentData" @submit.native.prevent>
        <ElRadioGroup v-if="!!originType" v-model="modeType" class="mb-3">
          <ElRadio label="custom">{{ $t('packages_dag_field_inference_list_zidingyitiaozheng') }}</ElRadio>
          <ElRadio label="coefficient">{{ $t('packages_dag_field_inference_list_anxishutiaozheng') }}</ElRadio>
        </ElRadioGroup>
        <template v-if="modeType === 'custom'">
          <ElFormItem :label="$t('packages_form_field_inference_list_tuiyanchudelei')">
            <span>{{ currentData.dataTypeTemp }}</span>
          </ElFormItem>
          <ElFormItem
            :label="$t('packages_form_field_inference_list_yaotiaozhengweide')"
            prop="newDataType"
            :error="currentData.errorMessage"
            inline-message
            required
          >
            <ElAutocomplete
              class="inline-input"
              v-model="currentData.newDataType"
              :fetch-suggestions="querySearch"
              :placeholder="$t('public_input_placeholder')"
              @select="handleAutocomplete"
            ></ElAutocomplete>
          </ElFormItem>
          <div v-if="!hideBatch">
            <ElCheckbox v-model="currentData.useToAll">{{
              $t('packages_form_field_inference_list_duidangqiantuiyan')
            }}</ElCheckbox>
            <div v-show="currentData.useToAll" class="mt-2 color-danger fs-8">
              {{ $t('packages_form_field_inference_list_piliangyingyonghui') }}
            </div>
          </div>
        </template>
        <template v-else>
          <ElFormItem :label="$t('packages_form_field_inference_list_tuiyanchudelei')">
            <span>{{ originType + ' (n)' }}</span>
          </ElFormItem>
          <ElFormItem :label="$t('packages_dag_field_inference_list_anzhaoxishu')">
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
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="editDataTypeVisible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton
          size="mini"
          type="primary"
          :disabled="!currentData.newDataType"
          :loading="editBtnLoading"
          @click="submitEdit"
          >{{ $t('public_button_confirm') }}</ElButton
        >
      </span>
    </ElDialog>
  </div>
</template>

<script>
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
          fields: []
        }
      }
    },
    showColumns: {
      type: Array,
      default: () => []
    },
    showDelete: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    fieldChangeRules: {
      type: Array,
      default: () => []
    },
    hideBatch: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'target'
    },
    ignoreError: Boolean
  },

  data() {
    return {
      columns: [
        {
          label: i18n.t('packages_form_field_mapping_list_xuhao'),
          type: 'index',
          prop: 'index',
          minWidth: '40px'
        },
        {
          label: i18n.t('packages_form_field_add_del_index_ziduanmingcheng'),
          prop: 'field_name',
          slotName: 'field_name',
          'min-width': '90px',
          'show-overflow-tooltip': true
        },
        {
          label: i18n.t('packages_form_dag_dialog_field_mapping_type'),
          prop: 'data_type',
          slotName: 'data_type',
          'min-width': '126px'
        },
        {
          label: i18n.t('packages_form_field_inference_list_feikong'),
          prop: 'is_nullable',
          slotName: 'is_nullable',
          width: '60px'
        },
        {
          label: i18n.t('packages_form_field_inference_list_ziduanzhushi'),
          prop: 'comment'
        },
        {
          label: i18n.t('public_operation'),
          prop: 'operation',
          slotName: 'operation',
          headerSlot: 'operationHeader',
          width: '60px'
        }
      ],
      nullableMap: {
        true: i18n.t('packages_dag_meta_table_true'),
        false: i18n.t('packages_dag_meta_table_false')
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
        coefficient: 1
      },
      editBtnLoading: false,
      rules: [],
      modeType: 'custom',
      originType: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'stateIsReadonly']),

    columnsList() {
      const { showColumns, columns, readonly } = this
      let result = columns
      if (readonly) {
        result = result.filter(t => t.prop !== 'operation')
      }
      if (!showColumns.length) {
        return result
      }
      return showColumns
        .map(t => {
          return result.find(f => f.prop === t)
        })
        .filter(t => t)
    },

    tableList() {
      const { fields } = this.data
      let list = fields || []
      return this.showDelete ? list : list.filter(t => !t.is_deleted)
    },

    canRevokeRules() {
      const { qualified_name } = this.data
      return this.rules.filter(t => t.scope === 'Field' && t.namespace?.[1] === qualified_name) || []
    }
  },

  mounted() {
    this.setRules(this.fieldChangeRules)
  },

  methods: {
    setRules(data = []) {
      this.rules = cloneDeep(data)
    },

    findInRulesById(id) {
      return this.rules.find(t => t.id === id)
    },

    findNodeRuleByType(type) {
      return this.rules.find(t => t.accept === type && t.scope === 'Node')
    },

    deleteRuleById(id) {
      const index = this.rules.findIndex(t => t.id === id)
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
      this.currentData.canUseDataTypes = canUseDataTypes
      const findRule = this.rules.find(t => t.id === this.currentData.changeRuleId)
      this.currentData.selectDataType = findRule?.result?.selectDataType || ''
      this.currentData.coefficient = findRule?.multiple || 1

      const dataTypeCheckMultiple = await metadataInstancesApi.dataTypeCheckMultiple({
        databaseType: this.activeNode.databaseType,
        dataType: this.currentData.dataType
      })

      let modeType = 'custom'
      if (dataTypeCheckMultiple?.result) {
        this.originType = dataTypeCheckMultiple.originType
        this.fieldChangeRules.forEach((item = {}) => {
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
      } else {
        this.originType = ''
      }

      this.modeType = modeType
      this.editDataTypeVisible = true
    },

    handleUpdate(data) {
      this.$emit('update-rules', cloneDeep(data || this.rules))
    },

    submitEdit() {
      const { qualified_name, nodeId } = this.data
      const { changeRuleId, fieldName, dataType, dataTypeTemp, newDataType, useToAll, selectDataType, coefficient } =
        this.currentData
      const params = {
        databaseType: this.activeNode.databaseType,
        dataTypes: [newDataType]
      }

      if (this.modeType === 'coefficient') {
        const f = this.findInRulesById(changeRuleId)
        let ruleId = f?.id
        let ruleAccept = f?.accept
        if (f) {
          f.multiple = coefficient
          f.accept = this.originType
          f.result = { dataType: `${this.originType}(${coefficient}n)`, dataTypeTemp }
          const index = this.rules.findIndex(t => t.id === ruleId)
          this.rules.splice(index, 1)
          this.rules.push(f)
        } else {
          const op = {
            id: uuid(),
            scope: 'Node',
            namespace: [nodeId],
            type: 'MutiDataType',
            accept: this.originType,
            multiple: coefficient,
            result: { dataType: `${this.originType}(${coefficient}n)`, dataTypeTemp }
          }
          ruleId = op.id
          ruleAccept = op.accept
          this.rules.push(op)
        }

        this.handleUpdate()
        this.data.fields.find(t => {
          if (t.dataTypeTemp === ruleAccept) {
            t.changeRuleId = ruleId
          }
        })
        this.$message.success(i18n.t('public_message_operation_success'))
        this.editDataTypeVisible = false
        return
      }

      this.editBtnLoading = true
      this.currentData.errorMessage = ''
      metadataInstancesApi
        .dataType2TapType(params)
        .then(data => {
          const val = data[newDataType]
          const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
          if (!tapType) {
            this.currentData.errorMessage = i18n.t('packages_form_field_inference_list_geshicuowu')
            this.editBtnLoading = false
            return
          }
          const f = this.findInRulesById(changeRuleId)
          let ruleId = f?.id
          let ruleAccept = f?.accept
          if (f?.scope === 'Field') {
            if (useToAll) {
              let batchRule = this.findNodeRuleByType(f.accept)
              if (batchRule) {
                // 删除节点规则
                this.deleteRuleById(f.id)
                // 修改批量规则
                batchRule.result = { dataType: newDataType, tapType, selectDataType }
                ruleId = batchRule.id
                ruleAccept = newDataType
              } else {
                // 修改规则为批量规则 scope、namespace
                f.scope = 'Node'
                f.namespace = [nodeId]
                f.result = { dataType: newDataType, tapType, selectDataType }
                ruleAccept = newDataType
              }
            } else {
              // 修改字段规则
              f.result = { dataType: newDataType, tapType, selectDataType }
              ruleAccept = newDataType
            }
            const index = this.rules.findIndex(t => t.id === ruleId)
            this.rules.splice(index, 1)
            this.rules.push(f)
          } else {
            const op = {
              id: uuid(),
              scope: useToAll ? 'Node' : 'Field',
              namespace: useToAll ? [nodeId] : [nodeId, qualified_name, fieldName],
              type: 'DataType',
              accept: dataTypeTemp,
              result: { dataType: newDataType, tapType, selectDataType }
            }
            ruleId = op.id
            ruleAccept = dataTypeTemp
            this.rules.push(op)
          }
          this.handleUpdate()
          this.data.fields.find(t => {
            if ((useToAll && t.dataTypeTemp === ruleAccept) || t.field_name === fieldName) {
              t.changeRuleId = ruleId
            }
          })
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
        const index = this.rules.findIndex(t => t.id === f.id)
        this.rules.splice(index, 1)
      }
      row.data_type = row.dataTypeTemp
      this.handleUpdate()
    },

    revokeAll() {
      if (!this.canRevokeRules.length) {
        return
      }
      this.$confirm(i18n.t('packages_form_field_inference_list_ninquerenyaohui'), '', {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          const { qualified_name } = this.data
          this.handleUpdate(this.rules.filter(t => !(t.scope === 'Field' && t.namespace?.[1] === qualified_name)))
          this.$message.success(i18n.t('public_message_operation_success'))
        }
      })
    },

    doLayout() {
      this.$refs.table.doLayout()
    },

    getRevokeDisabled(row) {
      return !this.fieldChangeRules.find(t => t.id === row.changeRuleId)?.scope
    },

    getFieldScope(row = {}) {
      return this.fieldChangeRules.find(t => t.id === row.changeRuleId)?.scope
    },

    getRevokeColorClass(row = {}) {
      const map = {
        Node: 'color-warning',
        Field: 'color-primary'
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
            : i18n.t('packages_dag_field_inference_list_gaiziduanwufa')
        // warning: i18n.t('packages_dag_field_inference_list_gaiziduanyingshe')
      }
      return map[matchedDataTypeLevel]
    },

    querySearch(val, cb) {
      cb(
        this.currentData.canUseDataTypes?.map(t => {
          return { value: t }
        }) || []
      )
    },

    handleAutocomplete(item) {
      this.currentData.selectDataType = item.value
    },

    getDataType(row = {}) {
      if (!this.fieldChangeRules.length) return row.dataTypeTemp
      return row.data_type
    }
  }
}
</script>

<style lang="scss" scoped>
.field-inference__list {
  height: 100%;
  ::v-deep {
    .warning-row {
      background: rgb(254, 229, 216);
      &:hover {
        > td.el-table__cell {
          background: rgb(254, 229, 216);
        }
      }
    }
  }
}

.type-warning {
  top: 3px;
  left: 0;
}

.coefficient-input {
  width: 100px;
}
</style>
