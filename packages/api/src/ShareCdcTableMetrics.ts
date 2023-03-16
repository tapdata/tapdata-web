import Http from './Http'

export default class ShareCdcTableMetrics extends Http {
  constructor() {
    super('/api/ShareCdcTableMetrics')
  }
  listTask(params) {
    return this.axios.get(`${this.url}/list_task`, { params })
  }
}
export { ShareCdcTableMetrics }
