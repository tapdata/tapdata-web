import Http from './http'
export default class UserLogsAPI extends Http {
  constructor() {
    super('/api/UserLogs')
  }

  post(params) {
    return this.axios.post(this.url, params)
  }
}

export { UserLogsAPI }
