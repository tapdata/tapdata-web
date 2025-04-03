import Http from './Http'

export default class Licenses extends Http {
  constructor() {
    super('/api/Licenses')
  }

  expires(params) {
    return this.axios.get(this.url + '/expires', params)
  }

  getSid(ids) {
    return this.axios.get(`${this.url}/sid`, {
      params: {
        id: JSON.stringify(ids),
      },
    })
  }

  updateLicense(params) {
    return this.axios.post(`${this.url}/upload`, params)
  }

  getPipelineDetails() {
    return this.axios.get(`${this.url}/pipelineDetails`)
  }

  getFeatures() {
    return this.axios.get(`${this.url}/features`).catch(err => {
      if (err.response.status == 404 &&  import.meta.env.NODE_ENV === 'development') {
        return Promise.resolve({
          licenseType: 'OP',
          features: []
        })
      }
    })
  }
}
export { Licenses }
