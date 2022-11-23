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
        <VIcon class="mr-4" @click="revoke()">revoke</VIcon>
      </template>
      <template slot="operation" slot-scope="scope">
        <VIcon class="mr-4" @click="revoke(scope.row.field_name)">revoke</VIcon>
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
        <div v-if="currentData.findOne" class="mb-3">
          <ElCheckbox v-model="currentData.deleteFindOne">已存在批量规则，勾选删除</ElCheckbox>
          <div :class="{ 'text-decoration-line-through color-danger': currentData.deleteFindOne }">
            源类型：{{ currentData.findOne.accept }}，目标类型：{{ currentData.findOne.result.dataType }}
          </div>
        </div>
        <div>
          <ElCheckbox v-model="currentData.useToAll">对当前推演类型进行批量调整</ElCheckbox>
          <div v-show="currentData.useToAll" class="mt-2 color-danger fs-8">勾选，将会覆盖“批量规则”</div>
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
import { isEmpty } from '@tap/shared'

export default {
  name: 'List',

  components: { VTable },

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
        fieldName: '',
        dataType: '',
        newDataType: '',
        useToAll: false,
        deleteFindOne: false,
        findOne: null
      },
      editBtnLoading: false,
      nodeRules: [],
      fieldRules: {}
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion']),

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
      const list = this.data?.fields || []
      return this.showDelete ? list : list.filter(t => !t.is_deleted)
    }
  },

  methods: {
    loadData() {
      const { nodeRules = [], fieldRules = {} } = this.activeNode?.fieldChangeRules || {}
      if (isEmpty(this.fieldRules)) {
        this.fieldRules = fieldRules
      }
      this.nodeRules = nodeRules
    },

    openEditDataTypeVisible(row) {
      this.editDataTypeVisible = true
      this.currentData.dataType = row.data_type
      this.currentData.fieldName = row.field_name
      this.currentData.newDataType = row.data_type
      let findOne = this.nodeRules.find(t => t.accept === this.currentData.dataType)
      if (findOne) {
        this.currentData.findOne = findOne
      }
    },

    submitEdit() {
      console.log('123', this.currentData, this.fieldRules, this.data)
      console.log('this.activeNode', this.activeNode)
      const { qualified_name, nodeId } = this.data
      const { fieldName, dataType, newDataType, useToAll } = this.currentData
      if (!this.fieldRules[qualified_name]) {
        this.fieldRules[qualified_name] = {}
      }
      const params = {
        databaseType: this.activeNode.databaseType,
        dataTypes: [newDataType]
      }
      metadataInstancesApi
        .dataType2TapType(params)
        .then(data => {
          console.log('api', data)
          const val = data[newDataType]
          const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
          if (!tapType) {
            this.$message.error('格式错误')
            return
          }
          this.fieldRules[qualified_name][fieldName] = {
            scope: 'Field',
            namespace: [nodeId, qualified_name, fieldName],
            type: 'DataType',
            accept: dataType,
            result: { dataType: newDataType, tapType }
          }
          if (useToAll) {
            let findOne = this.nodeRules.find(t => t.accept === dataType)
            findOne.result = this.fieldRules[qualified_name][fieldName].result
          }
          console.log('保存', this.fieldRules, this.nodeRules)
          this.editDataTypeVisible = false
        })
        .catch(() => {
          const data = {}
          const val = data[newDataType]
          const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
          if (!tapType) {
            this.$message.error('格式错误')
            return
          }
          this.fieldRules[qualified_name][fieldName] = {
            scope: 'Field',
            namespace: [nodeId, qualified_name, fieldName],
            type: 'DataType',
            accept: dataType,
            result: { dataType: newDataType, tapType }
          }
          if (useToAll) {
            let findOne = this.nodeRules.find(t => t.accept === dataType)
            findOne.result = this.fieldRules[qualified_name][fieldName].result
          }
          console.log('保存', this.fieldRules, this.nodeRules)
          this.editDataTypeVisible = false
        })
      const data = {}
      const val = data[newDataType]
      const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
      // if (!tapType) {
      //   this.$message.error('格式错误')
      //   return
      // }
      this.fieldRules[qualified_name][fieldName] = {
        scope: 'Field',
        namespace: [nodeId, qualified_name, fieldName],
        type: 'DataType',
        accept: dataType,
        result: { dataType: newDataType, tapType }
      }
      if (useToAll) {
        let findOne = this.nodeRules.find(t => t.accept === dataType)
        if (findOne) {
          findOne.result = this.fieldRules[qualified_name][fieldName].result
        } else {
          this.nodeRules.push({
            scope: 'Node',
            namespace: [this.activeNode?.id],
            type: 'DataType',
            accept: dataType,
            result: this.fieldRules[qualified_name][fieldName].result
          })
        }
      }
      console.log('保存', this.fieldRules, this.nodeRules)
      this.editDataTypeVisible = false
      // this.fieldRules[qualified_name][fieldName] = {
      //   scope: 'Field',
      //   namespace: [nodeId, qualified_name, fieldName],
      //   type: 'DataType',
      //   accept: dataType,
      //   result: newDataType
      // }
      // if (useToAll) {
      //   let findOne = this.nodeRules.find(t => t.accept === dataType)
      // }
      // console.log('保存', this.fieldRules)
      // this.editDataTypeVisible = false
      // let { qualified_name, nodeId, taskId } = this.data
      // let data = {
      //   taskId: taskId,
      //   nodeId: nodeId,
      //   sinkQualifiedName: qualified_name,
      //   fields: [
      //     {
      //       fieldName: this.currentData.fieldName,
      //       attributes: {
      //         DataType: this.currentData.newDataType
      //       }
      //     }
      //   ]
      // }
      // metadataInstancesApi.changeFields(data).then(() => {
      //   this.editDataTypeVisible = false
      // })
    },

    revoke() {
      console.log('revoke')
    },

    doLayout() {
      this.$refs.table.doLayout()
    }
  }
}
</script>

<style lang="scss" scoped>
.field-inference__list {
  height: 100%;
}
</style>
