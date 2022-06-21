import Http from './Http'

export default class DataFlows extends Http {
  constructor() {
    super('/api/DataFlows')
  }
  chart(id) {
    if (id) {
      return this.axios.get(`${this.url}/chart?user_id=${id}`)
    } else {
      return this.axios.get(this.url + '/chart')
    }
  }
  draft(params) {
    return this.axios.patch(this.url + '/draft', params)
  }
  copy(id) {
    return this.axios.post(`${this.url}/${id}/copy`)
  }
  reset(id) {
    return this.axios.post(`${this.url}/${id}/reset`)
  }
  create(params) {
    return this.axios.post(`${this.url}`, params)
  }
  patchId(id, params) {
    return this.axios.patch(`${this.url}/${id}`, params)
  }

  patchAll(params) {
    return this.axios.patch(`${this.url}/updateBatch`, params)
  }
  getId(id, params, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      const qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
      return this.axios.get(this.url + '/' + id + params.join('/') + qs)
    }
    params = params || {}
    return this.axios.get(this.url + '/' + id, { params })
  }
  getSourceList(id, type, connId, sourceOrTarget) {
    if (connId) {
      return this.axios.get(
        `${this.url}/dataFlowTables?dataFlowId=${id}&type=${type}&connId=${connId}&sourceOrTarget=${sourceOrTarget}`
      )
    } else {
      return this.axios.get(`${this.url}/dataFlowTables?dataFlowId=${id}&type=${type}`)
    }
  }
  deleteAll(where) {
    if (typeof where === 'object') where = JSON.stringify(where)
    return this.axios.post(this.url + '/removeAll?where=' + encodeURIComponent(where))
  }
  resetAll(where) {
    if (typeof where === 'object') where = JSON.stringify(where)
    return this.axios.post(this.url + '/resetAll?id=' + encodeURIComponent(where))
  }
  saveStage(stages) {
    return this.axios.post(`${this.url}/stages`, stages)
  }
  relatedDataFlows(params) {
    return this.axios.get(this.url + '/relatedDataFlows', { params })
  }
  tableFlow(params) {
    return this.axios.get(this.url + '/tableFlow', { params })
  }
  batchUpdateListtags(params) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
  getOverview(params) {
    return this.axios.patch(`${this.url}/overview`, params)
  }
  getInsight(params) {
    return this.axios.patch(`${this.url}/insight`, params)
  }
  tranModelVersionControl(params) {
    return this.axios.post(this.url + '/tranModelVersionControl', params)
  }
  metadata(params) {
    return this.axios.post(this.url + '/metadata', params)
  }
  originalData(qualified_name) {
    return this.axios.get(this.url + '/originalData?qualified_name=' + encodeURIComponent(qualified_name))
  }
}
export { DataFlows }
