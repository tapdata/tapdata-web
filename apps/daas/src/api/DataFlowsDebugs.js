import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class DataFlowsDebugs extends PublicAPI {
  constructor() {
    super('/api/DataFlowsDebugs')
  }

  getTables(params) {
    return axios.get(this.url + '/getTables', { params: params })
  }
}
