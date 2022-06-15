import Http from './http'

export default class LineageGraphsAPI extends Http {
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
export { LineageGraphsAPI }
