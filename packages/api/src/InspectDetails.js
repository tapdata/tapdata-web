import Http from './Http'
export default class InspectDetailsAPI extends Http {
  constructor() {
    super('/api/InspectDetails')
  }
}
export { InspectDetailsAPI }
