import Http from './Http'

export default class Measurement extends Http {
  constructor() {
    super('/api/measurement')
  }
  query(params) {
    return this.axios.post(this.url + '/query', params)
  }
  queryTransmitTotal() {
    return this.axios.get(this.url + '/queryTransmitTotal')
  }
  queryV2(params) {
    return this.axios.post(this.url + '/query/v2', params)
  }
  batch(params) {
    return this.axios.post(this.url + '/batch', params)
  }
}
export { Measurement }
