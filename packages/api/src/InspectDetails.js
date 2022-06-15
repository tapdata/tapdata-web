import Http from './http'
export default class InspectAPI extends Http {
  constructor() {
    super('/api/InspectDetails')
  }
}
export { InspectAPI }
