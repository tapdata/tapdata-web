import { downloadAuthenticated } from '../download'

const BASE_URL = '/api/Javascript_functions'

export function exportJavascriptFunctions(ids: string[]) {
  return downloadAuthenticated(`${BASE_URL}/batch/load?id=${ids.join('&id=')}`)
}
