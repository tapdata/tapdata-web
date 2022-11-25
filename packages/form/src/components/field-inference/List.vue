<template>
  <div class="field-inference__list">
    <VTable
      :columns="columnsList"
      :data="tableList"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      ref="table"
      height="100%"
      hide-on-single-page
      stripe
      :key="!!canRevokeRules.length + ''"
    >
      <template slot="field_name" slot-scope="scope">
        <span class="flex align-center"
          >{{ scope.row.field_name }}
          <VIcon v-if="scope.row.primary_key_position > 0" size="12" class="text-warning ml-1">key</VIcon>
        </span>
      </template>
      <template slot="data_type" slot-scope="scope">
        <span v-if="readonly">{{ scope.row.data_type }}</span>
        <div v-else class="cursor-pointer" @click="openEditDataTypeVisible(scope.row)">
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
        <VIcon :class="getRevokeColorClass(scope.row)" @click="revoke(scope.row)">revoke</VIcon>
      </template>
    </VTable>
    <ElDialog
      :title="$t('packages_form_field_inference_list_ziduanleixingtiao')"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="editDataTypeVisible"
      width="35%"
    >
      <ElForm ref="dataTypeForm" label-width="120px" label-position="left" :model="currentData" @submit.native.prevent>
        <ElFormItem :label="$t('packages_form_field_inference_list_tuiyanchudelei')">
          <span>{{ currentData.dataType }}</span>
        </ElFormItem>
        <ElFormItem :label="$t('packages_form_field_inference_list_yaotiaozhengweide')" prop="newDataType" required>
          <ElInput v-model="currentData.newDataType" maxlength="100" show-word-limit></ElInput>
        </ElFormItem>
        <!--        <div v-if="currentData.source" class="mb-3">-->
        <!--          <ElCheckbox v-model="currentData.deleteFindOne">已存在批量规则，勾选删除</ElCheckbox>-->
        <!--          <div :class="{ 'text-decoration-line-through color-danger': currentData.deleteFindOne }">-->
        <!--            源类型：{{ currentData.source.accept }}，目标类型：{{ currentData.source.result.dataType }}-->
        <!--          </div>-->
        <!--        </div>-->
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
        <ElButton size="mini" @click="editDataTypeVisible = false">{{
          $t('packages_business_button_cancel')
        }}</ElButton>
        <ElButton size="mini" type="primary" :loading="editBtnLoading" @click="submitEdit">{{
          $t('packages_business_button_confirm')
        }}</ElButton>
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
          prop: 'index'
        },
        {
          label: i18n.t('packages_form_field_add_del_index_ziduanmingcheng'),
          prop: 'field_name',
          slotName: 'field_name'
        },
        {
          label: i18n.t('packages_form_dag_dialog_field_mapping_type'),
          prop: 'data_type',
          slotName: 'data_type',
          'min-width': '160px'
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
          label: i18n.t('packages_form_field_processor_index_caozuo'),
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
        useToAll: false,
        deleteFindOne: false,
        source: {}
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
      const source = row.source || {}
      this.currentData.changeRuleId = row.changeRuleId
      this.currentData.dataType = source?.accept || row.data_type
      this.currentData.fieldName = row.field_name
      this.currentData.newDataType = row.data_type
      this.currentData.useToAll = false
      this.currentData.source = source
      this.editDataTypeVisible = true
    },

    handleUpdate(data) {
      this.form.setValuesIn('fieldChangeRules', data || this.fieldChangeRules)
      this.$emit('update:fieldChangeRules', data || this.fieldChangeRules)
    },

    submitEdit() {
      const { qualified_name, nodeId } = this.data
      const { changeRuleId, fieldName, dataType, newDataType, useToAll } = this.currentData
      const params = {
        databaseType: this.activeNode.databaseType,
        dataTypes: [newDataType]
      }
      this.editBtnLoading = true
      metadataInstancesApi
        .dataType2TapType(params)
        .then(data => {
          const val = data[newDataType]
          const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
          if (!tapType) {
            this.$message.error(i18n.t('packages_form_field_inference_list_geshicuowu'))
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
                batchRule.result = { dataType: newDataType, tapType }
                ruleId = batchRule.id
                ruleAccept = newDataType
              } else {
                // 修改规则为批量规则 scope、namespace
                f.scope = 'Node'
                f.namespace = [nodeId]
                f.result = { dataType: newDataType, tapType }
                ruleAccept = newDataType
              }
            } else {
              // 修改字段规则
              f.result = { dataType: newDataType, tapType }
              ruleAccept = newDataType
            }
          } else if (f?.scope === 'Node') {
            if (useToAll) {
              // 修改批量规则
              f.result = { dataType: newDataType, tapType }
              ruleAccept = newDataType
            } else {
              // 添加字段规则
              const op = {
                id: uuid(),
                scope: 'Field',
                namespace: [nodeId, qualified_name, fieldName],
                type: 'DataType',
                accept: f.accept,
                result: { dataType: newDataType, tapType }
              }
              ruleId = op.id
              this.fieldChangeRules.push(op)
            }
          } else {
            const op = {
              id: uuid(),
              scope: useToAll ? 'Node' : 'Field',
              namespace: useToAll ? [nodeId] : [nodeId, qualified_name, fieldName],
              type: 'DataType',
              accept: dataType,
              result: { dataType: newDataType, tapType }
            }
            ruleId = op.id
            ruleAccept = dataType
            this.fieldChangeRules.push(op)
          }
          this.handleUpdate()
          this.data.fields.find(t => {
            if ((useToAll && t.data_type === ruleAccept) || t.field_name === fieldName) {
              t.changeRuleId = ruleId
              t.source.scope = useToAll ? 'Node' : 'Field'
            }
          })
          this.editBtnLoading = false
          this.$message.success(i18n.t('packages_form_field_inference_list_caozuochenggong'))
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
        this.$message.error(i18n.t('packages_form_field_inference_list_qingxiugaizhengzai'))
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
      this.$confirm('您确认要恢复当前表吗？', '', {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          const { qualified_name } = this.data
          this.handleUpdate(
            this.fieldChangeRules.filter(t => !(t.scope === 'Field' && t.namespace?.[1] === qualified_name))
          )
          this.$message.success('操作成功')
        }
      })
    },

    doLayout() {
      this.$refs.table.doLayout()
    },

    getRevokeDisabled(row) {
      return !row.source?.scope
    },

    getRevokeColorClass(row = {}) {
      const map = {
        Node: 'color-warning',
        Field: 'color-primary'
      }
      return map[row.source?.scope] || 'color-disable'
    }
  }
}
</script>

<style lang="scss" scoped>
.field-inference__list {
  height: 100%;
}
</style>
