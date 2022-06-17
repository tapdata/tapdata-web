import Http from './http'
export default class PreviewDataAPI extends Http {
  constructor() {
    super('/api/previewData')
  }
}
export { PreviewDataAPI }
