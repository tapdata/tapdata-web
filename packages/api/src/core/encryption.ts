import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/encryption'

export interface Encryption {
  id?: string
  name: string
  regex: string
  outputChar: string
  description?: string
  createdAt?: string
  last_updated?: string
}

export function fetchEncryptionList(filter?: Filter) {
  return requestClient.get<PageFetchResult<Encryption>>(`${BASE_URL}/list`, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function createEncryption(data: Encryption) {
  return requestClient.post<Encryption>(`${BASE_URL}/create`, data)
}

export function updateEncryption(data: Encryption) {
  return requestClient.patch<Encryption>(BASE_URL, data)
}

export function deleteEncryption(ids: string) {
  return requestClient.delete<boolean>(`${BASE_URL}/${ids}`)
}
