import Http from './Http'
export default class Discovery extends Http {
  constructor() {
    super('/api/discovery')
  }
  list() {
    return this.axios.get('https://mock.apifox.cn/m1/1293445-0-default/api/discovery')
  }
  overView(id: string) {
    return this.axios.get('https://mock.apifox.cn/m1/1293445-0-default/api/discovery/storage/overview/' + id)
  }
  preview(id: string) {
    return this.axios.get(this.url + '/storage/preview/' + id)
  }
}
export { Discovery }
