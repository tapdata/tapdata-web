import { isPlainObj } from '@tap/shared'
import { requestClient, type PageFetchResult } from '../request'

const BASE_URL = '/api/MetadataInstances'

export function getMetadataInstanceById(id: string, params?: any) {
  return requestClient.get(`${BASE_URL}/${id}`, { params })
}

export function patchMetadataInstanceById(id: string, params: any) {
  return requestClient.patch(`${BASE_URL}/${id}`, params)
}

export function updateMetadataInstanceClassification(params: any) {
  return requestClient.patch(`${BASE_URL}/classifications`, params)
}

export function downloadMetadataInstance(where: any, type: string) {
  if (typeof where === 'object') where = JSON.stringify(where)
  window.open(
    `${BASE_URL}/download?where=${encodeURIComponent(where)}&type=${type}`,
  )
}

export function getMetadataInstanceDataMap(params?: any) {
  return requestClient.get(`${BASE_URL}/dataMap`, { params })
}

export function getMetadataInstanceSchema(params?: any) {
  return requestClient.get(`${BASE_URL}/schema`, { params })
}

export function getMetadataInstanceTableConnection(params?: any) {
  return requestClient.get(`${BASE_URL}/tableConnection`, { params })
}

export function uploadMetadataInstance(
  upsert: boolean,
  type: string,
  listtags: string,
  params: any,
) {
  return requestClient.post(
    `${BASE_URL}/upload?upsert=${upsert}&type=${type}&listtags=${listtags}`,
    params,
  )
}

export function searchMetadataInstances(params?: any) {
  return requestClient.get(`${BASE_URL}/search`, { params })
}

export function compareMetadataInstanceHistory(id: string, params?: any) {
  return requestClient.get(`${BASE_URL}/compareHistory?id=${id}`, params)
}

/**
 * 获取节点schema
 * @param nodeId
 * @param fields 筛选字段，如果有值，则请求结果只返回fields包含的字段；类型：字符串数组
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getNodeSchema(
  nodeId: string,
  fields: string[] = ['fields', 'indices'],
  nodeConfig?: any,
) {
  return requestClient.get(`${BASE_URL}/node/schema`, {
    params: {
      nodeId,
      fields,
      nodeConfig,
    },
  })
}

/**
 * 获取元数据表
 */
export function getOriginalData(qualified_name: string, target?: string) {
  if (target) {
    return requestClient.get(
      `${BASE_URL}/originalData?qualified_name=${encodeURIComponent(qualified_name)}${target}`,
    )
  } else {
    return requestClient.get(
      `${BASE_URL}/originalData?qualified_name=${encodeURIComponent(qualified_name)}`,
    )
  }
}

export function fetchMetadataInstances(params: any = {}, filter?: any) {
  if (Array.isArray(params)) {
    filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
    const qs = filter ? `?filter=${encodeURIComponent(filter)}` : ''
    return requestClient.get(`${BASE_URL}/${params.join('/')}${qs}`)
  }
  const config = { params }
  if (isPlainObj(filter)) {
    Object.assign(config, filter)
  }
  return requestClient.get(BASE_URL, config)
}

export function getTables(connectionId: string) {
  return requestClient.get(`${BASE_URL}/tables?connectionId=${connectionId}`)
}

export function getTablesValue(params?: any) {
  return requestClient.get(`${BASE_URL}/tablesValue`, { params })
}

export function getSourceTables(connectionId: string) {
  return requestClient.get(
    `${BASE_URL}/tables?connectionId=${connectionId}&sourceType=SOURCE`,
  )
}

