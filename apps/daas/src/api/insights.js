import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class Insights extends PublicAPI {
  constructor() {
    super('/api/Insights')
  }

  count(params) {
    return axios.get(this.url + '/count', { params })
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

  findOne(params) {
    return axios.get(this.url + '/findOne', { params })
  }
}
