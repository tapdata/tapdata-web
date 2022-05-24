/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class file extends PublicAPI {
  constructor() {
    super('/api/file')
  }
  upload(params) {
    return axios.post(this.url + '/upload', params)
  }
  removeFile(id) {
    return axios.delete(this.url + '/delete?id=' + id)
  }
}
