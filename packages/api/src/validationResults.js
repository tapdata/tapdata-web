import Http from './Http'
export default class ValidationResultsAPI extends Http {
  constructor() {
    super('/api/ValidationResults')
  }
}
export { ValidationResultsAPI }
