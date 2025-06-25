import { requestClient } from '../request'

const BASE_URL = '/api/Workers'

export function getAvailableAgent() {
  return requestClient.get(`${BASE_URL}/availableAgent`)
}

export function getTaskUsedAgent(id: string) {
  return requestClient.get(`${BASE_URL}/available/taskUsedAgent?taskId=${id}`)
}

export function queryAllBindWorker() {
  return requestClient.get(`${BASE_URL}/queryAllBindWorker`)
}

export function unbindByProcessId(id: string) {
  return requestClient.post(`${BASE_URL}/unbindByProcessId?processId=${id}`)
}

export function getProcessInfo(processIds: string[]) {
  return requestClient.get(`${BASE_URL}/getProcessInfo`, {
    params: {
      process_id: JSON.stringify(processIds)
    }
  })
}

// Base Http methods that are used in the codebase
export function fetchWorkers(params?: any, filter?: any) {
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

export function countWorkers(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function deleteWorker(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createWorker(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function updateWorker(params: any) {
  return requestClient.patch(BASE_URL, params)
}

export function findOneWorker(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}
