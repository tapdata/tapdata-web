import { requestClient } from '../request'

/**
 * 服务型索引「加载」链路 API（TAP-12057 / ADR-0009）。
 *
 * 两步：① `query` 触发引擎按连接 + 表读回物理索引（非阻塞，结果经引擎 ws 推回发起方会话，前端按
 * `connectionId + tableName + reqId` 关联）；② `load` 把读回索引连同 `moduleId` 回传，TM 做归因 +
 * 默认勾选规划，同步返回全表结果。
 */

const BASE_URL = '/api/serving-indexes'

/** 索引方向：`false`=降序，`true`/缺省=升序（同 P0 / 后端 ServingIndexField）。 */
export interface ServingIndexField {
  field: string
  asc?: boolean
}

/** 索引身份 = 有序字段 + 方向（名/unique 不参与比对）。 */
export interface ServingIndex {
  name?: string
  unique?: boolean
  fields: ServingIndexField[]
}

/** 归因分类（后端 `LoadedIndexAttribution` 枚举）。 */
export type LoadedIndexAttribution =
  | 'SYSTEM_INDEX'
  | 'UNSUPPORTED'
  | 'MATCHES_API'
  | 'COLLECTED_BY_THIS_API'
  | 'COLLECTED_BY_OTHER_API'
  | 'UNCLASSIFIED'

/** 加载规划的一行：全表可见、带归因与默认勾选（后端 `LoadedServingIndex`）。 */
export interface LoadedServingIndex {
  index: ServingIndex
  attribution: LoadedIndexAttribution
  /** 是否可勾选（`false`=灰置不可动，如超范围 / 已被本 API 收录）。 */
  checkable: boolean
  /** 默认勾选（首个命中即定，§3.8.3）。 */
  defaultChecked: boolean
  /** 被哪个 API 收录（仅 `COLLECTED_BY_OTHER_API` 有值）。 */
  attributionApi?: string
}

/**
 * P1-2 读回触发（ADR-0009）：非阻塞返回；结果由引擎经 ws 推回 `clientId` 对应会话。
 * `params` = `tableName` + 前端生成的 `reqId`（引擎回显）+ `clientId`（本 ws 会话 id）。
 */
export function queryServingIndexes(
  connectionId: string,
  params: { tableName: string; reqId: string; clientId: string },
) {
  return requestClient.post<void>(`${BASE_URL}/query/${connectionId}`, params)
}

/**
 * P2-2 加载规划：把 ws 读回的索引连同 `moduleId` 回传，返回归因 + 默认勾选的全表结果（不预过滤）。
 * `indexes` = ws 读回的原始索引（`TapIndex[]` 形状，原样回传）。
 */
export function loadServingIndexes(moduleId: string, indexes: any[]) {
  return requestClient.post<LoadedServingIndex[]>(
    `${BASE_URL}/load/${moduleId}`,
    { indexes },
  )
}
