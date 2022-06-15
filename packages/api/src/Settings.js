import Http from './http'

export default class Settings extends Http {
  constructor() {
    super('/api/Settings')
  }
}
export { Settings }
