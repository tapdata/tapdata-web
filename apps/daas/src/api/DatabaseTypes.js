import PublicAPI from './publicApi'
import axios from 'axios'

export default class extends PublicAPI {
  constructor() {
    super('/api/DatabaseTypes')
  }
  pdkHash(pdkHash) {
    return axios.get(this.url + '/pdkHash/' + pdkHash)
  }
}
