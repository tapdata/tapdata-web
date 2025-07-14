import { requestClient } from '../request'

const BASE_URL = '/api/Licenses'

export function getLicenseExpires() {
  return requestClient.get(`${BASE_URL}/expires`)
}

export function getLicenseSid(ids: any) {
  return requestClient.get(`${BASE_URL}/sid`, {
    params: {
      id: JSON.stringify(ids),
    },
  })
}

export function updateLicense(params: any) {
  return requestClient.post(`${BASE_URL}/upload`, params)
}

export function getPipelineDetails() {
  return requestClient.get(`${BASE_URL}/pipelineDetails`)
}

export function getLicenseFeatures() {
  return requestClient.get(`${BASE_URL}/features`).catch((error) => {
    if (error.response?.status === 404 && import.meta.env.DEV) {
      return Promise.resolve({
        licenseType: 'OP',
        features: [],
      })
    }
    throw error
  })
}

// Base Http methods that are used in the codebase
export function fetchLicenses(params?: any, filter?: any) {
  if (Array.isArray(params)) {
    let queryStr = ''
    if (typeof filter === 'object') {
      queryStr = JSON.stringify(filter)
    } else if (typeof filter === 'string') {
      queryStr = filter
    }
    const qs = queryStr ? `?filter=${encodeURIComponent(queryStr)}` : ''
    return requestClient.get(`${BASE_URL}/${params.join('/')}${qs}`)
  } else if (typeof params === 'string') {
    return requestClient.get(`${BASE_URL}/${params}`, { params: filter })
  }
  params = params || {}
  return requestClient.get(BASE_URL, { params })
}

export function countLicenses(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function deleteLicense(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createLicense(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneLicense(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}
