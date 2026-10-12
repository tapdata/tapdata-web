import { downloadBlob } from '@tap/shared'
import axios from 'axios'

/**
 * Download a same-origin TM/API file with Authorization: Bearer.
 * Do not put the session token in the URL (TAP-11883).
 */
export function downloadAuthenticated(url: string, filename?: string) {
  return axios.get(url, { responseType: 'blob' }).then((res) => {
    downloadBlob(res, filename)
  })
}
