import PublicApi from './PublicApi'
import axios from './axios'
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
  metaData(params) {
    return axios.post(this.url + '/metadata', params)
  }
}
