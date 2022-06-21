import Http from './Http'
export default class PreviewDataAPI extends Http {
  constructor() {
    super('/api/previewData')
  }
}
export { PreviewDataAPI }
