<template>
  <div>
    <FieldMapping
      ref="fieldMapping"
      class="flex justify-content-end mr-5 mt-3"
      :transform="transform"
      :getDataFlow="getDataFlow"
    ></FieldMapping>
    <ElTable v-loading="showLoading" :data="tableData" stripe style="width: 100%" height="100%">
      <ElTableColumn prop="field_name" label="字段名称">
        <template #default="{ row }">
          <span class="flex align-center"
            >{{ row.field_name }}
            <VIcon v-if="row.unique" size="12" class="text-warning ml-1">key</VIcon>
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="data_type" label="字段类型"> </ElTableColumn>
      <ElTableColumn prop="scale" label="精度"> </ElTableColumn>
      <ElTableColumn prop="oriPrecision" label="长度"> </ElTableColumn>
      <ElTableColumn prop="comment" label="字段注释"> </ElTableColumn>
    </ElTable>
  </div>
</template>

<script>
import { MetadataInstances } from '@daas/api'
import FieldMapping from '@tapdata/field-mapping'
import { mapGetters, mapState } from 'vuex'
import VIcon from 'web-core/components/VIcon'
const metadataApi = new MetadataInstances()

export default {
  name: 'MetaPane',
  components: { VIcon, FieldMapping },
  data() {
    return {
      tableData: [],
      loading: false,
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
    ...mapState('dataflow', ['activeNodeId', 'transformStatus']),
    ...mapGetters('dataflow', ['activeNode']),

    showLoading() {
      return this.loading || this.transformStatus === 'loading'
    }
  },

  watch: {
    activeNodeId() {
      this.loadFields()
      this.transform.nodeId = this.activeNode.id
    },

    transformStatus(v) {
      if (v === 'finished') {
        this.loadFields()
      }
    }
  },

  methods: {
    async loadFields() {
      if (this.transformStatus === 'loading') return
      this.loading = true

      try {
        let data = await metadataApi.nodeSchema(this.activeNode.id)
        data = data?.[0]
        data.fields.sort((a, b) => {
          if (a.unique !== b.unique) {
            return a.unique ? -1 : 1
          } else {
            return a.field_name.localeCompare(b.field_name)
          }
        })
        this.tableData = data.fields
      } catch (e) {
        this.tableData = []
      }

      this.loading = false
      this.transform.stageId = this.activeNode.id
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
    }
  }
}
</script>
