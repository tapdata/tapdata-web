import { requestClient, type Filter } from '../request'

const BASE_URL = '/api/DatabaseTypes'

/**
 * 根据PDK哈希获取数据库类型信息
 */
export function fetchDatabaseTypeByPdkHash(pdkHash: string) {
  return requestClient.get(`${BASE_URL}/pdkHash/${pdkHash}`)
}

/**
 * 获取数据库列表 - 用于连接器选择
 */
export function fetchDatabases(filter?: Filter) {
  return requestClient.get(`${BASE_URL}/getDatabases`, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}

// Base Http methods that are used in the codebase
export function fetchDatabaseTypes(filter?: Filter) {
  return requestClient.get(BASE_URL, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}
