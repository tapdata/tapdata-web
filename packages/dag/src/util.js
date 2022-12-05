import { getConnectionIcon } from '@tap/business'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    return getConnectionIcon(pdkHash)
  }
  let icon = node.type === 'table' || node.type === 'database' || node.databaseType ? node.databaseType : node.type
  return icon ? require(`web-core/assets/icons/node/${icon}.svg`) : null
}

const takeFieldValue = (schema, fieldName) => {
  if (schema.properties) {
    const keys = Object.keys(schema.properties)
    if (keys.includes(fieldName)) {
      return schema.properties[fieldName]
    }
    for (let k of keys) {
      let res = takeFieldValue(schema.properties[k], fieldName)
      if (res) return res
    }
  }
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

  if (values.attrs.pdkHash) {
    const pdkProperties = pdkPropertiesMap[values.attrs.pdkHash]
    if (pdkProperties) {
      const pdkSchema = takeFieldValue(newSchema, 'nodeConfig')
      Object.assign(pdkSchema, pdkProperties)
    }
  }

  return newSchema
}
