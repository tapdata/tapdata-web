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
        <VIcon @click="revokeAll()">revoke</VIcon>
      </template>
      <template slot="operation" slot-scope="scope">
        <VIcon :class="getRevokeColorClass(scope.row)" @click="revoke(scope.row)">revoke</VIcon>
      </template>
    </VTable>
    <ElDialog
      title="字段类型调整"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="editDataTypeVisible"
      width="35%"
    >
      <ElForm ref="dataTypeForm" label-width="120px" label-position="left" :model="currentData" @submit.native.prevent>
        <ElFormItem label="推演出的类型: ">
          <span>{{ currentData.dataType }}</span>
        </ElFormItem>
        <ElFormItem label="要调整为的类型: " prop="newDataType" required>
          <ElInput v-model="currentData.newDataType" maxlength="100" show-word-limit></ElInput>
        </ElFormItem>
        <!--        <div v-if="currentData.source" class="mb-3">-->
        <!--          <ElCheckbox v-model="currentData.deleteFindOne">已存在批量规则，勾选删除</ElCheckbox>-->
        <!--          <div :class="{ 'text-decoration-line-through color-danger': currentData.deleteFindOne }">-->
        <!--            源类型：{{ currentData.source.accept }}，目标类型：{{ currentData.source.result.dataType }}-->
        <!--          </div>-->
        <!--        </div>-->
        <div>
          <ElCheckbox v-model="currentData.useToAll">对当前推演类型进行批量调整</ElCheckbox>
          <div v-show="currentData.useToAll" class="mt-2 color-danger fs-8">批量应用会覆盖已有批量应用规则</div>
        </div>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="editDataTypeVisible = false">{{
          $t('packages_business_button_cancel')
        }}</ElButton>
        <ElButton
          size="mini"
          type="primary"
          :disabled="currentData.dataType === currentData.newDataType"
          :loading="editBtnLoading"
          @click="submitEdit"
          >{{ $t('packages_business_button_confirm') }}</ElButton
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
    }
  },

  data() {
    return {
      columns: [
        {
          label: '序号',
          type: 'index',
          prop: 'index'
        },
        {
          label: '字段名称',
          prop: 'field_name',
          slotName: 'field_name'
        },
        {
          label: '字段类型',
          prop: 'data_type',
          slotName: 'data_type',
          'min-width': '160px'
        },
        {
          label: '非空',
          prop: 'is_nullable',
          slotName: 'is_nullable'
        },
        {
          label: '字段注释',
          prop: 'comment'
        },
        {
          label: '操作',
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
        source: null
      },
      editBtnLoading: false,
      fieldChangeRules: {}
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
      return showColumns.map(t => {
        return result.find(f => f.prop === t)
      })
    },

    tableList() {
      const { fields } = this.data
      let list = (fields || []).map(t => {
        t.source = this.findInRules(t.changeRuleId)
        if (t.source) {
          t.accept = t.source.accept
          t.data_type = t.source.result.dataType
        }
        return t
      })
      return this.showDelete ? list : list.filter(t => !t.is_deleted)
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    loadData() {
      this.fieldChangeRules = this.form.getValuesIn('fieldChangeRules') || []
    },

    findInRules(id) {
      return this.fieldChangeRules.find(t => t.id === id)
    },

    openEditDataTypeVisible(row) {
      const source = row.source
      this.currentData.changeRuleId = row.changeRuleId
      this.currentData.dataType = source?.accept || row.data_type
      this.currentData.fieldName = row.field_name
      this.currentData.newDataType = row.data_type
      this.currentData.source = source
      this.editDataTypeVisible = true
    },

    handleUpdate() {
      const { fieldChangeRules } = this
      this.form.setValuesIn('fieldChangeRules', JSON.parse(JSON.stringify(fieldChangeRules)))
    },

    submitEdit() {
      const { qualified_name, nodeId } = this.data
      const { changeRuleId, fieldName, dataType, newDataType, useToAll } = this.currentData
      const params = {
        databaseType: this.activeNode.databaseType,
        dataTypes: [newDataType]
      }
      metadataInstancesApi.dataType2TapType(params).then(data => {
        const val = data[newDataType]
        const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
        if (!tapType) {
          this.$message.error('格式错误')
          return
        }
        const id = uuid(fieldName)
        const f = this.findInRules(changeRuleId)
        if (f?.scope === 'Field') {
          // delete this.this.fieldChangeRules[f.id]
        } else if (f?.scope === 'Node') {
          // 已存在批量规则，需要先删除
        }
        const op = {
          id,
          scope: useToAll ? 'Node' : 'Field',
          namespace: useToAll ? [nodeId] : [nodeId, qualified_name, fieldName],
          type: 'DataType',
          accept: dataType,
          result: { dataType: newDataType, tapType }
        }
        let dataFind = this.data.fields.find(t => t.field_name === fieldName)
        dataFind.changeRuleId = id
        this.fieldChangeRules.push(op)
        this.currentData.source = op
        this.handleUpdate()
        this.$message.success('操作成功')
        this.editDataTypeVisible = false
      })
    },

    revoke(row) {
      if (this.getRevokeDisabled(row)) return
      const f = this.findInRules(row.changeRuleId)
      if (!f) return
      if (f.scope === 'Node') {
        this.$message.error('请修改正在生效的批量规则')
        return
      }
      if (f.scope === 'Field') {
        const index = this.fieldChangeRules.findIndex(t => t.id === f.id)
        this.fieldChangeRules.splice(index, 1)
      }
      this.handleUpdate()
    },

    revokeAll() {},

    doLayout() {
      this.$refs.table.doLayout()
    },

    getRevokeDisabled(row) {
      return !row.source
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
