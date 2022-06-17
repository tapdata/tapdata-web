import Http from './http'

export default class Connections extends Http {
  constructor() {
    super('/api/Connections')
  }
  customQuery(id, params) {
    let url = `${this.url}/${id}` + '/customQuery?'
    for (let item in params) {
      url += item + '=' + params[item] + '&'
    }
    return this.axios.get(url).then(this.useData)
  }
  copy(id, params) {
    return this.axios.post(this.url + '/' + id + '/copy', params).then(this.useData)
  }
  deleteConnection(id, name) {
    return this.axios.delete(`${this.url}/${id}?name=${name}`).then(this.useData)
  }
  batchUpdateListtags(params) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params).then(this.useData)
  }
  check(id, params) {
    return this.axios.patch(`${this.url}/${id}`, params).then(this.useData)
  }
  patchId(params) {
    let id = params._id || params.id
    delete params._id
    delete params.id
    return this.axios.patch(`${this.url}/${id}`, params).then(this.useData)
  }
  update(params) {
    return this.axios
      .post(`${this.url}/update?where=` + encodeURIComponent(JSON.stringify({ _id: params.id })), params)
      .then(this.useData)
  }
  getNoSchema(id) {
    let url = `${this.url}/${id}` + '?noSchema=1'
    return this.axios.get(url).then(this.useData)
  }
  getAllowDatabaseType() {
    return this.axios.get(`${this.url}/databaseType`).then(this.useData)
  }
  findAll(filter) {
    return this.axios.get(`${this.url}/findAll?filter=` + encodeURIComponent(JSON.stringify(filter)))
  }
  listAll(filter) {
    return this.axios.get(`${this.url}/listAll?filter=` + encodeURIComponent(JSON.stringify(filter)))
  }
}

export { Connections }
