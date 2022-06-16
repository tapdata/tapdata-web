import Http from './http'

export default class LineageGraphsAPI extends Http {
  constructor() {
    super('/api/LineageGraphs')
  }
  graphData(params) {
    return this.axios.post(`${this.url}/graphData`, params)
  }
  refreshGraphData() {
    let url = `${this.url}/refreshGraphData?`
    return this.axios.get(url)
  }
}
export { LineageGraphsAPI }
