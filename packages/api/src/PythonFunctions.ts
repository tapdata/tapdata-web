import Cookie from '@tap/shared/src/cookie'
import Http from './Http'

export default class PythonFunctions extends Http {
  constructor() {
    super('/api/python-functions')
  }
  export(ids) {
    const href = `${
      this.url
    }/batch/load?id=${ids.join('&id=')}&access_token=${Cookie.get('access_token')}`
    window.open(href)
  }
}
export { PythonFunctions }
