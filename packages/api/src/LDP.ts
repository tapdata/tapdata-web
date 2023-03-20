import Http from './Http'

export default class LDP extends Http {
  constructor() {
    super('/api/ldp')
  }

  createFDMTask(params) {
    return this.axios.post(`${this.url}/fdm/task`, params)
  }

  createMDMTask(data, params) {
    return this.axios.post(`${this.url}/mdm/task`, data, { params })
  }
}
export { LDP }
