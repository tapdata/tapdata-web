import Http from './http'

export default class Measurement extends Http {
  constructor() {
    super('/api/measurement')
  }
  query(params) {
    return axios.post(this.url + '/query', params)
  }
  queryTransmitTotal() {
    return axios.get(this.url + '/queryTransmitTotal')
  }
}
export { Measurement }
