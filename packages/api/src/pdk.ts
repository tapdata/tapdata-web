import Http from './http'

export default class PDK extends Http {
  constructor() {
    super('/api/pdk')
  }
  doc(pdkHash) {
    let url = `${this.url}/doc?pdkHash=${pdkHash}`
    return this.axios.get(url, {
      responseType: 'blob'
    })
  }
}
export { PDK }
