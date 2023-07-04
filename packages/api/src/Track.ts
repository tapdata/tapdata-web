import Http from './Http'

export default class Track extends Http {
  constructor() {
    super('/api/track')
  }

  sendConvertData(params) {
    return this.axios.post(`${this.url}/send_convert_data`, params)
  }
}
export { Track }
