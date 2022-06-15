import Http from './http'

export default class ScheduleTasks extends Http {
  constructor() {
    super('/api/TaskHistories')
  }
}
export { ScheduleTasks }
