import Http from './Http'

export default class LineageAPI extends Http {
  constructor() {
    super('/api/lineage')
  }
  findByTable(connectionId, table, type) {
    return this.axios.get(`${this.url}/table/findByTable`, {
      params: {
        connectionId,
        table,
        type
      }
    })
  }
}
export { LineageAPI }
