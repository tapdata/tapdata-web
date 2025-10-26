import Cookie from '@tap/shared/src/cookie'
import { requestClient } from '../request'

const BASE_URL = '/api/python-functions'

export function fetchPythonFunctions(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function exportPythonFunctions(ids: string[]) {
  const href = `${BASE_URL}/batch/load?id=${ids.join('&id=')}&access_token=${Cookie.get('access_token')}`
  window.open(href)
}
