import { requestClient, type PageFetchResult } from '../request'

const BASE_URL = '/api/sdk'

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
  createdAt: string
  updatedAt: string
  size: number
}

export interface SdkVersion {
  id: string
  version: string
  apiList: []
}

export function fetchSdkList(filter?: any, config: any = {}) {
  return requestClient
    .get<PageFetchResult<Sdk>>(BASE_URL, {
      params: {
        filter: filter ? JSON.stringify(filter) : undefined,
      },
      ...config,
    })
    .catch((error) => {
      console.error(error)
      return {
        items: [
          {
            id: '1',
            name: '1.0.0',
            artifactId: 'tapdata-sdk',
            packageName: 'io.tapdata',
            latestVersion: '1.0.0',
            status: 'published',
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
          },
        ],
        total: 0,
      }
    })
}

export function fetchSdkVersions(id: string, filter?: any, config: any = {}) {
  return requestClient.get<PageFetchResult<SdkVersionItem>>(
    `${BASE_URL}/${id}/versions`,
    {
      params: {
        filter: filter ? JSON.stringify(filter) : undefined,
      },
      ...config,
    },
  )
}

export function fetchSdkVersion(id: string, version: string) {
  return requestClient.get<SdkVersion>(`${BASE_URL}/${id}/versions/${version}`)
}
