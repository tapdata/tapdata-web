import { requestClient } from '../request'

const BASE_URL = '/api/ExternalStorage'

const mapData = (data: any) => {
  if (data?.items?.length) {
    data?.items.forEach((item: any) => {
      item.name = item.name.replaceAll(/tapdata\s?/gi, '')
    })
  }
  return data
}

export function changeExternalStorage(id: string) {
  return requestClient.patch(`${BASE_URL}/${id}/default`)
}

export function fetchExternalStorageList(params: unknown, filter: unknown) {
  return getExternalStorage(params, filter)
}

export function getUsingTask(id: string) {
  return requestClient.get(`${BASE_URL}/${id}/usingTask`)
}

export async function getExternalStorage(params: unknown, filter: unknown) {
  if (Array.isArray(params)) {
    let queryStr = ''
    if (typeof filter === 'object') {
      queryStr = JSON.stringify(filter)
    } else if (typeof filter === 'string') {
      queryStr = filter
    }
    const qs = queryStr ? `?filter=${encodeURIComponent(queryStr)}` : ''
    const data = await requestClient.get(`${BASE_URL}/${params.join('/')}${qs}`)
    return mapData(data)
  } else if (typeof params === 'string') {
    const data = await requestClient.get(`${BASE_URL}/${params}`, {
      params: filter,
    })

    if (data?.name) {
      data.name = data.name.replaceAll(/tapdata\s?/gi, '')
    }

    return data
  }

  params = params || {}
  const data = await requestClient.get(BASE_URL, { params })

  return mapData(data)
}

export function updateExternalStorageById(id: string, params: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function createExternalStorage(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function deleteExternalStorage(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export interface SharedCdcEnableData {
  category: string
  enabled: boolean
  externalId: string
  externalName: string
  externalType: string
  settingKey: string
  [property: string]: any
}

export function getSharedCdcEnable() {
  return Promise.resolve({
    enabled: false,
  })
  // TODO DMP 暂未合并此功能
  // return requestClient.get<SharedCdcEnableData>(`${BASE_URL}/shared-cdc-enable`)
}

export interface ConnectionSharedCdcStatus {
  connections: {
    id: string
    name: string
    [property: string]: any
  }[]
}

export function getConnectionSharedCdcStatus(connectionIds: string[]) {
  return requestClient.post<ConnectionSharedCdcStatus>(
    `${BASE_URL}/ds-shared-cdc-status`,
    {
      connectionIds,
    },
  )
}
