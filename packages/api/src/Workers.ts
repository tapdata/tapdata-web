import Http from './Http'
export default class Worker extends Http {
  constructor() {
    super('/api/Workers')
  }
  getAvailableAgent() {
    return this.axios.get(this.url + '/availableAgent')
  }

  taskUsedAgent(id) {
    return this.axios.get(this.url + '/available/taskUsedAgent?taskId=' + id)
  }

  queryAllBindWorker() {
    return this.axios.get(`${this.url}/queryAllBindWorker`)
  }

  unbindByProcessId(id) {
    return this.axios.post(`${this.url}/unbindByProcessId?processId=${id}`)
  }

  getProcessInfo(processIds: string[]) {
    return this.axios.get(`${this.url}/getProcessInfo`, {
      params: {
        process_id: JSON.stringify(processIds)
      }
    })
  }
}
export { Worker }
