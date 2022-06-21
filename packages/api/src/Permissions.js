import Http from './Http'

export default class Permissions extends Http {
  constructor() {
    super('/api/Permissions')
  }
}
export { Permissions }
