import PublicApi from './PublicApi'
export default class TaskAPI extends PublicApi {
  constructor() {
    super('/api/Task')
  }
}
