import Cookie from '@tap/shared/src/cookie'
import { requestClient } from '../request'

const BASE_URL = '/api/Javascript_functions'

export function fetchFunctions(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function getFunctionById(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

export function createFunction(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function patchFunction(params: any) {
  return requestClient.patch(BASE_URL, params)
}

export function updateFunctionById(id: string, attributes: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, attributes)
}

export function deleteFunctionById(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function countFunctions(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function findOneFunction(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateFunction(where: any, attributes: any) {
  let queryStr = ''
  if (typeof where === 'object') {
    queryStr = JSON.stringify(where)
  }
  if (typeof where === 'string') {
    queryStr = where
  }
  return requestClient.post(
    `${BASE_URL}/execute?where=${encodeURIComponent(queryStr)}`,
    attributes,
  )
}

export function exportFunctions(ids: string[]) {
  const href = `${BASE_URL}/batch/load?id=${ids.join('&id=')}&access_token=${Cookie.get('access_token')}`
  window.open(href)
}
