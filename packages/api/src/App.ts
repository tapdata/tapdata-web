import Http from './Http'

export default class App extends Http {
  constructor() {
    super('/api/app')
  }
  detail(id) {
    return this.axios.get(`${this.url}/detail/${id}`)
  }
}
export { App }
