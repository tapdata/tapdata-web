import Http from './http'

export default class DictionariesAPI extends Http {
  constructor() {
    super('/api/Dictionaries')
  }

  post(params) {
    if (params.uri) {
      return this.axios.post(`${this.url}/${params.uri}`, params)
    }
    return this.axios.post(this.url, params)
  }

  patch(params) {
    return this.axios.patch(`${this.url}/${params.id}`, params)
  }
  delete(id, name) {
    if (name == '') {
      return this.axios.delete(`${this.url}/${id}`)
    } else {
      return this.axios.delete(`${this.url}/${id}?name=${name}`)
    }
  }
  // count(params) {
  //   return axios.get(this.url + '/count', { params })
  // }
}
export { DictionariesAPI }
