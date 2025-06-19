import { getIcon } from '@tap/assets/icons'
import { getConnectionIcon } from '@tap/business/src/views/connections/util'
import { uuid } from '@tap/shared'
import { isEmpty, merge } from 'lodash-es'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    return getConnectionIcon(pdkHash)
  }
  let icon =
    node.type === 'table' || node.type === 'database' || node.databaseType
      ? node.databaseType
      : node.type
  if (node.type === 'hazelcastIMDG') {
    const map = {
      memory: 'memory',
      mongodb: 'mongodb',
      rocksdb: 'rocksdb',
    }
    icon = map[node.externaltype]
  }
  return icon ? getIcon(icon) : null
}

const takeFieldValue = (schema, fieldName) => {
  const result = []
  if (schema.properties) {
    const keys = Object.keys(schema.properties)
    for (const k of keys) {
      if (k === fieldName) {
        result.push(schema.properties[k])
      } else {
        const res = takeFieldValue(schema.properties[k], fieldName)
        result.push(...res)
      }
    }
  }
  return result
}

export function getSchema(schema, values, pdkPropertiesMap) {
  const newSchema = JSON.parse(JSON.stringify(schema))
  const blacklist = ['CSV', 'EXCEL', 'JSON', 'XML']

  if (
    values.attrs.pdkHash &&
    (values.type != 'database' || !blacklist.includes(values.databaseType))
  ) {
    const pdkProperties = pdkPropertiesMap[values.attrs.pdkHash]
    if (pdkProperties) {
      const pdkSchemaList = takeFieldValue(newSchema, 'nodeConfig')
      if (pdkSchemaList?.length) {
        const reactions = import.meta.env.VUE_APP_HIDE_NODE_SCHEMA
          ? {
              'x-reactions': {
                target: import.meta.env.VUE_APP_HIDE_NODE_SCHEMA,
                fulfill: {
                  state: {
                    display: 'hidden',
                  },
                },
              },
            }
          : {}

        pdkSchemaList.forEach((pdkSchema) => {
          Object.assign(pdkSchema, pdkProperties, reactions)
        })
      }
    }
  }

  return newSchema
}

export function getCanUseDataTypes(data = [], val = '') {
  return data
}

export function getMatchedDataTypeLevel(
  field = {},
  canUseDataTypes = [],
  fieldChangeRules = [],
  findPossibleDataTypes = {},
) {
  if (
    isEmpty(findPossibleDataTypes) ||
    !findPossibleDataTypes[field.field_name]
  )
    return ''
  const tapType = JSON.parse(field.tapType || '{}')
  if (tapType.type === 7) {
    field.data_type = ''
  }
  return tapType.type !== 7 && canUseDataTypes.length ? '' : 'error'
}
export function errorFiledType(field) {
  const { tapType } = field || {}
  const type = JSON.parse(tapType).type
  return type === 7 ? 'error' : ''
}

/**
 * @description 根据主键类型过滤表
 * @param {Array} data 表数据
 * @param {string} filterType 过滤类型
 * @param {object} map 表数据映射
 * @returns {Array} 符合条件的表
 */
export function getPrimaryKeyTablesByType(
  data = [],
  filterType = 'All',
  map = {},
) {
  if (filterType === 'All') {
    return data
  }
  const result = data.map((t) => {
    return Object.assign(
      {},
      {
        tableName: t,
        tableComment: '',
        primaryKeyCounts: 0,
        uniqueIndexCounts: 0,
      },
      map[t],
    )
  })
  let list
  switch (filterType) {
    case 'HasKeys':
      list = result.filter((t) => !!t.primaryKeyCounts || !!t.uniqueIndexCounts)
      break
    case 'OnlyPrimaryKey':
      list = result.filter((t) => !!t.primaryKeyCounts && !t.uniqueIndexCounts)
      break
    case 'OnlyUniqueIndex':
      list = result.filter((t) => !t.primaryKeyCounts && !!t.uniqueIndexCounts)
      break
    case 'NoKeys':
      list = result.filter((t) => !t.primaryKeyCounts && !t.uniqueIndexCounts)
      break
    default:
      list = result
  }
  return list.map((t) => t.tableName)
}

/**
 * 表改名全局配置检查是否为空
 * @param config
 * @returns {boolean}
 */
export const ifTableNameConfigEmpty = (config) => {
  return (
    !config.replaceBefore &&
    !config.replaceAfter &&
    !config.prefix &&
    !config.suffix &&
    !config.transferCase
  )
}

/**
 * 获取表改名
 * @param tableName
 * @param config
 * @returns {*}
 */
export const getTableRenameByConfig = (tableName, config) => {
  // 查找替换
  try {
    tableName = config.replaceBefore
      ? tableName.replaceAll(
          new RegExp(config.replaceBefore, 'g'),
          config.replaceAfter,
        )
      : tableName
  } catch (error) {
    console.error(error)
  }

  // 前后缀
  tableName = config.prefix + tableName + config.suffix

  // 转大小写
  if (config.transferCase) {
    tableName = tableName[config.transferCase]()
  }

  return tableName
}

export const genDatabaseNode = (def = {}) => {
  return merge(
    {
      id: uuid(),
      attrs: {
        capabilities: [],
      },
      type: 'database',
    },
    def,
  )
}

export const genProcessorNode = (type, def = {}) => {
  return merge(
    {
      id: uuid(),
      attrs: {},
      type,
    },
    def,
  )
}
