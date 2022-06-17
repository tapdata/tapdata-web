import Http from './http'

export default class SharedCache extends Http {
  constructor() {
    super('/api/shareCache')
  }
  findOne(id) {
    return this.axios.get(`${this.url}/${id}`)
  }
  patch(params) {
    return this.axios.patch(`${this.url}/${params.id}`, params)
  }
}
export { SharedCache }
