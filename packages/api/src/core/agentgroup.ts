import { requestClient, type PageFetchResult } from '../request'

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
export function fetchAgentGroups(params?: any) {
  return requestClient.get<PageFetchResult<any>>(BASE_URL, {
    params,
  })
}

export function deleteAgentGroup(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}
