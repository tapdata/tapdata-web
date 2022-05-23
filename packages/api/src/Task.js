import Http from './http'
import qs from 'qs'

export class Task extends Http {
  constructor() {
    super('/api/Task')
  }

  /**
   * 确认保存
   * @param params
   * @returns {*}
   */
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
    // return this.axios.put(this.url + `/batchStart?taskIds=` + ids.join('&taskIds='))
    return this.axios.put(this.url + `/batchStart`, qs.stringify({ taskIds })).then(this.useData)
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
