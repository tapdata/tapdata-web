import Http from './http'

export default class LogcollectorApi extends Http {
  constructor() {
    super('/api/logcollector')
  }

  get(params) {
    if (Array.isArray(params)) {
      return axios.get(this.url + '/' + params.join('/'))
    }
    if (params.url) {
      return axios.get(params.url)
    }
    params = params || {}
    return axios.get(this.url, { params })
  }

  patch(id, params) {
    return axios.patch(`${this.url}/${id}`, params)
  }

  byConnectionName(name) {
    if (name) {
      return axios.get(`${this.url}/byConnectionName/${name}`)
    }
  }

  getSystemConfig(params) {
    return axios.get(this.url + '/system/config', { params })
  }

  patchSystemConfig(params) {
    return axios.patch(this.url + '/system/config', params)
  }

  getDetail(id) {
    return axios.get(`${this.url}/detail/${id}`)
  }
  getChart(params) {
    return axios.get(`${this.url}/system/config/stats`, { params })
  }
  check() {
    return axios.get(`${this.url}/check/system/config`)
  }
  byTaskId(taskId) {
    return axios.get(`${this.url}/byTaskId/${taskId}`)
  }
  bySubTaskId(subTaskId) {
    return axios.get(`${this.url}/bySubTaskId/${subTaskId}`)
  }
  tableNames(taskId, params) {
    return axios.get(`${this.url}/tableNames/${taskId}`, { params })
  }
}
export { LogcollectorApi }
