import Http from './Http'

export default class Applications extends Http {
  constructor() {
    super('/api/Applications')
  }

  findOne(params) {
    params = params || {}
    return this.axios.get(this.url + '/findOne', { params })
  }
}

export { Applications }
