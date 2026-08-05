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
  /**
   * 是否可勾选（`false`=灰置不可动）。目前仅系统索引（`_id_`）与超出支持边界者不可勾；
   * 「已被本 API 收录」是**可勾且默认勾上**——否则用户无法取消收录（应用=整体替换）。
   */
  checkable: boolean
  /** 默认勾选（首个命中即定，§3.8.3）。 */
  defaultChecked: boolean
  /** 被哪个 API 收录（仅 `COLLECTED_BY_OTHER_API` 有值）。 */
  attributionApi?: string
}

/*
 * 读回触发**没有**对应的前端 REST 函数：浏览器一律经 ws 发
 * `{ type: 'queryIndexes', data: { connectionId, tableName, reqId } }`（见 ServingIndexTab.startLoad）。
 * TM 的 `api/serving-indexes/query/{connectionId}` 端点仍在，但只服务于非浏览器调用者（CICD 等）——
 * 它要求调用方自报 sender，而浏览器自生成的 ws id 不在 TM 会话表里、回推必然落空（ADR-0009 修订）。
 */

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

/**
 * 只写 `servingIndexes` 的窄端点（索引 tab 与编辑态解绑，「勾选即存」）。
 *
 * **不要改用 `updateApiModule`**：那条路整表单回写，而抽屉进编辑态会把 `status` 翻成 `pending`——
 * 收录一条索引就把已发布的 API 撤下发布；它还跑后端 `checkModule`（basePath / 名称查重），
 * 让一次与 API 定义无关的勾选可能被别的 API 的路径冲突挡下。本端点只 `$set` 这一个字段。
 *
 * 空数组是合法输入（取消最后一条勾选），后端照写。
 */
export function saveServingIndexes(moduleId: string, servingIndexes: any[]) {
  return requestClient.patch<void>(`/api/Modules/${moduleId}/serving-indexes`, {
    servingIndexes,
  })
}
