import Http from './Http'

export default class ExternalStorage extends Http {
  constructor() {
    super('/api/ExternalStorage')
  }
  changeExternalStorage(id) {
    return this.axios.patch(this.url + '/' + id + '/default')
  }
  list(params: unknown, filter: unknown) {
    if (Array.isArray(params)) {
      let queryStr = ''
      if (typeof filter === 'object') {
        queryStr = JSON.stringify(filter)
      } else if (typeof filter === 'string') {
        queryStr = filter
      }
      const qs = queryStr ? '?filter=' + encodeURIComponent(queryStr) : ''
      return this.axios.get(this.url + '/' + params.join('/') + qs)
    } else if (typeof params === 'string') {
      return this.axios.get(this.url + '/' + params, { params: filter })
    }
    params = params || {}
    return this.axios.get(this.url + '/list', { params })
  }
  usingTask(id) {
    return this.axios.get(this.url + '/' + id + '/usingTask')
  }
}
export { ExternalStorage }
