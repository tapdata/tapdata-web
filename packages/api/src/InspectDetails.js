import Http from './Http'
export default class InspectDetailsAPI extends Http {
  constructor() {
    super('/api/InspectDetails')
  }

  export(inspectResultId) {
    return this.axios.post(
      `${this.url}/export`,
      {
        inspectResultId
      },
      {
        responseType: 'blob'
      }
    )
  }
}
export { InspectDetailsAPI }
