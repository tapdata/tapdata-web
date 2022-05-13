import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class LineageGraphsAPI extends PublicAPI {
  constructor() {
    super('/api/LineageGraphs')
  }
  graphData(params) {
    return axios.post(`${this.url}/graphData`, params)
  }
  refreshGraphData() {
    let url = `${this.url}/refreshGraphData?`
    return axios.get(url)
  }
}
