import { requestClient } from '../request'
import { isPlainObj } from '@tap/shared'

const BASE_URL = '/api/Connections'

export function fetchConnections(params: any = {}, filter?: any) {
  if (Array.isArray(params)) {
    filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
    const qs = filter ? `?filter=${encodeURIComponent(filter)}` : ''
    return requestClient.get(`${BASE_URL}/${params.join('/')}${qs}`)
  } else if (typeof params === 'string') {
    return requestClient.get(`${BASE_URL}/${params}`, { params: filter })
  }

  const config = { params }
  if (isPlainObj(filter)) {
    Object.assign(config, filter)
  }
  return requestClient.get(BASE_URL, config)
}

export function customQuery(id: string, params: { [key: string]: unknown }) {
  let url = `${BASE_URL}/${id}` + '/customQuery?'
  for (const item in params) {
    url += `${item}=${params[item]}&`
  }
  return requestClient.get(url)
}

export function copyConnection(id: string, params: any) {
  return requestClient.post(`${BASE_URL}/${id}/copy`, params)
}

export function batchUpdateListtags(params: any) {
  return requestClient.patch(`${BASE_URL}/batchUpdateListtags`, params)
}

export function checkConnection(id: string, params: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function getConnectionNoSchema(id: string) {
  const url = `${BASE_URL}/${id}` + '?noSchema=1'
  return requestClient.get(url)
}

export function getAllowDatabaseType() {
  return requestClient.get(`${BASE_URL}/databaseType`)
}

export function patchConnectionById(params: any) {
  const id = params._id || params.id
  delete params._id
  delete params.id
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function findAllConnections(filter: any) {
  return requestClient.get(
    `${BASE_URL}/findAll?filter=${encodeURIComponent(
      JSON.stringify(filter),
    )}`,
  )
}

export function listAllConnections(filter: any) {
  return requestClient.get(
    `${BASE_URL}/listAll?filter=${encodeURIComponent(
      JSON.stringify(filter),
    )}`,
  )
}

export function checkConnectionTask(id: string) {
  return requestClient.get(`${BASE_URL}/task/${id}/10`)
}

export function getConnectionStats() {
  return requestClient.get(`${BASE_URL}/stats`)
}

export function createConnection(params: any, urlParams?: any) {
  let url = BASE_URL
  if (urlParams) {
    for (const key in urlParams) {
      url += `?${key}=${urlParams[key]}`
    }
  }
  return requestClient.post(url, params)
}

export function getHeartbeatTask(connectionId: string) {
  return requestClient.get(`${BASE_URL}/${connectionId}/heartbeat-task`)
}

export function getUsingDigginTaskByConnectionId(connectionId: string) {
  return requestClient.get(
    `${BASE_URL}/${connectionId}/usingDigginTaskByConnectionId`,
  )
}

export function getDatabaseTypes() {
  return requestClient.get(`${BASE_URL}/databaseTypes`)
}

// Base Http methods that are used in the codebase
export function countConnections(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function deleteConnection(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function updateConnection(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneConnection(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}
