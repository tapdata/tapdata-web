import Http from './Http'

export default class App extends Http {
  constructor() {
    super('/api/app')
  }
  detail(id) {
    return this.axios.get(`${this.url}/detail/${id}`)
  }
  move(id, moveId) {
    return this.axios.put(`${this.url}/move/${id}`, {
      moveId
    })
  }
}
export { App }
