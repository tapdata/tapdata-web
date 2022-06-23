import Http from './Http'

export default class DataFlowInsights extends Http {
  constructor() {
    super('/api/DataFlowInsights')
  }
}
export { DataFlowInsights }
