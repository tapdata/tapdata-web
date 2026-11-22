export interface QueryColumn {
  name: string
  type: string
}
export interface QuerySnapshot {
  rowCount?: number
  timezone?: string
  fingerprint: string
  columns: QueryColumn[]
  rows: Record<string, unknown>[]
  hasMore: boolean
}
export interface QueryMapping {
  source?: string
  target?: string
  role: 'key' | 'compare' | 'ignore'
}
export interface QueryConfig {
  version: number
  maxRows: number
  timeoutSeconds: number
  detailLimit: number
  ignoreCase: boolean
  mappings: QueryMapping[]
}
export interface QuerySide {
  connectionId?: string
  databaseType?: string
  customQuery?: string
  queryKind?: string
  queryTimezone?: string
  table?: string
  querySnapshot?: QuerySnapshot | null
}
export interface QueryItem {
  source: QuerySide
  target: QuerySide
  customQueryConfig?: QueryConfig
}
export const defaultQueryConfig = (): QueryConfig => ({
  version: 2,
  maxRows: 1000,
  timeoutSeconds: 600,
  detailLimit: 100,
  ignoreCase: true,
  mappings: [],
})
export function queryError(
  item: QueryItem,
): 'testRequired' | 'mappingInvalid' | 'limitsInvalid' | undefined {
  const c = item.customQueryConfig
  if (
    !c ||
    !item.source.querySnapshot?.fingerprint ||
    !item.target.querySnapshot?.fingerprint
  )
    return 'testRequired'
  if (
    !Number.isInteger(c.maxRows) ||
    c.maxRows < 1 ||
    c.maxRows > 10000 ||
    !Number.isInteger(c.timeoutSeconds) ||
    c.timeoutSeconds < 1 ||
    c.timeoutSeconds > 3600
  )
    return 'limitsInvalid'
  const name = (s: string) => (c.ignoreCase ? s.toLowerCase() : s)
  const covered = (side: 'source' | 'target') => {
    const columns = item[side].querySnapshot!.columns.map((f) => name(f.name))
    const mapped = c.mappings.flatMap((m) => (m[side] ? [name(m[side]!)] : []))
    return (
      columns.length > 0 &&
      new Set(columns).size === columns.length &&
      mapped.length === columns.length &&
      new Set(mapped).size === mapped.length &&
      mapped.every((f) => columns.includes(f))
    )
  }
  if (
    !c.mappings.some((m) => m.role === 'compare') ||
    c.mappings.some(
      (m) =>
        !['key', 'compare', 'ignore'].includes(m.role) ||
        (m.role !== 'ignore' && (!m.source || !m.target)) ||
        (!m.source && !m.target),
    ) ||
    !covered('source') ||
    !covered('target')
  )
    return 'mappingInvalid'
  if (
    ((item.source.querySnapshot!.rowCount ||
      item.source.querySnapshot!.rows.length) > 1 ||
      (item.target.querySnapshot!.rowCount ||
        item.target.querySnapshot!.rows.length) > 1) &&
    !c.mappings.some((m) => m.role === 'key')
  )
    return 'mappingInvalid'
}
export function autoMappings(item: QueryItem): QueryMapping[] {
  const used = new Set<string>()
  const ignoreCase = item.customQueryConfig?.ignoreCase ?? true
  const name = (s: string) => (ignoreCase ? s.toLowerCase() : s)
  const targets = item.target.querySnapshot?.columns || []
  const result: QueryMapping[] = (item.source.querySnapshot?.columns || []).map(
    (s) => {
      const target = targets.find((t) => name(s.name) === name(t.name))?.name
      if (target) used.add(target)
      return { source: s.name, target, role: target ? 'compare' : 'ignore' }
    },
  )
  for (const t of targets)
    if (!used.has(t.name)) result.push({ target: t.name, role: 'ignore' })
  return result
}
