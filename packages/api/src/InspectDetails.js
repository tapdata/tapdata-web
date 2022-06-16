import Http from './http'
export default class InspectDetailsAPI extends Http {
  constructor() {
    super('/api/InspectDetails')
  }
}
export { InspectDetailsAPI }
