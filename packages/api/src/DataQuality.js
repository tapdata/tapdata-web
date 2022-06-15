import Http from './http'

export default class DataQualityAPI extends Http {
  constructor() {
    super('/api/DataCatalogs')
  }

  getCount(params) {
    return axios.get(this.url + '/getCount', { params: params })
  }

  getList(params) {
    return axios.get(this.url + '/getList', { params: params })
  }

  analyzeByConnId(params) {
    return axios.post(this.url + '/analyzeByConnId', params)
  }
}
export { DataQualityAPI }
