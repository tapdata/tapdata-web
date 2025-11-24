import { requestClient } from '../request'

const BASE_URL = '/api/file'

export function uploadFile(params: any) {
  return requestClient.post(`${BASE_URL}/upload`, params)
}

export function removeFile(id: string) {
  return requestClient.delete(`${BASE_URL}/delete?id=${id}`)
}
