/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from 'axios'

export default class TaskAPI extends PublicAPI {
  constructor() {
    super('/api/Task')
  }
  start(id) {
    return axios.put(this.url + `/start/${id}`)
  }
  stop(id) {
    return axios.put(this.url + `/stop/${id}`)
  }
  copy(id) {
    return axios.put(this.url + `/copy/${id}`)
  }
  renew(id) {
    return axios.put(this.url + `/renew/${id}`)
  }
  pause(id) {
    return axios.put(this.url + `/pause/${id}`)
  }
  batchDelete(ids) {
    return axios.delete(this.url + `/batchDelete?taskIds=` + ids.join('&taskIds='))
  }
  batchRenew(ids) {
    return axios.patch(this.url + `/batchRenew?taskIds=` + ids.join('&taskIds='))
  }
  batchStop(ids) {
    return axios.put(this.url + `/batchStop?taskIds=` + ids.join('&taskIds='))
  }
  batchStart(ids) {
    return axios.put(this.url + `/batchStart?taskIds=` + ids.join('&taskIds='))
  }
}
