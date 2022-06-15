import Http from './http'

export default class DataRulesAPI extends Http {
  constructor() {
    super('/api/DataRules')
  }
}
export { DataRulesAPI }
