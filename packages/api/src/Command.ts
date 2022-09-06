import Http from './Http'

export default class Command extends Http {
  constructor() {
    super('/api/Command')
  }
  codding(params) {
    return this.axios.post(`http://127.0.0.1:4523/m1/1293445-0-default/api/Command`, params)
  }
}

export { Command }
