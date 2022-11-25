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
}
export { Proxy }
