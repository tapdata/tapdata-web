import Http from './http'

export default class DataFlowStagesAPI extends Http {
  constructor() {
    super('/api/DataFlowStages')
  }
}
export { DataFlowStagesAPI }
