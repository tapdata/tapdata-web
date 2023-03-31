import { getConnectionIcon } from '@tap/business'
import { getIcon } from '@tap/assets/icons'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    return getConnectionIcon(pdkHash)
  }
  let icon = node.type === 'table' || node.type === 'database' || node.databaseType ? node.databaseType : node.type
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
  let newSchema
  if (schema.schema && schema.form) {
    // 临时判断从自定义节点过来的schema
    // 表单数据存储到form对象
    newSchema = {
      type: 'object',
      properties: {
        form: JSON.parse(JSON.stringify(schema.schema))
      }
    }
  } else {
    newSchema = JSON.parse(JSON.stringify(schema))
  }

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
  const index = data.findIndex(t => t === val)
  return index > -1 ? data.slice(index) : []
}

export function getMatchedDataTypeLevel(
  field,
  canUseDataTypes = [],
  fieldChangeRules = [],
  findPossibleDataTypes = {}
) {
  const { data_type, changeRuleId, field_name } = field || {}
  if (!findPossibleDataTypes[field_name]) return ''
  const { selectDataType } = fieldChangeRules.find(t => t.id === changeRuleId)?.result?.selectDataType || {}
  return selectDataType ||
    (!selectDataType &&
      canUseDataTypes.length &&
      canUseDataTypes.findIndex(c => c === data_type) === canUseDataTypes.length - 1)
    ? ''
    : !canUseDataTypes.includes(selectDataType || data_type)
    ? 'error'
    : 'warning'
}
export function errorFiledType(field) {
  const { tapType } = field || {}
  let type = JSON.parse(tapType).type
  return type === 7 ? 'error' : ''
}
