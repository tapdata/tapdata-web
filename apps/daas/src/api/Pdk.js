import axios from '@/plugins/axios'
import PublicAPI from './publicApi'

export default class Pdk extends PublicAPI {
  constructor() {
    super('/api/pdk')
  }
  doc(pdkHash) {
    let url = `${this.url}/doc?pdkHash=${pdkHash}`
    return axios.get(url, {
      responseType: 'blob'
    })
  }
}
