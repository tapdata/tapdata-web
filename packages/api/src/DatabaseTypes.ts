import Http from './Http'

export default class DatabaseTypes extends Http {
  constructor() {
    super('/api/DatabaseTypes')
  }
  pdkHash(pdkHash: string) {
    return this.axios.get(this.url + '/pdkHash/' + pdkHash)
  }
  getDatabases(params) {
    return this.axios.get(this.url + '/getDatabases', { params })
  }
}
export { DatabaseTypes }