/**
 * 主从合并获取父节点字段
 * @param taskId
 * @param nodeId
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getMergerNodeParentFields(taskId: string, nodeId: string) {
  return requestClient.get(
    `${BASE_URL}/mergerNode/parent/fields?taskId=${taskId}&nodeId=${nodeId}`,
  )
}

export function findTablesById(id: string) {
  return requestClient.get(`${BASE_URL}/findTablesById/${id}`)
}

export function findInspect(data: any) {
  return requestClient.post(`${BASE_URL}/findInspectPost`, data)
}

//元数据修改
export function saveTable(params: any) {
  return requestClient.post(`${BASE_URL}/migrate/saveTable`, params)
}

//元数据修改
export function resetTable(params: any) {
  return requestClient.post(`${BASE_URL}/migrate/reset`, params)
}

//61迭代 新增可以修改目标节点类型 新增接口
export function changeFields(params: any) {
  return requestClient.post(`${BASE_URL}/changeFields`, params)
}

export function changeFieldsReset(params: any) {
  return requestClient.post(`${BASE_URL}/changeFields/reset`, params)
}

export function dataType2TapType(params: any) {
  return requestClient.post(`${BASE_URL}/dataType2TapType`, params)
}

export function getNodeSchemaPage(params?: any) {
  return requestClient.get(`${BASE_URL}/node/schemaPage`, { params })
}

export function getTapTables(params: any) {
  return requestClient.get(
    `${BASE_URL}/tapTables?filter=${encodeURIComponent(params.filter)}`,
  )
}

export function checkTableExist(params?: any) {
  return requestClient.get(`${BASE_URL}/check/table/exist`, { params })
}

export function deleteLogicSchema(taskId: string, params?: any) {
  return requestClient.delete(`${BASE_URL}/logic/schema/${taskId}`, { params })
}

export function getPageTables(params?: any) {
  return requestClient.get(`${BASE_URL}/page-tables`, { params })
}

export function getPagePartitionTables(params?: any) {
  return requestClient.get(`${BASE_URL}/partition/page-tables`, { params })
}

//更新表描述
export function updateTableDesc(params: any) {
  return requestClient.post(`${BASE_URL}/updateTableDesc`, params)
}

export function dataTypeCheckMultiple(params: any) {
  return requestClient.post(`${BASE_URL}/dataType/checkMultiple`, params)
}

export function updateTableFieldDesc(id: string, params: any) {
  return requestClient.post(`${BASE_URL}/updateTableFieldDesc/${id}`, params)
}

export function getNodeFilterTypeList(params?: any) {
  return requestClient.get(`${BASE_URL}/node/filterTypeList`, { params })
}

// 获取表最新的字段列表
export function multiTransform(params: any) {
  return requestClient.post(`${BASE_URL}/multi/transform`, params)
}

export function getNodeSchemaMapByIds(params?: any) {
  return requestClient.get(`${BASE_URL}/nodes/schema-map`, { params })
}

export function checkFiledIndex(params?: any) {
  return requestClient.get(`${BASE_URL}/check/filedIndex`, { params })
}

// Base Http methods that are used in the codebase
export function countMetadataInstances(params?: any) {
  return requestClient.get(`${BASE_URL}/count`, { params })
}

export function deleteMetadataInstance(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createMetadataInstance(params: any) {
  return requestClient.post(BASE_URL, params)
}

export function findOneMetadataInstance(params?: any) {
  params = params || {}
  return requestClient.get(`${BASE_URL}/findOne`, { params })
}

export function updateMetadataInstance(where: any, attributes: any) {
  let queryStr = ''
  if (typeof where === 'object') {
    queryStr = JSON.stringify(where)
  }
  if (typeof where === 'string') {
    queryStr = where
  }
  return requestClient.post(
    `${BASE_URL}/execute?where=${encodeURIComponent(queryStr)}`,
    attributes,
  )
}

export interface CompareResultParams {
  nodeId: string
  taskId: string
  page?: number
  pageSize?: number
  [property: string]: any
}

export interface CompareResultData {
  compareDtos: PageFetchResult<CompareResultItem>
  invalidApplyDtos: CompareResultItem[]
  status: string
  [property: string]: any
}

export interface CompareResultItem {
  createTime?: string
  createUser?: string
  differenceFieldList: ItemDifferenceFieldList[]
  id?: string
  last_updated?: string
  lastUpdBy?: string
  nodeId?: string
  qualifiedName: string
  tableName: string
  type?: string
  user_id?: string
  [property: string]: any
}

export interface ItemDifferenceFieldList {
  applyType?: string
  columnName: string
  sourceField: ItemDifferenceField
  targetField: ItemDifferenceField
  type: string
  [property: string]: any
}

export interface ItemDifferenceField {
  autoincrement: string
  columnPosition: number
  createSource: string
  data_type: string
  dataTypeTemp: string
  default_value: null
  field_name: string
  id: string
  is_auto_allowed: boolean
  is_deleted: boolean
  is_nullable: boolean
  original_field_name: string
  originalDataType: string
  previousDataType: string
  previousFieldName: string
  primary_key_position: number
  primaryKey: boolean
  pure_data_type: string
  source: string
  sourceDbType: string
  tapType: string
  unique: boolean
  useDefaultValue: boolean
  [property: string]: any
}

export function getMetadataInstancesCompareResult(params: CompareResultParams) {
  return requestClient.get<CompareResultData>(
    `${BASE_URL}/getMetadataInstancesCompareResult`,
    {
      params,
    },
  )
}

export function getTargetSchemaDetection(params: any) {
  return requestClient.get(`${BASE_URL}/targetSchemaDetection`, { params })
}

export function saveCompareApply(all: boolean, nodeId: string, params?: any) {
  return requestClient.post(
    `${BASE_URL}/saveMetadataInstancesCompareApply?all=${all}&nodeId=${nodeId}`,
    params,
  )
}

export function deleteCompareApply(all: boolean, nodeId: string, data?: any) {
  return requestClient.delete(
    `${BASE_URL}/deleteMetadataInstancesCompareApply?all=${all}&nodeId=${nodeId}`,
    { data },
  )
}

export function deleteInvalidCompareApply(nodeId: string) {
  return requestClient.delete(
    `${BASE_URL}/deleteMetadataInstancesCompareApply?all=true&invalid=true&nodeId=${nodeId}`,
  )
}

export interface CompareResultStatistics {
  finishTime: string
  targetSchemaLoadTime: string
  differentFieldNumberMap: {
    CannotWrite: 0
    Missing: 0
    CannotWriteApply: 0
    MissingApply: 0
    DifferentApply: 0
    Different: 0
  }
}

export function getCompareResultStatistics(params: any) {
  return requestClient.get<CompareResultStatistics>(
    `${BASE_URL}/compareAndGetMetadataInstancesCompareResult`,
    { params },
  )
}
