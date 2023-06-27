import { isEmpty } from 'lodash'
import { getConnectionIcon } from '@tap/business'
import { getIcon } from '@tap/assets/icons'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    return getConnectionIcon(pdkHash)
  }
  let icon = node.type === 'table' || node.type === 'database' || node.databaseType ? node.databaseType : node.type
  if (node.type === 'hazelcastIMDG') {
    const map = {
      memory: 'memory',
      mongodb: 'mongodb',
      rocksdb: 'rocksdb'
    }
    icon = map[node.externaltype]
  }
  return icon ? getIcon(icon) : null
}

const takeFieldValue = (schema, fieldName) => {
  let result = []
  if (schema.properties) {
    const keys = Object.keys(schema.properties)
    for (let k of keys) {
      if (k === fieldName) {
        result.push(schema.properties[k])
      } else {
        let res = takeFieldValue(schema.properties[k], fieldName)
        result.push(...res)
      }
    }
  }
  return result
}

export function getSchema(schema, values, pdkPropertiesMap) {
  let newSchema = JSON.parse(JSON.stringify(schema))
  const blacklist = ['CSV', 'EXCEL', 'JSON', 'XML']

  if (values.attrs.pdkHash && (values.type != 'database' || !blacklist.includes(values.databaseType))) {
    const pdkProperties = pdkPropertiesMap[values.attrs.pdkHash]
    if (pdkProperties) {
      const pdkSchemaList = takeFieldValue(newSchema, 'nodeConfig')
      if (pdkSchemaList?.length) {
        pdkSchemaList.forEach(pdkSchema => Object.assign(pdkSchema, pdkProperties))
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
  findPossibleDataTypes = {}
) {
  if (isEmpty(findPossibleDataTypes) || !findPossibleDataTypes[field.field_name]) return ''
  const tapType = JSON.parse(field.tapType || '{}')
  if (tapType.type === 7) {
    field.data_type = ''
  }
  return tapType.type !== 7 && canUseDataTypes.length ? '' : 'error'
}
export function errorFiledType(field) {
  const { tapType } = field || {}
  let type = JSON.parse(tapType).type
  return type === 7 ? 'error' : ''
}

/**
 * @description 根据主键类型过滤表
 * @param {Array} data 表数据
 * @param {String} filterType 过滤类型
 * @param {Object} map 表数据映射
 * @returns {Array} 符合条件的表
 * */
export function getPrimaryKeyTablesByType(data = [], filterType = 'All', map = {}) {
  if (filterType === 'All') {
    return data
  }
  const result = data.map(t => {
    return Object.assign({}, { tableName: t, tableComment: '', primaryKeyCounts: 0 }, map[t])
  })
  const list =
    filterType === 'HasKeys' ? result.filter(t => !!t.primaryKeyCounts) : result.filter(t => !t.primaryKeyCounts)
  return list.map(t => t.tableName)
}
