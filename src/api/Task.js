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
}
