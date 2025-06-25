import Http from './Http'

export default class Licenses extends Http {
  constructor() {
    super('/api/Licenses')
  }

  expires() {
    return this.axios.get(`${this.url}/expires`)
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
    return this.axios.get(`${this.url}/features`).catch((error) => {
      if (error.response.status === 404 && import.meta.env.DEV) {
        return Promise.resolve({
          licenseType: 'OP',
          features: [],
        })
      }
    })
  }
}
export { Licenses }
