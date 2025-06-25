import { requestClient } from '../request'

export function fetchTimestamp(params?: any) {
  params = params || {}
  return requestClient.get<number>('/api/timeStamp', { params })
}
