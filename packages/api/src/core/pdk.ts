import { requestClient } from '../request'

const BASE_URL = '/api/pdk'

export function getConnectorReleases() {
  return requestClient.get(`${BASE_URL}/releases`)
}

export function getConnectorRegistrationImpact(
  pdkId: string,
  artifactId: string,
) {
  return requestClient.get(`${BASE_URL}/registration-impact`, {
    params: { pdkId, artifactId },
  })
}

export function registerConnectorRelease(data: {
  pdkId: string
  artifactId: string
  stopTasks: boolean
  ignoreInFlightResources: boolean
}) {
  return requestClient.post(`${BASE_URL}/register-release`, data)
}

export function getPdkDoc(pdkHash: string) {
  const url = `${BASE_URL}/doc?pdkHash=${pdkHash}`
  return requestClient.get(url, {
    responseType: 'blob',
    responseReturn: 'raw',
    skipErrorHandler: true,
  })
}

export function getPdkStatics(pdkHash: string, fileName: string) {
  return requestClient.get(
    `${BASE_URL}/statics/${pdkHash}?filename=${encodeURIComponent(fileName)}`,
    {
      responseType: 'blob',
      responseReturn: 'raw',
      skipErrorHandler: true,
    },
  )
}
