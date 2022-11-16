<template>
  <div class="metadata-list-wrap">
    <!--<div class="total mb-2 mt-4">
      {{ $t('packages_dag_components_metapane_gongyou') }}{{ tableData.length
      }}{{ $t('packages_dag_components_metapane_geziduan') }}
    </div>-->
    <ElTable ref="table" v-loading="showLoading" :data="tableData" stripe style="width: 100%" height="100%">
      <ElTableColumn width="56" type="index" :label="$t('packages_dag_meta_table_index')"> </ElTableColumn>
      <ElTableColumn prop="field_name" :label="$t('packages_dag_meta_table_field_name')">
        <template #default="{ row }">
          <span class="flex align-center"
            >{{ row.field_name }}
            <VIcon v-if="row.primary_key_position > 0" size="12" class="text-warning ml-1">key</VIcon>
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="data_type" :label="$t('packages_dag_meta_table_field_type')">
        <template #default="{ row }">
          <span>{{ row.data_type }}</span>
          <VIcon class="ml-2" @click="openEditDataTypeVisible(row)">arrow-down</VIcon>
        </template>
      </ElTableColumn>
      <!--      <ElTableColumn prop="scale" :label="$t('packages_dag_meta_table_scale')"> </ElTableColumn>-->
      <!--      <ElTableColumn prop="precision" :label="$t('packages_dag_meta_table_precision')"> </ElTableColumn>-->
      <ElTableColumn prop="default_value" :label="$t('packages_dag_meta_table_default')"> </ElTableColumn>
      <ElTableColumn prop="is_nullable" :label="$t('packages_dag_meta_table_not_null')">
        <template #default="{ row }">
          {{ nullableMap[!row.is_nullable] }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="comment" :label="$t('packages_dag_meta_table_comment')"> </ElTableColumn>
    </ElTable>
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
        <el-button @click="handelClose" size="mini">{{ $t('packages_business_button_cancel') }}</el-button>
        <el-button @click="submitEdit()" size="mini" type="primary" :loading="editBtnLoading">{{
          $t('packages_business_button_confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { metadataInstancesApi } from '@tap/api'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'

export default {
  name: 'MetaPane',
  components: { VIcon },
  props: {
    isShow: Boolean
  },

  data() {
    return {
      tableData: [],
      loading: false,
      isTarget: false,
      showFieldMapping: false,
      transform: {
        showBtn: true,
        mode: 'metaData',
        nodeId: '',
        field_process: [],
        fieldsNameTransform: '',
        batchOperationList: []
      },
      nullableMap: {
        true: i18n.t('packages_dag_meta_table_true'),
        false: i18n.t('packages_dag_meta_table_false')
      },
      editDataTypeVisible: false,
      currentData: {
        dataType: '',
        newDataType: ''
      },
      editBtnLoading: false
    }
  },

  computed: {
    ...mapState('dataflow', ['activeNodeId', 'taskSaving', 'stateIsDirty', 'transformLoading']),
    ...mapGetters('dataflow', ['activeNode']),

    showLoading() {
      return this.loading
    }
  },

  watch: {
    activeNodeId() {
      this.unwatchTaskSaving?.()
      if (this.isShow) {
        if (this.taskSaving) {
          this.loading = true
          // 防止新增节点立刻展示元数据时，task自动保存中，出现的空指针以及空数据
          this.unwatchTaskSaving = this.$watch('taskSaving', () => {
            this.loadFields()
            this.unwatchTaskSaving()
          })
        } else {
          this.loadFields()
        }
      }
    },
    // 推演加载完成后，主动请求最新模型
    transformLoading(v) {
      if (!v && this.isShow) {
        this.loadFields()
      }
    },

    isShow(v) {
      if (v) {
        this.loadFields()
      }
    }
  },
  mounted() {
    if (this.stateIsReadonly) {
      this.transform.mode = 'readOnly'
    }
  },

  methods: {
    async loadFields() {
      this.$refs.table.doLayout()
      this.loading = true

      try {
        let data = await metadataInstancesApi.nodeSchema(this.activeNode.id)
        let fields = data?.[0]?.fields || []
        fields = fields.filter(f => !f.is_deleted)
        /*fields.sort((a, b) => {
          const aIsPrimaryKey = a.primary_key_position > 0
          const bIsPrimaryKey = b.primary_key_position > 0

          if (aIsPrimaryKey !== bIsPrimaryKey) {
            return aIsPrimaryKey ? -1 : 1
          } else {
            return a.field_name.localeCompare(b.field_name)
          }
        })*/
        this.tableData = fields
      } catch (e) {
        this.tableData = []
      }

      this.loading = false
    },
    getDataflowDataToSave() {
      const dag = this.$store.getters['dataflow/dag']
      const editVersion = this.$store.state.dataflow.editVersion
      let dataflow = this.$store.state.dataflow
      return {
        dag,
        editVersion,
        ...dataflow
      }
    },
    getDataFlow() {
      const data = this.getDataflowDataToSave()
      return data
    },
    //打开字段编辑调整dialog
    openEditDataTypeVisible(row) {
      this.editDataTypeVisible = true
      this.currentData.dataType = row.data_type
      this.currentData.newDataType = row.data_type
    },
    handelClose() {
      this.editDataTypeVisible = false
    },
    submitEdit() {
      this.editDataTypeVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.metadata-list-wrap {
  height: 100%;
  overflow: auto;
  .total {
    margin-left: 10px;
    color: map-get($color, info);
  }
}
</style>
