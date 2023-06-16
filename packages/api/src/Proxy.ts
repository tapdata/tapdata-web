import Http from './Http'

export default class Proxy extends Http {
  constructor() {
    super('/api/proxy')
  }

  getId() {
    return this.axios.get(`${this.url}/id`)
  }

  subscribe(params) {
    return this.axios.post(`${this.url}/subscribe`, params)
  }

  command(params) {
    return this.axios.post(`${this.url}/command`, params)
  }

  call(params) {
    return this.axios.post(`${this.url}/call`, params)
  }

  supervisor(pid) {
    return this.axios.get(`${this.url}/supervisor?pid=${pid}`)
  }

  connectors(pid) {
    return this.axios.get(`${this.url}/memory/connectors?pid=${pid}`)
  }

  callHistory(params) {
    return this.axios.get(`${this.url}/call/history`, { params })
  }

  generateRefreshToken(params) {
    return this.axios.post(`${this.url}/generate/refresh-token`, params)
  }

  host() {
    return this.axios.get(`${this.url}/host`)
  }
}
export { Proxy }
