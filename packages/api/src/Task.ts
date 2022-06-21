import Http from './Http'
import Cookie from '@tap/shared/src/cookie'

export default class Task extends Http {
  constructor() {
    super('/api/Task')
  }

  /**
   * 确认保存
   * @param params
   * @returns {*}
   */
  copy(id) {
    return this.axios.put(this.url + `/copy/${id}`)
  }

  pause(id) {
    return this.axios.put(this.url + `/pause/${id}`)
  }
  batchDelete(ids) {
    return this.axios.delete(this.url + `/batchDelete?taskIds=` + ids.join('&taskIds='))
  }
  batchRenew(ids) {
    return this.axios.patch(this.url + `/batchRenew?taskIds=` + ids.join('&taskIds='))
  }
  batchStop(ids) {
    return this.axios.put(this.url + `/batchStop?taskIds=` + ids.join('&taskIds='))
  }

  patchId(id, params) {
    return this.axios.patch(`${this.url}/${id}`, params)
  }

  findTaskDetailById(id) {
    return this.axios.get(this.url + '/findTaskDetailById/' + id)
  }
  tranModelVersionControl(params) {
    return this.axios.post(this.url + '/tranModelVersionControl', params)
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
  edit(params) {
    return this.axios.patch(this.url + '/confirm/' + params.id, params)
  }

  export(ids) {
    const href = this.url + `/batch/load?taskId=${ids.join('&taskId=')}&access_token=${Cookie.get('token')}`
    window.open(href)
  }
  checkRun(id) {
    return this.axios.get(this.url + '/checkRun/' + id)
  }

  batchUpdateListtags(params) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
  save(params) {
    return this.axios.patch(this.url + '/confirm/' + params.id, params).then(this.useData)
  }

  saveAndStart(params) {
    return this.axios.patch(this.url + '/confirmStart/' + params.id, params).then(this.useData)
  }

  getMetadata(params) {
    return this.axios.post(this.url + '/metadata', params).then(this.useData)
  }

  start(id) {
    return this.axios.put(this.url + `/start/${id}`).then(this.useData)
  }

  batchStart(taskIds) {
    return this.axios.put(this.url + `/batchStart?taskIds=` + taskIds.join('&taskIds='))
    //return this.axios.put(this.url + `/batchStart`, qs.stringify({ taskIds })).then(this.useData)
  }

  stop(id) {
    return this.axios.put(this.url + `/stop/${id}`).then(this.useData)
  }

  forceStop(id) {
    return this.axios.put(this.url + `/stop/${id}?force=true`).then(this.useData)
  }

  reset(id) {
    return this.axios.put(this.url + `/renew/${id}`).then(this.useData)
  }

  chart(id) {
    if (id) {
      return this.axios.get(`${this.url}/chart?user_id=${id}`).then(this.useData)
    } else {
      return this.axios.get(this.url + '/chart').then(this.useData)
    }
  }

  checkName(name, id) {
    if (id) {
      return this.axios.post(this.url + '/checkName?name=' + name + '&id=' + id).then(this.useData)
    } else {
      return this.axios.post(this.url + '/checkName?name=' + name).then(this.useData)
    }
  }
}
export { Task }
