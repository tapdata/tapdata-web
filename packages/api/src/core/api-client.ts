import {
  baseRequestClient,
  requestClient,
  type Filter,
  type PageFetchResult,
} from '../request'

import { revealClientSecret } from './audit-events'
import type { ApiModule } from './modules'

const BASE_URL = '/api/Applications'

export interface ApiClientVo {
  id: string
  name: string
  lastUpdBy: string
  createUser: string
  clientId: string
  clientName: string
  clientType: string
  grantTypes: string[]
  tokenType: string
  clientSecretConfigured: boolean
  scopes: string[]
  scopeNames: string[]
  redirectUris: string[]
  clientAuthenticationMethods: string[]
  clientSettings: string
  tokenSettings: string
  createTime: string
}

export function fetchApiClients(filter?: Filter) {
  return requestClient.get<PageFetchResult<ApiClientVo>>(BASE_URL, {
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
  if (!clientInfoItem.id) throw new Error('API client not found')
  const secret = await revealClientSecret(clientInfoItem.id)
  const data = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientInfoItem.id,
    client_secret: secret,
  }).toString()
  try {
    const result = await baseRequestClient.post('/oauth/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        debug: 'true',
      },
    })
    return result.data ? result.data : result
  } catch (error) {
    return error
  }
}

export function fetchApisByClient(clientId: string) {
  return requestClient.get<ApiModule[]>(`${BASE_URL}/${clientId}/modules`)
}
