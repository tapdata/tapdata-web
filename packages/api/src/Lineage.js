import Http from './Http'

export default class LineageAPI extends Http {
  constructor() {
    super('/api/lineage')
  }
  findByTable(connectionId, table, type) {
    return this.axios.get(`${this.url}/refreshGraphData?`, {
      params: {
        connectionId,
        table,
        type
      }
    })
  }
}
export { LineageAPI }
