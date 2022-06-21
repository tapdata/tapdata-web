import Http from './Http'
export default class ValidationResultsAPI extends Http {
  constructor() {
    super('/api/InspectDetails')
  }
}
export { ValidationResultsAPI }
