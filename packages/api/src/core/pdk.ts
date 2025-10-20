import { requestClient } from '../request'

const BASE_URL = '/api/pdk'

export function getPdkDoc(pdkHash: string) {
  const url = `${BASE_URL}/doc?pdkHash=${pdkHash}`
  return requestClient.get(url, {
    responseType: 'blob',
  })
}

export function getPdkStatics(pdkHash: string, fileName: string) {
  return requestClient.get(
    `${BASE_URL}/statics/${pdkHash}?filename=${encodeURIComponent(fileName)}`,
    {
      responseType: 'blob',
    },
  )
}
