import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/groupInfo'

// 资源类型枚举
export type ResourceType =
  | 'SYNC_TASK'
  | 'MIGRATE_TASK'
  | 'CONNECTION'
  | 'MODULE'
  | 'INSPECT_TASK'
  | 'SHARE_CACHE'

// 记录类型枚举
export type RecordType = 'import' | 'export'

// 记录状态枚举
export type RecordStatus = 'importing' | 'exporting' | 'completed' | 'failed'

// 资源操作枚举
export type RecordAction =
  | 'IMPORTED'
  | 'EXPORTED'
  | 'REPLACED'
  | 'SKIPPED'
  | 'ERRORED'

// 导入模式枚举
export type ImportMode = 'group_import' | 'replace'

// 资源项
export interface ResourceItem {
  id: string
  name?: string
  type: ResourceType
}

// 分组信息数据传输对象
export interface GroupInfoDto {
  id?: string
  name: string
  description?: string
  resourceItemList?: ResourceItem[]
  createAt?: Date | string
  lastUpdAt?: Date | string
  createUser?: string
  lastUpdBy?: string
}

// 记录详情
export interface RecordDetail {
  resourceType: ResourceType
  resourceName: string
  action: RecordAction
  message?: string
}

// 分组记录详情
export interface GroupInfoRecordDetail {
  groupId: string
  groupName: string
  message?: string
  recordDetails: RecordDetail[]
}

// 导入导出记录
export interface GroupInfoRecordDto {
  id: string
  type: RecordType
  fileName: string
  status: RecordStatus
  operator: string
  operationTime: Date | string
  message?: string
  details: GroupInfoRecordDetail[]
}

/**
 * 查询分组列表
 */
export function fetchGroupInfoList(filter?: Filter) {
  return requestClient.get<PageFetchResult<GroupInfoDto>>(
    `${BASE_URL}/groupList`,
    {
      params: {
        filter: filter ? JSON.stringify(filter) : undefined,
      },
    },
  )
}

/**
 * 新增分组
 */
export function createGroupInfo(data: GroupInfoDto) {
  return requestClient.post<GroupInfoDto>(BASE_URL, data)
}

/**
 * 修改分组
 */
export function updateGroupInfo(data: GroupInfoDto) {
  return requestClient.patch<GroupInfoDto>(BASE_URL, data)
}

/**
 * 删除分组
 */
export function deleteGroupInfo(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

/**
 * 批量导出分组
 */
export function exportGroupInfoBatch(ids: string[]) {
  return requestClient.get(`${BASE_URL}/batch/load`, {
    params: {
      id: ids,
    },
    responseType: 'blob',
    responseReturn: 'raw',
    skipErrorHandler: true,
  })
}

/**
 * 批量导入分组
 */
export function importGroupInfoBatch(
  file: File,
  importMode: ImportMode = 'group_import',
) {
  const formData = new FormData()
  formData.append('file', file)

  return requestClient.post(`${BASE_URL}/batch/import`, formData, {
    params: {
      importMode,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 查询导入导出记录列表
 */
export function fetchGroupInfoRecordList(filter?: Filter) {
  return requestClient.get<PageFetchResult<GroupInfoRecordDto>>(
    `${BASE_URL}/record/list`,
    {
      params: {
        filter: filter ? JSON.stringify(filter) : undefined,
      },
    },
  )
}
