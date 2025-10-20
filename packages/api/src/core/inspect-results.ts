import { requestClient } from '../request'

const BASE_URL = '/api/InspectResults'

export function fetchInspectResults(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function getInspectResultById(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

export function createInspectResult(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function updateInspectResultById(id: string, attributes: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, attributes)
}

export function deleteInspectResultById(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function countInspectResults(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function findOneInspectResult(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateInspectResult(where: any, attributes: any) {
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
