import { isPlainObj } from '@tap/shared'
import Cookie from '@tap/shared/src/cookie'
import Http from './Http'

export default class Task extends Http {
  constructor() {
    super('/api/Task')
  }

  // @ts-ignore
  get(params: unknown, filter: unknown, headers: unknown) {
    if (Array.isArray(params)) {
      let queryStr = ''
      if (typeof filter === 'object') {
        queryStr = JSON.stringify(filter)
      } else if (typeof filter === 'string') {
        queryStr = filter
      }
      const qs = queryStr ? `?filter=${encodeURIComponent(queryStr)}` : ''
      return this.axios.get(`${this.url}/${params.join('/')}${qs}`)
    } else if (typeof params === 'string') {
      return this.axios.get(`${this.url}/${params}`, {
        params: filter,
        headers,
      })
    }
    params = params || {}
    return this.axios.get(this.url, { params })
  }

  /**
   * 确认保存
   * @param params
   * @returns {*}
   */
  copy(id) {
    return this.axios.put(`${this.url}/copy/${id}`)
  }

  pause(id) {
    return this.axios.put(`${this.url}/pause/${id}`)
  }
  batchDelete(ids) {
    return this.axios.delete(
      `${this.url}/batchDelete?taskIds=${ids.join('&taskIds=')}`,
    )
  }
  batchRenew(ids) {
    return this.axios.patch(
      `${this.url}/batchRenew?taskIds=${ids.join('&taskIds=')}`,
    )
  }
  batchStop(ids) {
    return this.axios.put(
      `${this.url}/batchStop?taskIds=${ids.join('&taskIds=')}`,
    )
  }

  patchId(id, params) {
    return this.axios.patch(`${this.url}/${id}`, params)
  }

