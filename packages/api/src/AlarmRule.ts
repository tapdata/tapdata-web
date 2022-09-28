import Http from './Http'
export default class AlarmRuleAPI extends Http {
  constructor() {
    super('/api/alarm_rule')
  }
  find() {
    return this.axios.get(`${this.url}/find`)
  }

  save(params: object) {
    return this.axios.post(`${this.url}/save`, params)
  }
}
export { AlarmRuleAPI }
