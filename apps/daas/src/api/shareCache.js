import PublicAPI from './publicApi'

export default class SharedCacheAPI extends PublicAPI {
  constructor() {
    super('/api/sharedCache')
  }
}
