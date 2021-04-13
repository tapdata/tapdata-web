import PublicApi from './publicApi'

export default class DictionariesAPI extends PublicApi {
  constructor() {
    super('/api/Dictionaries')
  }
}
