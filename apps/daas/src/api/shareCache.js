import PublicAPI from './publicApi'
import axios from 'axios'

export default class SharedCacheAPI extends PublicAPI {
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
