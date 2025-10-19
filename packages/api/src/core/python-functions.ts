import Cookie from '@tap/shared/src/cookie'

const BASE_URL = '/api/python-functions'

export function exportPythonFunctions(ids: string[]) {
  const href = `${BASE_URL}/batch/load?id=${ids.join('&id=')}&access_token=${Cookie.get('access_token')}`
  window.open(href)
}
