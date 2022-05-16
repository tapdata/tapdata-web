import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class DataRules extends PublicAPI {
  constructor() {
    super('/api/DataRules')
  }

  get(params) {
    if (Array.isArray(params)) {
      return axios.get(this.url + '/' + params.join('/'))
    }
    params = params || {}
    return axios.get(this.url, { params })
  }
}
