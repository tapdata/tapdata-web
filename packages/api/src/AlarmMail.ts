import Http from './Http'
export default class AlarmMail extends Http {
  constructor() {
    super('/api/alarmMail')
  }

  save(params) {
    return this.axios.post(`${this.url}/save`, params)
  }
}
export { AlarmMail }
