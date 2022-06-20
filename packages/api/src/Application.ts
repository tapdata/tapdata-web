import Http from './Http'

export default class Applications extends Http {
  constructor() {
    super('/api/Applications')
  }
}

export { Applications }
