import Http from './Http'

export default class NodeConfigs extends Http {
  constructor() {
    super('/api/nodeConfigs')
  }
}
export { NodeConfigs }
