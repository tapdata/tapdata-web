import { getNodeSchemaPage } from '@tap/api/src/core/metadata-instances'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {}
  },

  computed: {
    ...mapGetters('dataflow', ['activeNode']),

    showLoading() {
      return this.loading
    },
  },

  methods: {
    async getData(op = {}) {
      const nodeId = this.activeNode?.id
      if (!nodeId) return
      let data = {
        items: [],
        total: 0,
      }
      try {
        const params = Object.assign(
          {
            nodeId,
            fields: [
              'original_name',
              'fields',
              'qualified_name',
              'name',
              'indices',
              'constraints',
            ],
            page: 1,
            pageSize: 20,
          },
          op,
        )
        data = await getNodeSchemaPage(params)
      } catch {
        // catch
      }
      return data
    },
  },
}
