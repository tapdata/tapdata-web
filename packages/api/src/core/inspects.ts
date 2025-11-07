import { requestClient } from '../request'

const BASE_URL = '/api/Inspects'

export function fetchInspects(filter: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function getTaskList() {
  return requestClient.get(`${BASE_URL}/task-list`)
}

export function getVerifyInfo(id: string) {
  return requestClient.get(`${BASE_URL}/${id}/recovery/start-verify`)
}

export function startRecovery(id: string) {
  return requestClient.put(`${BASE_URL}/${id}/recovery/start`)
}

export function importInspect(data: any) {
  return requestClient.post(`${BASE_URL}/batch/import`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function exportSql(id: string, resultId: string) {
  return requestClient.put(`${BASE_URL}/${id}/recover-sql/${resultId}/export`)
}

export function batchUpdateListtags(params: any) {
  return requestClient.patch(`${BASE_URL}/batchUpdateListtags`, params)
}

export function updateInspect(where: any, attributes: any) {
  let queryStr = ''
  if (typeof where === 'object') {
    queryStr = JSON.stringify(where)
  }
  if (typeof where === 'string') {
    queryStr = where
  }
  return requestClient.post(
    `${BASE_URL}/execute?where=${encodeURIComponent(queryStr)}`,
    attributes,
  )
}

export function patchInspect(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}

export function postInspect(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneInspect(params: any) {
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function deleteInspectById(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function downloadRecoverSql(inspectId: string, inspectResultId: string) {
  return requestClient.get(
    `${BASE_URL}/${inspectId}/recover-sql/${inspectResultId}/download`,
    {
      responseType: 'blob',
      responseReturn: 'raw',
    },
  )
}
