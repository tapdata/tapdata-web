import Http from './http'

export default class Pdk extends Http {
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
export { Pdk }
