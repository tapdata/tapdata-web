import { requestClient, type Filter } from '../request'

const BASE_URL = '/api/DatabaseTypes'

/**
 * 根据PDK哈希获取数据库类型信息
 */
export function fetchDatabaseTypeByPdkHash(pdkHash: string) {
  return requestClient.get(`${BASE_URL}/pdkHash/${pdkHash}`)
}

const renamedData: Record<string, string> = {
  'Mysql': 'MySQL',
  'HuaWei\'Cloud GaussDB': 'Huawei Cloud GaussDB',
}

/**
 * 获取数据库列表 - 用于连接器选择
 */
export async function fetchDatabases(filter?: Filter) {
  const data = await requestClient.get(`${BASE_URL}/getDatabases`, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })

  return data?.map((it: any) => {
    it.name = renamedData[it.name] || it.name
    return it
  })
}

export async function fetchDatabaseTypes(filter?: Filter) {
  const data = await requestClient.get(BASE_URL, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
  

  return data?.map((it: any) => {
    it.name = renamedData[it.name] || it.name
    return it
  })
}
