import Http from './http'
export default class InspectResultsAPI extends Http {
  constructor() {
    super('/api/InspectResults')
  }
}
export { InspectResultsAPI }
