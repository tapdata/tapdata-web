import Http from './Http'
export default class InspectResultsAPI extends Http {
  constructor() {
    super('/api/InspectResults')
  }
}
export { InspectResultsAPI }
