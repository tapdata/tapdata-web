import Cookie from '@tap/shared/src/cookie'
import { requestClient } from '../request'

const BASE_URL = '/api/Modules'

// 类型定义
export interface ApiModule {
  id: string
  name?: string
  tableName?: string
  status: 'active' | 'pending' | 'inactive'
  apiType?: string
  method?: string
  path?: string
  listtags?: Array<{
    id: string
    value: string
  }>
  paths?: Array<{
    name: string
    result: string
    type: string
    acl?: any
    method?: string
    params?: any
    where?: any
    sort?: any
    fields?: any
    path?: string
  }>
  createAt?: string
  createTime?: string
  [key: string]: any
}

export interface ApiModuleFilter {
  where?: {
    status?: string
    'listtags.id'?: string
    [key: string]: any
  }
  order?: string
  limit?: number
  skip?: number
}

export interface ApiModuleListResponse {
  items: ApiModule[]
  total: number
}

/**
 * 获取 API 模块列表 - 支持多种查询方式
 */
export function fetchApiModules(filter?: ApiModuleFilter) {
  return requestClient.get<ApiModuleListResponse>(BASE_URL, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}

export function fetchApiModule(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

/**
 * 创建 API 模块 - 支持自定义 URI 路径
 */
export function createApiModule(params: Partial<ApiModule>, name?: string) {
  if (name) {
    return requestClient.post(`${BASE_URL}/${params.uri}`, params)
  }

  if (params.uri) {
    return requestClient.post(`${BASE_URL}/${params.uri}`, params)
  }

  return requestClient.post(BASE_URL, params)
}

/**
 * 更新 API 模块 - 更新模块配置和状态
 */
export function updateApiModule(params: Partial<ApiModule>) {
  return requestClient.patch(BASE_URL, params)
}

/**
 * 删除 API 模块 - 支持按表名删除
 */
export function deleteApiModule(id: string, tableName?: string) {
  if (tableName === '') {
    return requestClient.delete(`${BASE_URL}/${id}`)
  } else if (tableName) {
    return requestClient.delete(`${BASE_URL}/${id}?tablename=${tableName}`)
  }
  return requestClient.delete(`${BASE_URL}/${id}`)
}

/**
 * 获取 API 文档 - 获取指定模块的 API 文档
 */
export function getApiModuleDocument(id: string) {
  return requestClient.get(`${BASE_URL}/getApiDocument?id=${id}`)
}

/**
 * 根据集合名称获取 API 模块
 */
export function getApiModuleByCollectionName(params: any) {
  return requestClient.get(`${BASE_URL}/api/getByCollectionName`, { params })
}

/**
 * 获取 API 模块的数据模式
 */
export function getApiModuleSchema(id: string) {
  return requestClient.get(`${BASE_URL}/getSchema/${id}`)
}

/**
 * 获取模块数据 - 通过 mondeid 获取
 */
export function getApiModuleData(mondeid: string) {
  return requestClient.get(`${BASE_URL}/getSchema/${mondeid}`)
}

/**
 * 批量更新 API 模块标签
 */
export function batchUpdateApiModuleTags(params: any) {
  return requestClient.patch(`${BASE_URL}/batchUpdateListtags`, params)
}

/**
 * 获取 API 列表 - 用于监控和管理
 */
export function getApiModuleList(params: any) {
  return requestClient.get(`${BASE_URL}/apiList`, { params })
}

/**
 * 导出 API 模块 - 批量导出模块配置
 */
export function exportApiModules(ids: string[]) {
  const href = `${BASE_URL}/batch/load?id=${ids.join('&id=')}&access_token=${Cookie.get('access_token')}`
  window.open(href)
}

/**
 * 导出 API 文档 - 导出 API 接口文档
 */
export function exportApiDocumentation(ids: string[], ip: string) {
  const href = `${BASE_URL}/api/export?id=${ids.join('&id=')}&access_token=${Cookie.get('access_token')}&ip=${ip}`
  window.open(href)
}

/**
 * 更新 API 模块权限
 */
export function updateApiModulePermissions(data: any) {
  return requestClient.patch(`${BASE_URL}/updatePermissions`, data)
}

/**
 * 更新 API 模块标签
 */
export function updateApiModuleTags(data: any) {
  return requestClient.patch(`${BASE_URL}/updateTags`, data)
}

/**
 * 批量更新 API 模块 - 批量修改模块状态或配置
 */
export function batchUpdateApiModules(modules: Partial<ApiModule>[]) {
  return requestClient.patch(`${BASE_URL}/batchUpdate`, modules)
}

// Base Http methods that are used in the codebase
export function countApiModules(params: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function findOneApiModule(params: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateApiModuleById(id: string, params: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}
