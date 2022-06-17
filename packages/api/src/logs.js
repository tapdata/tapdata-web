import Http from './Http'

export default class LogsAPI extends Http {
  constructor() {
    super('/api/Logs')
  }
}
export { LogsAPI }
