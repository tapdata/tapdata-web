import Http from './http'

export default class LogsAPI extends Http {
  constructor() {
    super('/api/Logs')
  }
}
export { LogsAPI }
