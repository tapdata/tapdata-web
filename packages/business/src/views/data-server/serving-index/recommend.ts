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

/**
 * 目标表已有的索引是否已经能服务这条推荐——能则不必再建（调用方据此隐藏推荐）。
 *
 * 判据是 **前缀覆盖**：某条已有索引的<b>前 n 个键</b>与推荐的 n 个键逐位同字段同方向，
 * 即该索引已覆盖推荐（复合索引 `{a,b,c}` 覆盖推荐 `{a,b}`；反之 `{a}` 不覆盖 `{a,b}`）。
 * 方向允许**整体取反**：B-tree 可反向遍历，`{a:1,b:-1}` 与 `{a:-1,b:1}` 服务同一组查询与排序；
 * 但**逐位混搭**不算覆盖（那会改变排序语义）。
 */
export function isRecommendationCovered(
  keys: RecommendKey[],
  existing: RecommendKey[][],
): boolean {
  if (!keys.length) return false
  return existing.some((index) => {
    if (index.length < keys.length) return false
    const prefix = index.slice(0, keys.length)
    const matches = (invert: boolean): boolean =>
      keys.every((k, i) => {
        const p = prefix[i]
        return (
          !!p &&
          k.field === p.field &&
          k.direction === (invert ? -1 : 1) * p.direction
        )
      })
    return matches(false) || matches(true)
  })
}

function buildStatement(
  collection: string | undefined,
  keys: RecommendKey[],
): string | null {
  if (!keys.length) return null
  const coll = isBlank(collection)
    ? '<collection>'
    : (collection as string).trim()
  // 字段名一律加引号：`POLICY.POLICY_STATUS` 这种点号路径不加引号就是非法 JS，复制出去跑不通。
  // 用 JSON.stringify 而非手拼引号——它顺带转义名字里的引号/反斜杠，不会把语句撕成两半。
  // 口径对齐 TM 侧 `ServingIndexManualCommands.mongo()`（两处生成同一份给人执行的语句）。
  const body = keys
    .map((k) => `${JSON.stringify(k.field)}: ${k.direction}`)
    .join(', ')
  // `background: true`：语句是给人**手工在目标库执行**的，目标库版本未知。
  // MongoDB 4.2+ 已废弃该选项并忽略之（4.2 起索引构建不再全程持排他锁）；4.0 及更早则确实需要它，
  // 否则前台建索引会阻塞该库的读写。带上它在新版是空操作、在老版是保护，故一律附带。
  return `db.${coll}.createIndex({ ${body} }, { background: true })`
}
