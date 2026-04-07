import type { AggregateField } from './AggregateFields'
import type { GroupField } from './GroupFields'
import type { MatchCondition } from './MatchFilter'

export interface AggregatePanelValue {
  useRawPipeline: boolean
  rawPipeline: string
  matchConditions: MatchCondition[]
  groupFields: GroupField[]
  aggregateFields: AggregateField[]
  // 源节点信息（自动加载）
  connectionName?: string
  databaseName?: string
  tableName?: string
  connectionId?: string
  databaseType?: string
}

const OP_MAP: Record<string, string> = {
  '=': '$eq',
  '≠': '$ne',
  '>': '$gt',
  '≥': '$gte',
  '<': '$lt',
  '≤': '$lte',
  IN: '$in',
  'NOT IN': '$nin',
  REGEX: '$regex',
}

/**
 * 根据 AggregatePanel 的值生成 MongoDB 聚合管道数组
 */
export function buildPipelineStages(value: AggregatePanelValue): any[] | null {
  if (value.useRawPipeline) {
    try {
      return JSON.parse(value.rawPipeline)
    } catch {
      return null
    }
  }

  const stages: any[] = []

  // $match
  if (value.matchConditions.length > 0) {
    const matchObj: Record<string, any> = {}
    const conditions = value.matchConditions.map((c) => {
      const mongoOp = OP_MAP[c.operator] || '$eq'
      let val: any = c.value
      if (c.operator === 'IN' || c.operator === 'NOT IN') {
        val = val.split(',').map((s: string) => s.trim())
      }
      return { [c.field]: { [mongoOp]: val } }
    })

    if (conditions.length === 1) {
      Object.assign(matchObj, conditions[0])
    } else {
      const hasOr = value.matchConditions.some((c) => c.logic === 'OR')
      if (hasOr) {
        matchObj.$or = conditions
      } else {
        conditions.forEach((c) => Object.assign(matchObj, c))
      }
    }
    stages.push({ $match: matchObj })
  }

  // $group
  if (value.groupFields.length > 0 || value.aggregateFields.length > 0) {
    const groupObj: Record<string, any> = {}

    if (value.groupFields.length === 1 && !value.groupFields[0]?.alias) {
      groupObj._id = `$${value.groupFields[0]?.field}`
    } else if (value.groupFields.length > 0) {
      groupObj._id = {}
      value.groupFields.forEach((g) => {
        const key = g.alias || g.field
        groupObj._id[key] = `$${g.field}`
      })
    } else {
      groupObj._id = null
    }

    value.aggregateFields.forEach((a) => {
      const opLower = a.operator.toLowerCase()
      if (a.operator === '$count') {
        groupObj[a.outputField] = { $sum: 1 }
      } else {
        groupObj[a.outputField] = { [opLower]: `$${a.sourceField}` }
      }
    })

    stages.push({ $group: groupObj })
  }

  return stages
}

/**
 * 根据 AggregatePanel 的值生成 MongoDB 聚合管道 JSON 字符串
 * @param value  AggregatePanel 组件的 value
 * @param indent JSON 缩进空格数，默认 2
 */
export function buildPipelineJSON(
  value: AggregatePanelValue,
  indent = 2,
): string {
  const stages = buildPipelineStages(value)
  if (stages === null) return value.rawPipeline || '[]'
  return JSON.stringify(stages, null, indent)
}

