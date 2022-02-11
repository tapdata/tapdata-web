import PublicApi from './PublicApi'
import axios from './axios'
export default class TaskAPI extends PublicApi {
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
}
