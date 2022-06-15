import Http from './http'
export default class MetadataDefinitions extends Http {
  constructor() {
    super('/api/MetadataDefinition')
  }
  changeById(params) {
    return axios.patch(`${this.url}/${params.id}`, params)
  }
}
export { MetadataDefinitions }
