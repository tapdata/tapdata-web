import Http from './Http'

export default class AgentGroupAPI extends Http {
  constructor() {
    super('/api/agent-group')
  }

  save(params) {
    return this.axios.post(`${this.url}/create-group`, params)
  }

  update(params) {
    return this.axios.post(`${this.url}/update-group`, params)
  }

  updateAgent(params) {
    return this.axios.post(`${this.url}/batch-modify`, params)
  }
}
export { AgentGroupAPI }
