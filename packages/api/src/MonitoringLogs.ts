import Http from './Http'

export default class Measurement extends Http {
  constructor() {
    super('/api/MonitoringLogs')
  }
  query(params) {
    return this.axios.post(this.url + '/query', params)
  }
}
export { Measurement }
