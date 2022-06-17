import Http from './Http'

export default class Insights extends Http {
  constructor() {
    super('/api/Insights')
  }

  count(params) {
    return this.axios.get(this.url + '/count', { params })
  }
  get(params) {
    if (Array.isArray(params)) {
      return this.axios.get(this.url + '/' + params.join('/'))
    }
    if (params.url) {
      return this.axios.get(params.url)
    }
    params = params || {}
    return this.axios.get(this.url, { params })
  }

  findOne(params) {
    return this.axios.get(this.url + '/findOne', { params })
  }
}
export { Insights }
