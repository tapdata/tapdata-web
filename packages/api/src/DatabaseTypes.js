import PublicAPI from './PublicApi'
import axios from './axios'

export class DatabaseTypes extends PublicAPI {
  constructor() {
    super('/api/DatabaseTypes')
  }
  pdkHash(pdkHash) {
    return axios.get(this.url + '/pdkHash/' + pdkHash)
  }
}
