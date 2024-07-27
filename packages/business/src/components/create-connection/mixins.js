import { connectionsApi, externalStorageApi } from '@tap/api'

export default {
  methods: {
    async getPdkData(id) {
      await connectionsApi.getNoSchema(id).then(async data => {
        // 检查外存是否存在，不存在则设置默认外存
        const ext = await externalStorageApi.get(data.shareCDCExternalStorageId)
        if (!ext) {
          data.shareCDCExternalStorageId = ''
          let filter = {
            where: {
              defaultStorage: true
            }
          }

          const { items = [] } = await externalStorageApi.list({
            filter: JSON.stringify(filter)
          })
          data.shareCDCExternalStorageId = items[0]?.id
        }
        this.model = data
        let {
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
          heartbeatEnable
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
            heartbeatEnable
          },
          ...this.model?.config,
          id: this.model?.id
        })
        this.renameData.rename = this.model.name
      })
    }
  }
}
