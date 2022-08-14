import Http from './Http'

export default class Measurement extends Http {
  constructor() {
    super('/api/verify')
  }
}
export { Measurement }
