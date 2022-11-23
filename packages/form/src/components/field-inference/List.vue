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
    <el-dialog
      title="字段类型调整"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="editDataTypeVisible"
      width="35%"
    >
      <el-form ref="dataTypeForm" label-width="120px" label-position="left" :model="currentData" @submit.native.prevent>
        <el-form-item label="推演出的类型: ">
          <span>{{ currentData.dataType }}</span>
        </el-form-item>
        <el-form-item label="要调整为的类型: " prop="newDataType" required>
          <el-input v-model="currentData.newDataType" maxlength="100" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDataTypeVisible = false" size="mini">{{
          $t('packages_business_button_cancel')
        }}</el-button>
        <el-button @click="submitEdit" size="mini" type="primary" :loading="editBtnLoading">{{
          $t('packages_business_button_confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

import { VTable } from '@tap/component'
import i18n from '@tap/i18n'
import { metadataInstancesApi } from '@tap/api'

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
        dataType: '',
        newDataType: ''
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
      this.nodeRules = nodeRules
      this.fieldRules = fieldRules
    },

    openEditDataTypeVisible(row) {
      this.editDataTypeVisible = true
      this.currentData.dataType = row.data_type
      this.currentData.fieldName = row.field_name
      this.currentData.newDataType = row.data_type
    },

    submitEdit() {
      let { qualified_name, nodeId, taskId } = this.data
      let data = {
        taskId: taskId,
        nodeId: nodeId,
        sinkQualifiedName: qualified_name,
        fields: [
          {
            fieldName: this.currentData.fieldName,
            attributes: {
              DataType: this.currentData.newDataType
            }
          }
        ]
      }
      metadataInstancesApi.changeFields(data).then(() => {
        this.editDataTypeVisible = false
      })
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
