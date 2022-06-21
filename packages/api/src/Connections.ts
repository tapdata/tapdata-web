import Http from './Http'

export default class Connections extends Http {
  constructor() {
    super('/api/Connections')
  }
  customQuery(id, params) {
    let url = `${this.url}/${id}` + '/customQuery?'
    for (let item in params) {
      url += item + '=' + params[item] + '&'
    }
    return this.axios.get(url)
  }
  copy(id, params) {
    return this.axios.post(this.url + '/' + id + '/copy', params)
  }
  deleteConnection(id, name) {
    return this.axios.delete(`${this.url}/${id}?name=${name}`)
  }
  batchUpdateListtags(params) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params)
  }
  check(id, params) {
    return this.axios.patch(`${this.url}/${id}`, params)
  }
  patchId(params) {
    let id = params._id || params.id
    delete params._id
    delete params.id
    return this.axios.patch(`${this.url}/${id}`, params)
  }
  update(params) {
    return this.axios.post(`${this.url}/update?where=` + encodeURIComponent(JSON.stringify({ _id: params.id })), params)
  }
  getNoSchema(id) {
    let url = `${this.url}/${id}` + '?noSchema=1'
    return this.axios.get(url)
  }
  getAllowDatabaseType() {
    return this.axios.get(`${this.url}/databaseType`)
  }
  findAll(filter) {
    return this.axios.get(`${this.url}/findAll?filter=` + encodeURIComponent(JSON.stringify(filter)))
  }
  listAll(filter) {
    return this.axios.get(`${this.url}/listAll?filter=` + encodeURIComponent(JSON.stringify(filter)))
  }
}

export { Connections }
