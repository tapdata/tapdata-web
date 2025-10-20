import { requestClient } from '../request'

const BASE_URL = '/api/LiveDataPlatform'

export function fetchLiveDataPlatform(params?: any, filter?: any) {
  if (Array.isArray(params)) {
    let queryStr = ''
    if (typeof filter === 'object') {
      queryStr = JSON.stringify(filter)
    } else if (typeof filter === 'string') {
      queryStr = filter
    }
    const qs = queryStr ? `?filter=${encodeURIComponent(queryStr)}` : ''
    return requestClient.get(`${BASE_URL}/${params.join('/')}${qs}`)
  } else if (typeof params === 'string') {
    return requestClient.get(`${BASE_URL}/${params}`, { params: filter })
  }
  params = params || {}
  return requestClient.get(BASE_URL, { params })
}

export function createLiveDataPlatform(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function updateLiveDataPlatformById(id: string, attributes: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, attributes)
}

export function deleteLiveDataPlatformById(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function countLiveDataPlatform(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function findOneLiveDataPlatform(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateLiveDataPlatform(where: any, attributes: any) {
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

export function patchLiveDataPlatform(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}
