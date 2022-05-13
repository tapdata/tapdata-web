import Http from './http'
import qs from 'qs'

export class Task extends Http {
  constructor() {
    super('/api/Task')
  }

  /**
   * 确认保存
   * @param params
   * @returns {*}
   */
  save(params) {
    return this.axios.patch(this.url + '/confirm/' + params.id, params)
  }

  saveAndStart(params) {
    return this.axios.patch(this.url + '/confirmStart/' + params.id, params)
  }

  getMetadata(params) {
    return this.axios.post(this.url + '/metadata', params)
  }

  start(id) {
    return this.axios.put(this.url + `/start/${id}`)
  }

  batchStart(taskIds) {
    // return this.axios.put(this.url + `/batchStart?taskIds=` + ids.join('&taskIds='))
    return this.axios.put(this.url + `/batchStart`, qs.stringify({ taskIds }))
  }

  stop(id) {
    return this.axios.put(this.url + `/stop/${id}`)
  }

  forceStop(id) {
    return this.axios.put(this.url + `/stop/${id}?force=true`)
  }

  reset(id) {
    return this.axios.put(this.url + `/renew/${id}`)
  }

  chart(id) {
    if (id) {
      return this.axios.get(`${this.url}/chart?user_id=${id}`)
    } else {
      return this.axios.get(this.url + '/chart')
    }
  }
}
