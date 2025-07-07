import { requestClient, type Filter, type PageFetchResult } from '../request'
import type { ApiModule } from './modules'

const BASE_URL = '/api/SDK'

export interface Sdk {
  id: string
  name: string
  artifactId: string
  packageName: string
  latestVersion: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface SdkParams {
  name: string
  packageName: string
  version: string
}

export interface SdkVersionItem {
  id: string
  version: string
  downloadCount: number
  createTime: string
  last_updated: string
  updatedFromNow: string
  size: number
}

export interface SdkVersion {
  id: string
  version: string
  apiList: []
}

export interface CreateSdkParams {
  oas: string
  lan?: string
  packageName: string
  artifactId: string
  groupId?: string
  version: string
  clientId: string
  requestAddress: string
  templateLibrary?: string
  moduleIds: string[]
}

export interface SdkModuleItem extends ApiModule {
  sdkId: string
  sdkVersionId: string
}

export function fetchSdkList(filter?: any, config: any = {}) {
  return requestClient.get<PageFetchResult<Sdk>>(BASE_URL, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
    ...config,
  })
}

export function fetchSdk(id: string) {
  return requestClient.get<Sdk>(`${BASE_URL}/${id}`)
}

export function fetchSdkVersions(filter: Filter) {
  return requestClient.get<PageFetchResult<SdkVersionItem>>(`/api/SdkVersion`, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}

export function fetchSdkVersionApiList(filter: Filter) {
  return requestClient.get<PageFetchResult<SdkModuleItem>>(`/api/SdkModule`, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}

export function createSdk(data: Partial<CreateSdkParams>) {
  return requestClient.post(`/api/openapi/async/generate`, data)
}

export function downloadSdk(gridfsId: string) {
  return requestClient.get(`${BASE_URL}/download/${gridfsId}`)
}

export function deleteSdkVersion(id: string) {
  return requestClient.delete(`/api/SdkVersion/${id}`)
}
