import Http from './Http'

export default class DataRules extends Http {
  constructor() {
    super('/api/DataRules')
  }

  get(params) {
    if (Array.isArray(params)) {
      return this.axios.get(this.url + '/' + params.join('/'))
    }
    params = params || {}
    return this.axios.get(this.url, { params })
  }
}
export { DataRules }
