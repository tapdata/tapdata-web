import Http from './Http'

export default class ExternalStorage extends Http {
  constructor() {
    super('/api/ExternalStorage')
  }
  changeExternalStorage(id) {
    return this.axios.patch(this.url + '/' + id + '/default')
  }
  async list(params: unknown, filter: unknown) {
    return this.get(params, filter)
  }
  usingTask(id) {
    return this.axios.get(this.url + '/' + id + '/usingTask')
  }

  async get(params: unknown, filter: unknown) {
    const mapData = data => {
      if (data?.items?.length) {
        data?.items.forEach(item => {
          item.name = item.name.replace(/tapdata\s?/gi, '')
        })
      }
      return data
    }

    if (Array.isArray(params)) {
      let queryStr = ''
      if (typeof filter === 'object') {
        queryStr = JSON.stringify(filter)
      } else if (typeof filter === 'string') {
        queryStr = filter
      }
      const qs = queryStr ? '?filter=' + encodeURIComponent(queryStr) : ''
      const data = await this.axios.get(this.url + '/' + params.join('/') + qs)

      return mapData(data)
    } else if (typeof params === 'string') {
      const data = await this.axios.get(this.url + '/' + params, { params: filter })

      if (data?.name) {
        data.name = data.name.replace(/tapdata\s?/gi, '')
      }

      return data
    }

    params = params || {}
    const data = await this.axios.get(this.url, { params })

    return mapData(data)
  }
}
export { ExternalStorage }
