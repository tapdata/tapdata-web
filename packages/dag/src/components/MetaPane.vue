<template>
  <div class="metadata-list-wrap">
    <FieldMapping
      v-if="isTarget && showFieldMapping"
      ref="fieldMapping"
      class="flex justify-content-end mr-5 mt-3"
      :transform="transform"
      :getDataFlow="getDataFlow"
      @returnPreFixSuffix="loadFields"
    ></FieldMapping>
    <div class="total mb-2 mt-4">共有 {{ tableData.length }} 个字段</div>
    <ElTable ref="table" v-loading="showLoading" :data="tableData" stripe style="width: 100%" height="100%">
      <ElTableColumn width="56" type="index" :label="t('meta_table_index')"> </ElTableColumn>
      <ElTableColumn prop="field_name" :label="t('meta_table_field_name')">
        <template #default="{ row }">
          <span class="flex align-center"
            >{{ row.field_name }}
            <VIcon v-if="row.primary_key_position > 0" size="12" class="text-warning ml-1">key</VIcon>
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="data_type" :label="t('meta_table_field_type')"> </ElTableColumn>
      <!--      <ElTableColumn prop="scale" :label="t('meta_table_scale')"> </ElTableColumn>-->
      <!--      <ElTableColumn prop="precision" :label="t('meta_table_precision')"> </ElTableColumn>-->
      <ElTableColumn prop="default_value" :label="t('meta_table_default')"> </ElTableColumn>
      <ElTableColumn prop="is_nullable" :label="t('meta_table_not_null')">
        <template #default="{ row }">
          {{ t(`meta_table_${!row.is_nullable ? 'true' : 'false'}`) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="comment" :label="t('meta_table_comment')"> </ElTableColumn>
    </ElTable>
  </div>
</template>

<script>
import { metadataInstancesApi } from '@tap/api'
import { FieldMapping } from '@tap/field-mapping'
import { mapGetters, mapState } from 'vuex'
import VIcon from 'web-core/components/VIcon'
import Locale from '../mixins/locale'

export default {
  name: 'MetaPane',
  components: { VIcon, FieldMapping },
  mixins: [Locale],
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
      }
    }
  },

  computed: {
    ...mapState('dataflow', ['activeNodeId', 'transformStatus', 'stateIsDirty']),
    ...mapGetters('dataflow', ['activeNode']),

    showLoading() {
      return this.loading || this.transformStatus === 'loading'
    }
  },

  watch: {
    activeNodeId() {
      this.isShow && this.loadFields()
      if (this.activeNode) {
        this.checkTarget()
        this.checkNodeType()
      }
    },

    transformStatus(v) {
      if (v === 'finished') {
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
      if (this.transformStatus === 'loading') return
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
    checkTarget() {
      //是否目标节点
      const dag = this.$store.getters['dataflow/dag']
      const id = this.activeNode.id
      const allEdges = dag.edges
      this.isTarget = allEdges.some(({ target }) => target === id)
      this.transform.nodeId = this.activeNode.id
    },
    checkNodeType() {
      //处理节点没有字段映射功能
      this.showFieldMapping = this.activeNode.type === 'table'
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
