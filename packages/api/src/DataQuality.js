import Http from './http'

export default class DataQualityAPI extends Http {
  constructor() {
    super('/api/DataCatalogs')
  }

  getCount(params) {
    return this.axios.get(this.url + '/getCount', { params: params })
  }

  getList(params) {
    return this.axios.get(this.url + '/getList', { params: params })
  }

  analyzeByConnId(params) {
    return this.axios.post(this.url + '/analyzeByConnId', params)
  }
}
export { DataQualityAPI }
