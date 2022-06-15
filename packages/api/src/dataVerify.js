import Http from './http'
export default class ValidationResultsAPI extends Http {
  constructor() {
    super('/api/InspectDetails')
  }
}
export { ValidationResultsAPI }
