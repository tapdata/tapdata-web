import Http from './http'
export default class ValidationResultsAPI extends Http {
  constructor() {
    super('/api/ValidationResults')
  }
}
export { ValidationResultsAPI }
