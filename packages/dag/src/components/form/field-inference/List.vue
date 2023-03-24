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
          >{{ scope.row.field_name }}
          <VIcon v-if="scope.row.primary_key_position > 0" size="12" class="text-warning ml-1">key</VIcon>
        </span>
      </template>
      <template slot="dataTypeHeader">
        <span class="pl-4">
          {{ $t('packages_dag_meta_table_field_type') }}
        </span>
      </template>
      <template slot="data_type" slot-scope="scope">
        <ElTooltip
          transition="tooltip-fade-in"
          :disabled="!scope.row.matchedDataTypeLevel"
          :content="getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel)"
          class="ml-n2 mr-1"
        >
          <VIcon size="16" class="color-warning" :class="{ 'opacity-0': !scope.row.matchedDataTypeLevel }"
            >warning</VIcon
          >
        </ElTooltip>
        <span v-if="readonly">{{ scope.row.data_type }}</span>
        <div v-else class="cursor-pointer inline-block" @click="openEditDataTypeVisible(scope.row)">
          <span>{{ scope.row.data_type }}</span>
          <VIcon class="ml-2">arrow-down</VIcon>
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
        <ElFormItem :label="$t('packages_form_field_inference_list_tuiyanchudelei')">
          <span>{{ currentData.dataType }}</span>
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
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

import { VTable } from '@tap/component'
import i18n from '@tap/i18n'
import { metadataInstancesApi } from '@tap/api'
import { uuid } from '@tap/shared'

export default {
  name: 'List',

  components: { VTable },

  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    },
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
    }
  },

  data() {
    return {
      columns: [
        {
          label: i18n.t('packages_form_field_mapping_list_xuhao'),
          type: 'index',
          prop: 'index',
          width: '60px'
        },
        {
          label: i18n.t('packages_form_field_add_del_index_ziduanmingcheng'),
          prop: 'field_name',
          slotName: 'field_name',
          'min-width': '90px'
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
          slotName: 'is_nullable'
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
        dataType: '',
        newDataType: '',
        selectDataType: '',
        useToAll: false,
        errorMessage: '',
        source: {},
        canUseDataTypes: []
      },
      editBtnLoading: false
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
      let list = (fields || []).map(t => {
        t.source = this.findInRulesById(t.changeRuleId) || {}
        t.accept = t.source?.accept || t.accept
        t.data_type = t.source?.result?.dataType || t.data_type
        return t
      })
      return this.showDelete ? list : list.filter(t => !t.is_deleted)
    },

    canRevokeRules() {
      const { qualified_name } = this.data
      return this.fieldChangeRules.filter(t => t.scope === 'Field' && t.namespace?.[1] === qualified_name) || []
    }
  },

  methods: {
    findInRulesById(id) {
      return this.fieldChangeRules.find(t => t.id === id)
    },

    findNodeRuleByType(type) {
      return this.fieldChangeRules.find(t => t.accept === type && t.scope === 'Node')
    },

    deleteRuleById(id) {
      const index = this.fieldChangeRules.findIndex(t => t.id === id)
      this.fieldChangeRules.splice(index, 1)
    },

    openEditDataTypeVisible(row) {
      const { source = {}, canUseDataTypes = [] } = row || {}
      this.currentData.changeRuleId = row.changeRuleId
      this.currentData.dataType = source?.accept || row.data_type
      this.currentData.fieldName = row.field_name
      this.currentData.newDataType = row.data_type
      this.currentData.useToAll = false
      this.currentData.errorMessage = ''
      this.currentData.source = source
      this.currentData.canUseDataTypes = canUseDataTypes
      const findRule = this.fieldChangeRules.find(t => t.id === this.currentData.changeRuleId)
      this.currentData.selectDataType = findRule?.result?.selectDataType || ''
      this.editDataTypeVisible = true
    },

    handleUpdate(data) {
      this.form?.setValuesIn?.('fieldChangeRules', data || this.fieldChangeRules)
      this.$emit('update:fieldChangeRules', data || this.fieldChangeRules)
    },

    submitEdit() {
      const { qualified_name, nodeId } = this.data
      const { changeRuleId, fieldName, dataType, newDataType, useToAll, selectDataType } = this.currentData
      const params = {
        databaseType: this.activeNode.databaseType,
        dataTypes: [newDataType]
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
          } else {
            const op = {
              id: uuid(),
              scope: useToAll ? 'Node' : 'Field',
              namespace: useToAll ? [nodeId] : [nodeId, qualified_name, fieldName],
              type: 'DataType',
              accept: dataType,
              result: { dataType: newDataType, tapType, selectDataType }
            }
            ruleId = op.id
            ruleAccept = dataType
            this.fieldChangeRules.push(op)
          }
          this.handleUpdate()
          this.data.fields.find(t => {
            if ((useToAll && t.data_type === ruleAccept) || t.field_name === fieldName) {
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
        const index = this.fieldChangeRules.findIndex(t => t.id === f.id)
        this.fieldChangeRules.splice(index, 1)
      }
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
          this.handleUpdate(
            this.fieldChangeRules.filter(t => !(t.scope === 'Field' && t.namespace?.[1] === qualified_name))
          )
          this.$message.success(i18n.t('public_message_operation_success'))
        }
      })
    },

    doLayout() {
      this.$refs.table.doLayout()
    },

    getRevokeDisabled(row) {
      return !row.source?.scope
    },

    getFieldScope(row = {}) {
      return row.source?.scope
    },

    getRevokeColorClass(row = {}) {
      const map = {
        Node: 'color-warning',
        Field: 'color-primary'
      }
      return map[this.getFieldScope(row)] || 'color-disable'
    },

    tableRowClassName({ row }) {
      return row.matchedDataTypeLevel === 'error' ? 'warning-row' : ''
    },

    getCanUseDataTypesTooltip(matchedDataTypeLevel) {
      let result = ''
      switch (matchedDataTypeLevel) {
        case 'error':
          result = i18n.t('packages_dag_field_inference_list_gaiziduanwufa')
          break
        case 'warning':
          result = i18n.t('packages_dag_field_inference_list_gaiziduanyingshe')
          break
        default:
          break
      }
      return result
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
</style>
