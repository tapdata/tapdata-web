import Http from './http'

export default class NodeConfigs extends Http {
  constructor() {
    super('/api/nodeConfigs')
  }
}
export { NodeConfigs }
