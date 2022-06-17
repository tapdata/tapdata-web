import Http from './Http'

export default class ScheduleTasks extends Http {
  constructor() {
    super('/api/TaskHistories')
  }
}
export { ScheduleTasks }
