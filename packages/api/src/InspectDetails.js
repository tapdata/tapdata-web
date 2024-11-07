import Http from './Http'
export default class InspectDetailsAPI extends Http {
  constructor() {
    super('/api/InspectDetails')
  }

  export(inspectResultId, fullField) {
    return this.axios.post(
      `${this.url}/export`,
      {
        inspectResultId,
        fullField
      },
      {
        responseType: 'blob'
      }
    )
  }
}
export { InspectDetailsAPI }
