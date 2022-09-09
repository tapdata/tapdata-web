import Http from './Http'

export default class ExternalStorage extends Http {
  constructor() {
    super('/api/ExternalStorage')
  }
}

export { ExternalStorage }
