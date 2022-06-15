import Http from './http'

export default class TaskHistoriesAPI extends Http {
  constructor() {
    super('/api/ScheduleTasks')
  }

  post(params) {
    return axios.post(this.url, params)
  }
}
export { TaskHistoriesAPI }
