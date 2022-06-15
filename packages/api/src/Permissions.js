import Http from './http'

export default class Permissions extends Http {
  constructor() {
    super('/api/Permissions')
  }
}
export { Permissions }
