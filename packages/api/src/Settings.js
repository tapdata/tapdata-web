import Http from './http'

export class Settings extends Http {
  constructor() {
    super('/api/Settings')
  }
}
