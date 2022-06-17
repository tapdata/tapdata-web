import Http from './Http'

export default class Settings extends Http {
  constructor() {
    super('/api/Settings')
  }
}
export { Settings }
