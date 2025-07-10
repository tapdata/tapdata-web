import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/ApiServers'

// {
//     "id": "5d0c286d81baf819b6f014bd",
//     "clientName": "Default APIServer",
//     "clientURI": "http://58.251.34.123:3080",
//     "processId": "f3ebe1b88623ca4f933af4e27f4075a0",
//     "user_id": "62bc5008d4958d013d97c7a6"
//   }

export interface ApiServer {
  id: string
  clientName: string
  clientURI: string
  processId: string
  user_id: string
}

export function fetchApiServers(filter: Filter) {
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
