import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/Applications'

export interface ApiClient {
  id: string
  name: string
  lastUpdBy: string
  createUser: string
  clientId: string
  clientName: string
  clientType: string
  grantTypes: string[]
  tokenType: string
  clientSecret: string
  scopes: string[]
  scopeNames: string[]
  redirectUris: string[]
  clientAuthenticationMethods: string[]
  clientSettings: string
  tokenSettings: string
  createTime: string
}

export function fetchApiClients(filter?: Filter) {
  return requestClient.get<PageFetchResult<ApiClient>>(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function deleteApiClient(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createApiClient(client: any) {
  return requestClient.post(BASE_URL, client)
}

export function updateApiClient(client: any) {
  return requestClient.patch(BASE_URL, client)
}
