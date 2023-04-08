import Http from './Http'

export default class LDP extends Http {
  constructor() {
    super('/api/ldp')
  }

  createFDMTask(params) {
    return this.axios.post(`${this.url}/fdm/task`, params)
  }

  createMDMTask(data, config) {
    return this.axios.post(`${this.url}/mdm/task`, data, config)
  }

  searchSources(params) {
    return this.axios.get(`${this.url}/fuzzy/search`, { params })
  }

  getTaskByTag(tags) {
    return this.axios.get(`${this.url}/fdm/task/byTags`, {
      params: { tags }
    })
  }
}
export { LDP }
