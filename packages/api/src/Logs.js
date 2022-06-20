import Http from './Http'

export default class Logs extends Http {
  constructor() {
    super('/api/Logs')
  }
}
export { Logs }
