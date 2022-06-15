import Http from './http'

export default class SharedCacheAPI extends Http {
  constructor() {
    super('/api/shareCache')
  }
  findOne(id) {
    return axios.get(`${this.url}/${id}`)
  }
  patch(params) {
    return axios.patch(`${this.url}/${params.id}`, params)
  }
}
export { SharedCacheAPI }
