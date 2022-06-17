import Http from './Http'

export default class TaskHistoriesAPI extends Http {
  constructor() {
    super('/api/ScheduleTasks')
  }

  post(params) {
    return this.axios.post(this.url, params)
  }
}
export { TaskHistoriesAPI }
