import Http from './Http'

export default class Modules extends Http {
  constructor() {
    super('/api/Modules')
  }
  post(params, name) {
    if (name) {
      return this.axios.post(`${this.url}/${params.uri}`, params)
    }

    if (params.uri) {
      return this.axios.post(`${this.url}/${params.uri}`, params)
    }

    return this.axios.post(this.url, params)
  }

  delete(id, name) {
    if (name == '') {
      return this.axios.delete(`${this.url}/${id}`)
    } else {
      return this.axios.delete(`${this.url}/${id}?tablename=${name}`)
    }
  }

  getApiDocument(id) {
    return this.axios.get(this.url + '/getApiDocument?id=' + id)
  }

  getByCollectionName(params) {
    return this.axios.get(this.url + '/api/getByCollectionName', { params })
  }

  getSchema(id) {
    return this.axios.get(this.url + '/getSchema/' + id)
  }

  getdata(id) {
    return this.axios.get(this.url + '/getSchema/' + id.mondeid)
  }

  batchUpdateListtags(params) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params)
  }

  apiList(params) {
    return this.axios.get(`${this.url}/apiList`, { params })
  }
}
export { Modules }
