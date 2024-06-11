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
    return this.axios.get(`${this.url}/${id}/recovery/start`)
  }
}
export { Inspect }
