import Http from './http'
export default class WorkerAPI extends Http {
  constructor() {
    super('/api/Workers')
  }
  getAvailableAgent() {
    return axios.get(this.url + '/availableAgent')
  }
}
export { WorkerAPI }
