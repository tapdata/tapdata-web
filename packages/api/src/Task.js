import PublicApi from './PublicApi'
import axios from './axios'
import qs from 'qs'

export class Task extends PublicApi {
  constructor() {
    super('/api/Task')
  }

  /**
   * 确认保存
   * @param params
   * @returns {*}
   */
  save(params) {
    return axios.patch(this.url + '/confirm/' + params.id, params)
  }
  getMetadata(params) {
    return axios.post(this.url + '/metadata', params)
  }

  start(id) {
    return axios.put(this.url + `/start/${id}`)
  }

  batchStart(taskIds) {
    // return axios.put(this.url + `/batchStart?taskIds=` + ids.join('&taskIds='))
    return axios.put(this.url + `/batchStart`, qs.stringify({ taskIds }))
  }

  stop(id) {
    return axios.put(this.url + `/stop/${id}`)
  }

  forceStop(id) {
    return axios.put(this.url + `/stop/${id}?force=true`)
  }

  reset(id) {
    return axios.put(this.url + `/renew/${id}`)
  }
}
