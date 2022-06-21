import Http from './Http'
export default class UserLogs extends Http {
  constructor() {
    super('/api/UserLogs')
  }

  post(params) {
    return this.axios.post(this.url, params)
  }
}

export { UserLogs }
