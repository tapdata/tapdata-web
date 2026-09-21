import { downloadAuthenticated } from './download'
import Http from './Http'

export default class PythonFunctions extends Http {
  constructor() {
    super('/api/python-functions')
  }
  export(ids) {
    return downloadAuthenticated(
      `${this.url}/batch/load?id=${ids.join('&id=')}`,
    )
  }
}
export { PythonFunctions }
