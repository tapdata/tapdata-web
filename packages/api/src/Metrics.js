import Http from './http'

export default class Metrics extends Http {
  constructor() {
    super('/api/Metrics')
  }
}
export { Metrics }
