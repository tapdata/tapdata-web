import Http from './Http'
export default class AlarmAPI extends Http {
  constructor() {
    super('/api/alarm')
  }
  listTask() {
    return this.axios.get(`${this.url}/list_task`)
  }

  list() {
    return this.axios.post(`${this.url}/list`)
  }
}
export { AlarmAPI }
