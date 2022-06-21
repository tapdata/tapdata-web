import Http from './Http'

export default class DataFlowStagesAPI extends Http {
  constructor() {
    super('/api/DataFlowStages')
  }
}
export { DataFlowStagesAPI }
