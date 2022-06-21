import Http from './Http'

export default class Metrics extends Http {
  constructor() {
    super('/api/Metrics')
  }
}
export { Metrics }
