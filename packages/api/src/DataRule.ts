import Http from './Http'

export default class DataRulesAPI extends Http {
  constructor() {
    super('/api/DataRules')
  }
}
export { DataRulesAPI }
