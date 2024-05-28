import Http from './Http'
export default class Inspect extends Http {
  constructor() {
    super('/api/Inspects')
  }

  getTaskList() {
    return this.axios.get(`${this.url}/task-list`)
  }
}
export { Inspect }
