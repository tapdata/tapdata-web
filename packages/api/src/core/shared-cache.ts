import { requestClient } from '../request'

const BASE_URL = '/api/shareCache'

export function fetchSharedCache(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function findOneSharedCache(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

export function patchSharedCache(params: any) {
  return requestClient.patch(`${BASE_URL}/${params.id}`, params)
}

export function createSharedCache(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function deleteSharedCache(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}
