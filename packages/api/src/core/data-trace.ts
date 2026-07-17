import { requestClient } from '../request'
import { createTraceStreamProcessor } from './data-trace-stream-parser'

const BASE_URL = '/api/lineage/wide-table'

export interface BloodlineTaskNode {
  id: string
  name: string
  type: string
  disabled: boolean
  catalog: string
  taskNodePos: string
  dataNode?: boolean
  transformed?: boolean
  logCollectorNode?: boolean
  isTransformed?: boolean
  elementType?: string
}

export interface BloodlineTask {
  id: string
  name: string
  taskNode: BloodlineTaskNode
  syncType: string
  status: string
  startTime?: string
  attrKey: string
}

export interface BloodlineNodeMetadata {
  id: string
  sourceType: string
  nodeId: string
}

export interface BloodlineNodeAttr {
  rootNodeId: string
  preNodeId: string
  nodeType: string
  tablePk: { originName: string; targetName: string }[]
  tableType: string
  joinKeys: { originName: string; targetName: string }[]
}

export interface BloodlineNode {
  table: string
  connectionId: string
  connectionName: string
  pdkHash: string
  metadata: BloodlineNodeMetadata
  tasks: Record<string, BloodlineTask>
  type: string
  catalog: string
  isTransformed: boolean
  id: string
  elementType: string
  attrs: Record<string, BloodlineNodeAttr>
  disabled: boolean
}

export interface BloodlineEdge {
  name: string
  attrs: {
    tasks: Record<string, BloodlineTask>
  }
  disabled: boolean
  source: string
  target: string
}

export interface BloodlineDag {
  edges: BloodlineEdge[]
  nodes: BloodlineNode[]
}

export interface BloodlineDiagramData {
  dag: BloodlineDag
  /** 各节点的 trace field 对应字段名称 <nodeId, <targetTraceFieldName, currentTableFieldName>> */
  traceFilterFieldNameMapping: Record<string, Record<string, string>>
  /** 最终目标表的更新条件字段列表 */
  targetTableUpdateFields: string[]
}

export interface TraceStreamCallbacks {
  /** 每个节点的数据返回时触发，nodeId 为节点 ID，data 为该节点的行数据（null 表示无数据） */
  onNodeData?: (nodeId: string, data: Record<string, any> | null) => void
  /** 全部节点返回完毕 */
  onDone?: () => void
  /** 出错时触发 */
  onError?: (error: string) => void
}

/**
 * 获取Trace Data（SSE 流式）
 * 返回 AbortController 用于取消请求
 */
export function getTraceData(
  data: { connectionId: string; table: string; filters?: Record<string, any> },
  callbacks: TraceStreamCallbacks,
): AbortController {
  const controller = new AbortController()
  const processChunk = createTraceStreamProcessor((nodeId, parsed) => {
    callbacks.onNodeData?.(nodeId, parsed)
  })

  requestClient
    .post(`${BASE_URL}/trace/stream`, data, {
      headers: { Accept: 'application/x-ndjson' },
      responseType: 'text',
      responseReturn: 'raw',
      signal: controller.signal,
      timeout: 0,
      onDownloadProgress: (event: any) => {
        const xhr = event.target || event.event?.target
        if (xhr?.responseText) {
          processChunk(xhr.responseText)
        }
      },
    })
    .then(() => {
      processChunk.flush()
      callbacks.onDone?.()
    })
    .catch((error: any) => {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        callbacks.onError?.(error?.message || 'Network error')
      }
    })

  return controller
}

export interface ChangeLogParams {
  /** 表名 */
  table: string
  /** 连接ID */
  connectionId: string
  /** 查询开始时间，毫秒级时间戳 */
  startTime: number
  /** 查询结束时间，毫秒级时间戳 */
  endTime: number
  /** trace Data 后节点返回的查询条件列表 */
  queryConditions: Record<string, any>[]
  /** 每次查询的条数 */
  limit: number
  /** 上次查询的最后一个日志 key */
  lastKey: number
}

export interface ChangeLogResult {
  table: string
  connectionId: string
  startTime: string
  endTime: string
  queryConditions: string
  limit: string
  lastKey: string
  logs: Record<string, any>[]
}

/**
 * 查询 Change Log
 */
export function getChangeLog(data: ChangeLogParams) {
  return requestClient.post<ChangeLogResult>('/api/lineage/change-log', data)
}

/**
 * DAG血缘获取
 */
export function getBloodlineDiagram(
  params: {
    connectionId: string
    table: string
    trackedFields?: string[]
  },
  config?: any,
) {
  return requestClient.get<BloodlineDiagramData>(
    `${BASE_URL}/bloodline-diagram`,
    {
      params,
      ...config,
    },
  )
}
