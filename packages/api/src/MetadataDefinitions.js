import Http from './Http'
export default class MetadataDefinitions extends Http {
  constructor() {
    super('/api/MetadataDefinition')
  }
  changeById(params) {
    return this.axios.patch(`${this.url}/${params.id}`, params)
  }
}
export { MetadataDefinitions }
