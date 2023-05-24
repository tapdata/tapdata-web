import Http from './Http'
import Cookie from '@tap/shared/src/cookie'

export default class JavascriptFunctions extends Http {
  constructor() {
    super('/api/Javascript_functions')
  }
  export(ids) {
    const href = this.url + `/batch/load?id=${ids.join('&id=')}&access_token=${Cookie.get('access_token')}`
    window.open(href)
  }
}
export { JavascriptFunctions }
