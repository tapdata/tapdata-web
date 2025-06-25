import Http from './Http'
export default class Inspect extends Http {
  constructor() {
    super('/api/Inspects')
  }

  getTaskList() {
    return this.axios.get(`${this.url}/task-list`)
  }

  getVerifyInfo(id) {
    return this.axios.get(`${this.url}/${id}/recovery/start-verify`)
  }

  startRecovery(id) {
    return this.axios.put(`${this.url}/${id}/recovery/start`)
  }

  import(data) {
    return this.axios.post(`${this.url}/batch/import`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  exportSql(id, resultId) {
    return this.axios.put(
      `${this.url}/${id}/exportRecoverySql?inspectResultId=${resultId}`,
    )
  }
}
export { Inspect }
