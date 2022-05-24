/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi'
import axios from '@/plugins/axios'

export default class DataFlows extends PublicAPI {
  constructor() {
    super('/api/DataFlows')
  }

  chart(id) {
    if (id) {
      return axios.get(`${this.url}/chart?user_id=${id}`)
    } else {
      return axios.get(this.url + '/chart')
    }
  }

  draft(params) {
    return axios.patch(this.url + '/draft', params)
  }

  copy(id) {
    return axios.post(`${this.url}/${id}/copy`)
  }

  reset(id) {
    return axios.post(`${this.url}/${id}/reset`)
  }
  create(params) {
    return axios.post(`${this.url}`, params)
  }
  patchId(id, params) {
    return axios.patch(`${this.url}/${id}`, params)
  }

  patchAll(params) {
    return axios.patch(`${this.url}/updateBatch`, params)
  }

  getId(id, params, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      let qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
      return axios.get(this.url + '/' + id + params.join('/') + qs)
    }
    params = params || {}
    return axios.get(this.url + '/' + id, { params })
  }
  getSourceList(id, type, connId, sourceOrTarget) {
    if (connId) {
      return axios.get(
        `${this.url}/dataFlowTables?dataFlowId=${id}&type=${type}&connId=${connId}&sourceOrTarget=${sourceOrTarget}`
      )
    } else {
      return axios.get(`${this.url}/dataFlowTables?dataFlowId=${id}&type=${type}`)
    }
  }
  deleteAll(where) {
    if (typeof where === 'object') where = JSON.stringify(where)
    return axios.post(this.url + '/removeAll?where=' + encodeURIComponent(where))
  }
  resetAll(params) {
    return axios.post(this.url + '/resetAll', params)
  }
  saveStage(stages) {
    return axios.post(`${this.url}/stages`, stages)
  }

  relatedDataFlows(params) {
    return axios.get(this.url + '/relatedDataFlows', { params })
  }
  tableFlow(params) {
    return axios.get(this.url + '/tableFlow', { params })
  }
  batchUpdateListtags(params) {
    return axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
  getOverview(params) {
    return axios.patch(`${this.url}/overview`, params)
  }
  getInsight(params) {
    return axios.patch(`${this.url}/insight`, params)
  }
  getMetadata(params) {
    return axios.post(this.url + '/metadata', params)
  }
  autoMetadata(params) {
    return axios.post(this.url + '/autoMetadata', params)
  }
  tranModelVersionControl(params) {
    return axios.post(this.url + '/tranModelVersionControl', params)
  }
  startBatch(params) {
    return axios.post(this.url + '/startBatch', params)
  }
  stopBatch(params) {
    return axios.post(this.url + '/stopBatch', params)
  }
}
