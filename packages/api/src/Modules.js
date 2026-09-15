import { downloadAuthenticated } from './download'
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
    return this.axios.get(`${this.url}/getApiDocument?id=${id}`)
  }

  getByCollectionName(params) {
    return this.axios.get(`${this.url}/api/getByCollectionName`, { params })
  }

  getSchema(id) {
    return this.axios.get(`${this.url}/getSchema/${id}`)
  }

  getdata(id) {
    return this.axios.get(`${this.url}/getSchema/${id.mondeid}`)
  }

  batchUpdateListtags(params) {
    return this.axios.patch(`${this.url}/batchUpdateListtags`, params)
  }

  apiList(params) {
    return this.axios.get(`${this.url}/apiList`, { params })
  }

  export(ids) {
    return downloadAuthenticated(
      `${this.url}/batch/load?id=${ids.join('&id=')}`,
    )
  }

  apiExport(ids, ip) {
    return downloadAuthenticated(
      `${this.url}/api/export?id=${ids.join('&id=')}&ip=${ip}`,
    )
  }

  updatePermissions(data) {
    return this.axios.patch(`${this.url}/updatePermissions`, data)
  }

  updateTags(data) {
    return this.axios.patch(`${this.url}/updateTags`, data)
  }

  batchUpdate(modules) {
    return this.axios.patch(`${this.url}/batchUpdate`, modules)
  }
}
export { Modules }