  findTaskDetailById(id) {
    return this.axios.get(`${this.url}/findTaskDetailById/${id}`)
  }
  tranModelVersionControl(params) {
    return this.axios.post(`${this.url}/tranModelVersionControl`, params)
  }
  getId(id, params, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      const qs = filter ? `?filter=${encodeURIComponent(filter)}` : ''
      return this.axios.get(`${this.url}/${id}${params.join('/')}${qs}`)
    }
    params = params || {}
    return this.axios.get(`${this.url}/${id}`, { params })
  }
  edit(params) {
    return this.axios.patch(`${this.url}/confirm/${params.id}`, params)
  }

  export(ids) {
    const href = `${
      this.url
    }/batch/load?taskId=${ids.join('&taskId=')}&access_token=${Cookie.get('access_token')}`
    window.open(href)
  }
  checkRun(id) {
    return this.axios.get(`${this.url}/checkRun/${id}`)
  }

  batchUpdateListtags(params) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
  save(params, config) {
    return this.axios.patch(
      `${this.url}/confirm${params.id ? `/${params.id}` : ''}`,
      params,
      config,
    )
  }

  saveAndStart(params, config) {
    return this.axios.patch(
      `${this.url}/confirmStart/${params.id || ''}`,
      params,
      config,
    )
  }

  getMetadata(params) {
    return this.axios.post(`${this.url}/metadata`, params)
  }

  start(id, config) {
    return this.axios.put(`${this.url}/start/${id}`, null, config)
  }

  batchStart(taskIds, config) {
    return this.axios.put(
      `${this.url}/batchStart?taskIds=${taskIds.join('&taskIds=')}`,
      null,
      config,
    )
    //return this.axios.put(this.url + `/batchStart`, qs.stringify({ taskIds }))
  }

  stop(id) {
    return this.axios.put(`${this.url}/stop/${id}`)
  }

  forceStop(id) {
    return this.axios.put(`${this.url}/stop/${id}?force=true`)
  }

  reset(id) {
    return this.axios.put(`${this.url}/renew/${id}`)
  }

  chart(id) {
    if (id) {
      return this.axios.get(`${this.url}/chart?user_id=${id}`)
    } else {
      return this.axios.get(`${this.url}/chart`)
    }
  }

  checkName(params = {}) {
    return this.axios.post(`${this.url}/checkName`, params)
  }
  getNodeTableInfo(params = {}) {
    const config = { params }
    if (isPlainObj(params)) {
      Object.assign(config, params)
    }
    return this.axios.get(`${this.url}/getNodeTableInfo`, config)
  }

  //表的状态
  tableStatus(connectionId, tableName) {
    return this.axios.get(
      `${this.url}/table/status?connectionId=${connectionId}&tableName=${
        tableName
      }`,
    )
  }

  getConsole(params) {
    return this.axios.get('/api/task-console', { params })
  }

  testRunJs(params) {
    return this.axios.post('/api/task/migrate-js/test-run', params)
  }

  testRunJsRpc(params) {
    return this.axios.post('/api/task/migrate-js/test-run-rpc', params)
  }

  getRunJsResult(params) {
    return this.axios.get('/api/task/migrate-js/get-result', { params })
  }

  // Python rpc试运行
  testRunPythonRpc(params) {
    return this.axios.post('/api/task/migrate-python/test-run-rpc', params)
  }

  records(id, params) {
    return this.axios.get(`${this.url}/records/${id}`, { params })
  }

  autoInspectResultsGroupByTable(params) {
    return this.axios.post(
      `${this.url}/auto-inspect-results-group-by-table`,
      params,
    )
  }

  autoInspectResults(taskId, params) {
    return this.axios.get(`${this.url}/${taskId}/auto-inspect-results`, {
      params,
    })
  }

  autoInspectTotals(params) {
    return this.axios.post(`${this.url}/auto-inspect-totals`, params)
  }

  getStats() {
    return this.axios.get(`${this.url}/stats`)
  }

  //再次校验
  autoInspectAgain(taskId, params) {
    return this.axios.post(`${this.url}/${taskId}/auto-inspect-again`, params)
  }

  putLogSetting(taskId, params) {
    return this.axios.put(`${this.url}/logSetting/${taskId}`, params)
  }

  taskConsoleRelations(params) {
    return this.axios.post(`/api/task-console/relations`, params)
  }

  rename(taskId, newName) {
    return this.axios.patch(
      `${this.url}/rename/${taskId}?newName=${encodeURIComponent(newName)}`,
    )
  }

  getTaskByConnection(params) {
    return this.axios.get(`${this.url}/targetNode/connectionIds`, { params })
  }
  //根据表名获取任务
  getTaskByTableName(params, config) {
    return this.axios.get(`${this.url}/stats/task`, { params, ...config })
  }
  getParentTaskSign(id, parentId) {
    return this.axios.get(`${this.url}/${id}/parent-task-sign`, {
      params: {
        parentId,
      },
    })
  }

  checkCheckCloudTaskLimit(taskId) {
    return this.axios.get(`${this.url}/checkCloudTaskLimit/${taskId}`)
  }

  skipErrorEvents(taskId, ids) {
    return this.axios.post(`${this.url}/skipErrorEvents/${taskId}`, ids)
  }

  getTimeRange(data, params) {
    return this.axios.get(`${this.url}/calculatedTimeRange`, {
      data: JSON.stringify(data),
      params,
    })
  }

  getCurrentEngineTime() {
    return this.axios.get(`${this.url}/getCurrentEngineTime`)
  }

  getErrorEvents(taskId) {
    return this.axios.get(`${this.url}/errors/${taskId}`)
  }

  downloadAnalyze(taskId, params) {
    return this.axios.post(`${this.url}/analyze/${taskId}`, null, {
      ...params,
      responseType: 'blob',
    })
  }

  refreshSchema(taskId, params) {
    return this.axios.put(`${this.url}/${taskId}/re-schemas`, null, {
      params,
    })
  }
}
export { Task }
