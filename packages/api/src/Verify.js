import Http from './Http'
export default class VerifyAPI extends Http {
  constructor() {
    super('/api/verify')
  }
}
export { VerifyAPI }
