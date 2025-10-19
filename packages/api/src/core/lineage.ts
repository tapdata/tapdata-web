import { requestClient } from '../request'

const BASE_URL = '/api/lineage'

/**
 * Find lineage by table
 */
export function findLineageByTable(
  connectionId: string,
  table: string,
  config?: any,
) {
  return requestClient.get(`${BASE_URL}/table/findByTable`, {
    params: {
      connectionId,
      table,
    },
    ...config,
  })
}
