import { externalStorageApi, getConnectionNoSchema } from '@tap/api'

export default {
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
    }
  },
  methods: {
    async getPdkData(id) {
      await getConnectionNoSchema(id).then(async (data) => {
        // 检查外存是否存在，不存在则设置默认外存
        if (data.shareCDCExternalStorageId) {
          const ext = await externalStorageApi.get(
            data.shareCDCExternalStorageId,
          )
          if (!ext) {
            data.shareCDCExternalStorageId = ''
            const filter = {
              where: {
                defaultStorage: true,
              },
            }

            const { items = [] } = await externalStorageApi.list({
              filter: JSON.stringify(filter),
            })
            data.shareCDCExternalStorageId = items[0]?.id
          }
        }

        this.model = data
        const {
          name,
          connection_type,
          table_filter,
          loadAllTables,
          shareCdcEnable,
          accessNodeType,
          accessNodeProcessId,
          priorityProcessId,
          openTableExcludeFilter,
          tableExcludeFilter,
          schemaUpdateHour,
          shareCDCExternalStorageId,
          heartbeatEnable,
        } = this.model
        this.schemaFormInstance.setValues({
          __TAPDATA: {
            name,
            connection_type,
            table_filter,
            loadAllTables,
            shareCdcEnable,
            accessNodeType,
            accessNodeProcessId,
            priorityProcessId,
            openTableExcludeFilter,
            tableExcludeFilter,
            shareCDCExternalStorageId,
            schemaUpdateHour,
            heartbeatEnable,
          },
          ...this.model?.config,
          id: this.model?.id,
        })
        this.renameData.rename = this.model.name
      })
    },

    hasFeature(feature) {
      return (
        !this.isDaas || this.$store.getters['feature/hasFeature']?.(feature)
      )
    },
  },
}
