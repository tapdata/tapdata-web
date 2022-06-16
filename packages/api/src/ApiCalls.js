import Http from './http'

export default class ApiCalls extends Http {
  constructor() {
    super('/api/ApiCalls')
  }

  getAllMethod(params) {
    return axios.get(this.url + '/getAllMethod', { params })
  }

  getAllResponseCode(params) {
    return axios.get(this.url + '/getAllResponseCode', { params })
  }
}
export { ApiCalls }
