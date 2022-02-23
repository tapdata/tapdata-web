/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from 'axios'

export default class TaskAPI extends PublicAPI {
  constructor() {
    super('/api/SubTask')
  }
  byTaskId(taskId, params) {
    return axios.get(this.url + `/byTaskId/${taskId}`, { params })
  }
  start(id) {
    return axios.post(this.url + `/start/${id}`)
  }
  stop(id) {
    return axios.post(this.url + `/stop/${id}`)
  }
  renew(id) {
    return axios.post(this.url + `/renew/${id}`)
  }
  pause(id) {
    return axios.post(this.url + `/pause/${id}`)
  }
  runtimeInfo(id) {
    return axios.get(this.url + `/runtimeInfo/${id}`)
  }
}
