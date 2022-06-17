import Http from './Http'

export default class File extends Http {
  constructor() {
    super('/api/file')
  }
  upload(params) {
    return this.axios.post(this.url + '/upload', params)
  }
  removeFile(id) {
    return this.axios.delete(this.url + '/delete?id=' + id)
  }
}
export { File }
