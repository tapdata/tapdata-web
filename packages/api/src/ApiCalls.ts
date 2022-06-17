import Http from './Http'

export default class ApiCalls extends Http {
  constructor() {
    super('/api/ApiCalls')
  }

  getAllMethod(params) {
    return this.axios.get(this.url + '/getAllMethod', { params })
  }

  getAllResponseCode(params) {
    return this.axios.get(this.url + '/getAllResponseCode', { params })
  }
}
export { ApiCalls }
