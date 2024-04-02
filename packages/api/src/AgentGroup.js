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
}
export { AgentGroupAPI }
