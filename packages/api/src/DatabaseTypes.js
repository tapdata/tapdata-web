import Http from './http'

export class DatabaseTypes extends Http {
  constructor() {
    super('/api/DatabaseTypes')
  }
  pdkHash(pdkHash) {
    return this.axios.get(this.url + '/pdkHash/' + pdkHash).then(this.useData)
  }
}
