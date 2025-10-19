import { requestClient } from '../request'

const BASE_URL = '/api/TypeMappings'

/**
 * Get data type mapping
 */
export function getDataTypeMapping(databaseType: string) {
  return requestClient.get(`${BASE_URL}/dataType?databaseType=${databaseType}`)
}

/**
 * Get PDK data type mapping
 */
export function getPDKDataTypeMapping(databaseType: string) {
  return requestClient.get(
    `${BASE_URL}/pdk/dataType?databaseType=${databaseType}`,
  )
}
