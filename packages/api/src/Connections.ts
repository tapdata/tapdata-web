import { isPlainObj } from '@tap/shared'
import Http from './Http'

export default class Connections extends Http {
  constructor() {
    super('/api/Connections')
  }
  get(params = {}, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      const qs = filter ? `?filter=${encodeURIComponent(filter)}` : ''
      return this.axios.get(`${this.url}/${params.join('/')}${qs}`)
    } else if (typeof params === 'string') {
      return this.axios.get(`${this.url}/${params}`, { params: filter })
    }

    const config = { params }
    if (isPlainObj(filter)) {
      Object.assign(config, filter)
    }
    return this.axios.get(this.url, config)
  }
  customQuery(id: string, params: { [key: string]: unknown }) {
    let url = `${this.url}/${id}` + '/customQuery?'
    for (const item in params) {
      url += `${item}=${params[item]}&`
    }
    return this.axios.get(url)
  }
  copy(id: string, params: unknown) {
    return this.axios.post(`${this.url}/${id}/copy`, params)
  }
  batchUpdateListtags(params: unknown) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
  check(id: string, params: unknown) {
    return this.axios.patch(`${this.url}/${id}`, params)
  }
  getNoSchema(id: string) {
    const url = `${this.url}/${id}` + '?noSchema=1'
    return this.axios.get(url)
  }
  getAllowDatabaseType() {
    return this.axios.get(`${this.url}/databaseType`)
  }
  patchId(params) {
    const id = params._id || params.id
    delete params._id
    delete params.id
    return this.axios.patch(`${this.url}/${id}`, params)
  }
  findAll(filter: unknown) {
    return this.axios.get(
      `${this.url}/findAll?filter=${encodeURIComponent(
        JSON.stringify(filter),
      )}`,
    )
  }
  listAll(filter: unknown) {
    return this.axios.get(
      `${this.url}/listAll?filter=${encodeURIComponent(
        JSON.stringify(filter),
      )}`,
    )
  }
  checkConnectionTask(id: string) {
    return this.axios.get(`${this.url}/task/${id}/10`)
  }

  getStats() {
    return this.axios.get(`${this.url}/stats`)
  }
  create(params: unknown, urlParams: any) {
    let url = this.url
    for (const key in urlParams) {
      url += `?${key}=${urlParams[key]}`
    }
    return this.axios.post(url, params)
  }
  heartbeatTask(connectionId) {
    return this.axios.get(`${this.url}/${connectionId}/heartbeat-task`)
  }
  usingDigginTaskByConnectionId(connectionId) {
    return this.axios.get(
      `${this.url}/${connectionId}/usingDigginTaskByConnectionId`,
    )
  }

  getDatabaseTypes() {
    return this.axios.get(`${this.url}/databaseTypes`)
  }
}

export { Connections }
