import axios from 'axios'
import PublicAPI from './publicApi'

export default class LogcollectorApi extends PublicAPI {
  constructor() {
    super('/api/logcollector')
  }

  get(params) {
    if (Array.isArray(params)) {
      return axios.get(this.url + '/' + params.join('/'))
    }
    if (params.url) {
      return axios.get(params.url)
    }
    params = params || {}
    return axios.get(this.url, { params })
  }

  patch(id, params) {
    return axios.patch(`${this.url}/${id}`, params)
  }
}
