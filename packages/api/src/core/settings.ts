import { requestClient } from '../request'

export function fetchSettings() {
  return requestClient.get('/api/Settings')
}
