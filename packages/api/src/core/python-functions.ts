import { downloadAuthenticated } from '../download'
import { requestClient } from '../request'

const BASE_URL = '/api/python-functions'

export function fetchPythonFunctions(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function exportPythonFunctions(ids: string[]) {
  return downloadAuthenticated(`${BASE_URL}/batch/load?id=${ids.join('&id=')}`)
}
