import { requestClient } from '../request'

const BASE_URL = '/api/InspectDetails'

export function fetchInspectDetails(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
  })
}

export function exportInspectDetails(
  inspectResultId: string,
  fullField: boolean,
) {
  return requestClient.post(
    `${BASE_URL}/export`,
    {
      inspectResultId,
      fullField,
    },
    {
      responseType: 'blob',
      responseReturn: 'raw',
      skipErrorHandler: true,
    },
  )
}
