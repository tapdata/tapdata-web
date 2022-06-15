import Http from './http'

export default class file extends Http {
  constructor() {
    super('/api/file')
  }
  upload(params) {
    return axios.post(this.url + '/upload', params)
  }
  removeFile(id) {
    return axios.delete(this.url + '/delete?id=' + id)
  }
}
export { file }
