import Http from './Http'

export default class Logcollector extends Http {
  constructor() {
    super('/api/logcollector')
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

  patchId(id, params) {
    return this.axios.patch(`${this.url}/${id}`, params)
  }

  byConnectionName(name) {
    if (name) {
      return this.axios.get(`${this.url}/byConnectionName/${name}`)
    }
  }

  getSystemConfig(params) {
    return this.axios.get(this.url + '/system/config', { params })
  }

  patchSystemConfig(params) {
    return this.axios.patch(this.url + '/system/config', params)
  }

  getDetail(id) {
    return this.axios.get(`${this.url}/detail/${id}`)
  }
  getChart(params) {
    return this.axios.get(`${this.url}/system/config/stats`, { params })
  }
  check() {
    return this.axios.get(`${this.url}/check/system/config`)
  }
  byTaskId(taskId) {
    return this.axios.get(`${this.url}/byTaskId/${taskId}`)
  }
  bySubTaskId(subTaskId) {
    return this.axios.get(`${this.url}/bySubTaskId/${subTaskId}`)
  }
  tableNames(taskId, params) {
    return this.axios.get(`${this.url}/tableNames/${taskId}`, { params })
  }
  newTableNames(taskId, callSubId, params) {
    return this.axios.get(`${this.url}/tableNames/${taskId}/${callSubId}`, { params })
  }
  relateTasks(params) {
    return this.axios.get(`${this.url}/relate_tasks`, { params })
  }
  // 停止挖掘
  exclusionTables(taskId, params) {
    return this.axios.post(`${this.url}/exclusionTables/${taskId}`, params)
  }
  // 恢复挖掘
  addTables(taskId, params) {
    return this.axios.post(`${this.url}/addTables/${taskId}`, params)
  }
  tableInfos(params) {
    return this.axios.get(`${this.url}/tableInfos`, { params })
  }
  excludeTableInfos(params) {
    return this.axios.get(`${this.url}/excludeTableInfos`, { params })
  }
  getConnectionIdsByTaskId(taskId) {
    return this.axios.get(`${this.url}/connectionIds/${taskId}`)
  }
}
export { Logcollector }
