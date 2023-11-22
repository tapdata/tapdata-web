import Http from './Http'

export default class LDP extends Http {
  constructor() {
    super('/api/ldp')
  }

  createFDMTask(data, config) {
    return this.axios.post(`${this.url}/fdm/task`, data, config)
  }

  createMDMTask(data, config) {
    return this.axios.post(`${this.url}/mdm/task`, data, config)
  }

  searchSources(params, config) {
    return this.axios.get(`${this.url}/fuzzy/search`, { params, ...config })
  }

  getTaskByTag(tags) {
    return this.axios.get(`${this.url}/fdm/task/byTags`, {
      params: { tags },
    })
  }

  checkCanStartByTag(tagId) {
    return this.axios.get(`${this.url}/check/fdm/status`, {
      params: {
        tagId,
      },
    })
  }

  batchStart(tagId, taskIds) {
    return this.axios.post(`${this.url}/fdm/batch/start`, {
      tagId,
      taskIds,
    })
  }

  deleteTable(tableId) {
    return this.axios.delete(`${this.url}/mdm/table/${tableId}`)
  }
}
export { LDP }
