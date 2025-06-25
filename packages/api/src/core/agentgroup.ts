import { requestClient } from '../request'

const BASE_URL = '/api/agent-group'

export function saveAgentGroup(params: any) {
  return requestClient.post(`${BASE_URL}/create-group`, params)
}

export function updateAgentGroup(params: any) {
  return requestClient.post(`${BASE_URL}/update-group`, params)
}

export function updateAgent(params: any) {
  return requestClient.post(`${BASE_URL}/batch-modify`, params)
}

export function addAgent(params: any) {
  return requestClient.post(`${BASE_URL}/add-agent`, params)
}

// Base Http methods that are used in the codebase
export function fetchAgentGroups(params?: any, filter?: any) {
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

export function deleteAgentGroup(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}
