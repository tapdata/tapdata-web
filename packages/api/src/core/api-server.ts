import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/ApiServers'

export const API_SERVER_BASE_URL = BASE_URL

export interface ApiServer {
  id: string
  clientName: string
  clientURI: string
  processId: string
  user_id: string
}

export function fetchApiServers(filter?: Filter) {
  return requestClient.get<PageFetchResult<ApiServer>>(String(BASE_URL), {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}

export function deleteApiServer(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createApiServer(data: Partial<ApiServer>) {
  return requestClient.post(BASE_URL, data)
}

export function updateApiServer(id: string, data: Partial<ApiServer>) {
  return requestClient.patch(`${BASE_URL}/${id}`, data)
}
