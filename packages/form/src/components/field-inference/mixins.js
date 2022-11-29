import { mapGetters, mapState } from 'vuex'

import { metadataInstancesApi } from '@tap/api'

export default {
  data() {
    return {}
  },

  computed: {
    ...mapGetters('dataflow', ['activeNode']),

    showLoading() {
      return this.loading
    }
  },

  methods: {
    async getData(op = {}) {
      let data = {
        items: [],
        total: 0
      }
      try {
        const params = {
          nodeId: this.activeNode?.id,
          tableFilter: op.tableFilter,
          fields: ['original_name', 'fields', 'qualified_name'],
          page: op.page || 1,
          pageSize: op.pageSize || 20
        }
        data = await metadataInstancesApi.nodeSchemaPage(params)
      } catch (e) {
        // catch
      }
      return data
    }
  }
}
