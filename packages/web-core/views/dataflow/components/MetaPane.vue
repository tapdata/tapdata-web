<template>
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
</template>

<script>
import MetadataApi from 'web-core/api/MetadataInstances'
import { mapGetters, mapState } from 'vuex'
import VIcon from 'web-core/components/VIcon'
const metadataApi = new MetadataApi()

export default {
  name: 'MetaPane',
  components: { VIcon },
  data() {
    return {
      tableData: [],
      loading: false
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
        const data = await metadataApi.nodeSchema(this.activeNode.id)
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
    }
  }
}
</script>
