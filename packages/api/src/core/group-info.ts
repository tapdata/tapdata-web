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
  rerun?: boolean // 是否开启 rerun（仅用于导出时）
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
  gitInfo?: {
    repoUrl: string
    token: string
  }
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
  gitOperationSteps?: {
    stepName: string
    status: 'SUCCESS' | 'FAILED'
    message: string
    timestamp: number
    durationMs: number
    stackTrace?: string
  }[]
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

export interface ExportGroupInfoBatchParams {
  groupIds: string[]
  groupTransferType: 'FILE' | 'GIT'
  groupResetTask: {
    [groupId: string]: string[]
  }
  gitTag?: string
}

/**
 * 批量导出分组
 */
export function exportGroupInfoBatch(data: ExportGroupInfoBatchParams) {
  return requestClient.post(`${BASE_URL}/batch/load`, data, {
    responseType: 'blob',
    responseReturn: 'raw',
    skipErrorHandler: true,
  })
}

// /batch/load/git
export function exportGroupInfoBatchGit(data: ExportGroupInfoBatchParams) {
  return requestClient.post(`${BASE_URL}/batch/load/git`, data)
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

// /api/groupInfo/lastestGitTag/696dcd5d9eb86c3ac67ec9f5
// 当填入了github信息的时候，才可以调用这个接口，获取该项目对应的github仓库，最新的tag名称
// 导出时，需要使用这个值

export function fetchLastestGitTag(groupId: string) {
  return requestClient.get(`${BASE_URL}/lastestGitTag/${groupId}`)
}
