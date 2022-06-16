import Http from './http'
export default class TaskAPI extends Http {
  constructor() {
    super('/api/SubTask')
  }
  byTaskId(taskId, params) {
    return this.axios.get(this.url + `/byTaskId/${taskId}`, { params })
  }
  start(id) {
    return this.axios.post(this.url + `/start/${id}`)
  }
  stop(id) {
    return this.axios.post(this.url + `/stop/${id}`)
  }
  renew(id) {
    return this.axios.post(this.url + `/renew/${id}`)
  }
  pause(id) {
    return this.axios.post(this.url + `/pause/${id}`)
  }
  runtimeInfo(id) {
    return this.axios.get(this.url + `/runtimeInfo/${id}`)
  }
  syncTable(id, params) {
    return this.axios.get(this.url + `/view/sync/table/${id}`, { params })
  }
  syncOverView(id) {
    return this.axios.get(this.url + `/view/sync/overview/${id}`)
  }
  cdcIncrease(id) {
    return this.axios.get(this.url + `/view/increase/${id}`)
  }
  clearIncrease(id, srcId, tgtId) {
    return this.axios.post(this.url + `/increase/clear/${id}?srcNode=${srcId}&tgtNode=${tgtId}`)
  }
  rollbackIncrease(id, srcId, tgtId, params) {
    return this.axios.post(this.url + `/increase/backtracking/${id}?srcNode=${srcId}&tgtNode=${tgtId}`, params)
  }
}
export { TaskAPI }
