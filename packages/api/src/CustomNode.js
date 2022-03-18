import axios from './axios'
import PublicAPI from './PublicApi'

export class CustomNode extends PublicAPI {
  constructor() {
    super('/api/customNode')
  }

  /**
   * 检查使用该节点的任务
   * @param id
   * @returns {Promise<AxiosResponse<any>>}
   */
  checkUsed(id) {
    return axios.get(`${this.url}/checkUsed/${id}`)
  }
}
