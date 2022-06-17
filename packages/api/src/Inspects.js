import Http from './Http'
export default class InspectAPI extends Http {
  constructor() {
    super('/api/Inspects')
  }
}
export { InspectAPI }
