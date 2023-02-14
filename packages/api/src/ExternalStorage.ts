import Http from './Http'

export default class ExternalStorage extends Http {
  constructor() {
    super('/api/ExternalStorage')
  }
  changeExternalStorage(id) {
    return this.axios.patch(this.url + '/' + id + '/default')
  }
}
export { ExternalStorage }
