import Http from './Http'

export default class CustomerJobLogs extends Http {
  constructor() {
    super('/api/CustomerJobLogs')
  }
  solutions(params: unknown) {
    return this.axios.get(this.url + '/solutions', { params })
  }
}
export { CustomerJobLogs }
