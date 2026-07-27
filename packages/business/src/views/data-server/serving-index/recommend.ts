/**
 * P2-5 · 服务型索引「推荐」纯前端计算（TAP-12057，方案 §3.3）。
 *
 * 据 API 编辑抽屉里同屏的查询形态（`where` / `sort`），按 **ESR 序**推导一条建议索引，产出可直接复制运行的
 * `db.<collection>.createIndex({...})` 语句：
 *   - **E**（等值，最前）= `where` 中 operator 为 `==` / `in` 的字段；
 *   - **S**（排序，居中）= `sort` 字段，含方向（`desc → -1`，`asc/缺省 → 1`）；
 *   - **R**（范围，垫后）= `where` 中其余 operator（`>` `>=` `<` `<=` `like` `!=`）的字段。
 * 复合键按 E→S→R 拼接、同名字段去重（首次出现即定，故 E 优先于 S 优先于 R）。
 *
 * **护栏**（方案 §3.3）：`fullCustomQuery` 开启或 `customWhere` 非空时，Path 声明已不描述真实查询
 * （apiserver 走 `customerQuery` 绕过白名单），此时**拒绝推荐**（`refused`），照 Path 推出来的必然是错的。
 *
 * 纯函数、无副作用、无外部依赖：i18n 免责行（「未经真实流量验证——建前请 explain() 核对」）与渲染由调用方
 * （P2-7 只读展示 / P2-8 i18n）承担；本模块只出结构化结果 + 可复制语句。
 */

export type IndexDirection = 1 | -1

/** 抽屉 `form.where` 单条（子集：推荐只关心字段名与运算符）。 */
export interface RecommendWhere {
  fieldName?: string
  operator?: string
}

/** 抽屉 `form.sort` 单条（`type`：`'asc'` | `'desc'`）。 */
export interface RecommendSort {
  fieldName?: string
  type?: string
}

export interface RecommendInput {
  collection?: string
  where?: RecommendWhere[]
  sort?: RecommendSort[]
  fullCustomQuery?: boolean
  customWhere?: string
}

export interface RecommendKey {
  field: string
  direction: IndexDirection
}

export type RecommendRefusalReason = 'fullCustomQuery' | 'customWhere'

export interface RecommendResult {
  /** 是否因护栏拒绝推荐。 */
  refused: boolean
  /** 拒绝原因（仅 `refused` 时）。 */
  reason?: RecommendRefusalReason
  /** ESR 序索引键（拒绝或无可查询字段时为空）。 */
  keys: RecommendKey[]
  /** 可直接复制运行的 createIndex 语句；无键时为 `null`。 */
  statement: string | null
}

/** 索引服务端能以「首字段等值」命中的运算符（前端符号形态，见 `data-server/shared.ts`）。 */
const EQUALITY_OPERATORS = ['==', 'in']

const isBlank = (s?: string): boolean => !s || !s.trim()

const isEquality = (operator?: string): boolean =>
  operator != null && EQUALITY_OPERATORS.includes(operator)

export function recommendServingIndex(input: RecommendInput): RecommendResult {
  if (input.fullCustomQuery === true) {
    return {
      refused: true,
      reason: 'fullCustomQuery',
      keys: [],
      statement: null,
    }
  }
  if (!isBlank(input.customWhere)) {
    return { refused: true, reason: 'customWhere', keys: [], statement: null }
  }

  const where = input.where ?? []
  const sort = input.sort ?? []

  const keys: RecommendKey[] = []
  const seen = new Set<string>()
  const add = (field: string | undefined, direction: IndexDirection): void => {
    if (isBlank(field)) return
    const name = (field as string).trim()
    if (seen.has(name)) return
    seen.add(name)
    keys.push({ field: name, direction })
  }

  // E —— 等值 where（== / in），最前
  for (const w of where) {
    if (isEquality(w.operator)) add(w.fieldName, 1)
  }
  // S —— sort（含方向），居中
  for (const s of sort) {
    add(s.fieldName, s.type === 'desc' ? -1 : 1)
  }
  // R —— 其余 where（范围/!=），垫后
  for (const w of where) {
    if (!isEquality(w.operator)) add(w.fieldName, 1)
  }

  return {
    refused: false,
    keys,
    statement: buildStatement(input.collection, keys),
  }
}

function buildStatement(
  collection: string | undefined,
  keys: RecommendKey[],
): string | null {
  if (!keys.length) return null
  const coll = isBlank(collection)
    ? '<collection>'
    : (collection as string).trim()
  const body = keys.map((k) => `${k.field}: ${k.direction}`).join(', ')
  return `db.${coll}.createIndex({ ${body} })`
}
