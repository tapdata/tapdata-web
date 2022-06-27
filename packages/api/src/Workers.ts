import Http from './Http'
export default class Worker extends Http {
  constructor() {
    super('/api/Workers')
  }
  getAvailableAgent() {
    return this.axios.get(this.url + '/availableAgent')
  }
}
export { Worker }
