import Http from './Http'
export default class Webhook extends Http {
  constructor() {
    super('/api/webhook')
  }

  list(params) {
    return this.axios.get(`${this.url}/list`, { params })
  }

  save(params) {
    return this.axios.post(`${this.url}/create`, params)
  }

  update(params) {
    return this.axios.post(`${this.url}/update`, params)
  }

  close(id) {
    return this.axios.post(`${this.url}/closeOne/${id}`)
  }

  open(id) {
    return this.axios.post(`${this.url}/re-open-one/${id}`)
  }

  ping(data) {
    return this.axios.post(`${this.url}/ping`, data)
  }

  history(data) {
    return this.axios.get(`${this.url}/history/list`, {
      data
    })
  }

  resend(id, hookId) {
    return this.axios.post(`${this.url}/re-send`, {
      id,
      hookId
    })
  }
}
export { Webhook }
