import PublicAPI from './PublicApi'

export class CustomNode extends PublicAPI {
  constructor() {
    super('/api/customNode')
  }
}
