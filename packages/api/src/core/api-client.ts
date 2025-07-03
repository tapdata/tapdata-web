import {
  baseRequestClient,
  requestClient,
  type Filter,
  type PageFetchResult,
} from '../request'

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

export async function fetchApiServerToken() {
  const apiToken = localStorage.getItem('__api_server_token') || ''
  if (apiToken) {
    return apiToken
  }

  const clientInfo: any = await requestClient.get(BASE_URL, {
    params: {
      filter: JSON.stringify({
        where: {
          id: '5c0e750b7a5cd42464a5099d',
        },
      }),
    },
  })
  const clientInfoItem = clientInfo?.items[0] || {}
  const data = `grant_type=client_credentials&client_id=${clientInfoItem.id}&client_secret=${clientInfoItem.clientSecret}`
  const result = await baseRequestClient.post('/oauth/token', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  const token = result?.data?.access_token || ''

  localStorage.setItem('__api_server_token', token)

  return token
}
