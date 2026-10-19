import { downloadAuthenticated } from './download'
import Http from './Http'

export default class JavascriptFunctions extends Http {
  constructor() {
    super('/api/Javascript_functions')
  }
  export(ids) {
    return downloadAuthenticated(
      `${this.url}/batch/load?id=${ids.join('&id=')}`,
    )
  }
}
export { JavascriptFunctions }
