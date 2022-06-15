import Http from './http'

export default class DataRules extends Http {
  constructor() {
    super('/api/DataRules')
  }

  get(params) {
    if (Array.isArray(params)) {
      return axios.get(this.url + '/' + params.join('/'))
    }
    params = params || {}
    return axios.get(this.url, { params })
  }
}
export { DataRules }
