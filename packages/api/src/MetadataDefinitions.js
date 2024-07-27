import Http from './Http'
export default class MetadataDefinitions extends Http {
  constructor() {
    super('/api/MetadataDefinition')
  }
  changeById(params) {
    return this.axios.patch(`${this.url}/${params.id}`, params)
  }
  childAccount(params) {
    return this.axios.get(`${this.url}/and/child_account`, { params })
  }
  batchPushListtags(tableName, params) {
    return this.axios.patch(`${this.url}/batchPushListtags/${tableName}`, params)
  }

  getTags(type) {
    return this.axios.get(`${this.url}/all-tag/${type}`)
  }
}
export { MetadataDefinitions }
