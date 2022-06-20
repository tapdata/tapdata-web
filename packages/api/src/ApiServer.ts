import Http from './Http'

export default class ApiServer extends Http {
  constructor() {
    super('/api/ApiServers')
  }
}
export { ApiServer }
