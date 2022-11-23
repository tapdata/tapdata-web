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
    async getData(page = {}) {
      let data = {
        items: [],
        total: 0
      }
      try {
        const params = {
          nodeId: this.activeNode?.id,
          tableFilter: '',
          fields: ['original_name', 'fields', 'qualified_name'],
          page: page.page || 1,
          pageSize: page.pageSize || 20
        }
        data = await metadataInstancesApi.nodeSchemaPage(params)
      } catch (e) {
        // catch
      }
      return data
    }
  }
}
