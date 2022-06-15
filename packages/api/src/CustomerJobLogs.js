import Http from './http'

export default class CustomerJobLogs extends Http {
  constructor() {
    super('/api/CustomerJobLogs')
  }
  solutions(params) {
    return axios.get(this.url + '/solutions', { params })
  }
}
export { CustomerJobLogs }
