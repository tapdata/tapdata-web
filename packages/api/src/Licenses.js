import Http from './http'

export default class Licenses extends Http {
  constructor() {
    super('/api/Licenses')
  }

  expires(params) {
    return axios.get(this.url + '/expires', params)
  }

  getSid(ids) {
    return axios.get(`${this.url}/sid`, {
      params: {
        id: JSON.stringify(ids)
      }
    })
  }

  updateLicense(params) {
    return axios.post(`${this.url}/upload`, params)
  }
}
export { Licenses }
