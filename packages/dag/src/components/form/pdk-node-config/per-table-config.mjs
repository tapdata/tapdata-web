function propertiesOf(schema) {
  if (typeof schema?.reduceProperties === 'function') {
    return schema.reduceProperties((properties, fieldSchema, key) => {
      properties[key] = fieldSchema
      return properties
    }, {})
  }
  return schema?.properties || {}
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]),
    )
  }
  return value
}

function equalValue(left, right) {
  if (Object.is(left, right)) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
    return false
  }
  if (Array.isArray(left) !== Array.isArray(right)) return false
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        equalValue(left[key], right[key]),
    )
  )
}

export function pickPerTableConfig(schema, values) {
  const picked = {}
  for (const [key, fieldSchema] of Object.entries(propertiesOf(schema))) {
    if (fieldSchema?.['x-perTable'] === true) {
      if (values?.[key] !== undefined) picked[key] = cloneValue(values[key])
      continue
    }
    if (fieldSchema?.type === 'object' && fieldSchema.properties) {
      const nested = pickPerTableConfig(fieldSchema, values?.[key])
      if (Object.keys(nested).length) picked[key] = nested
    }
  }
  return picked
}

export function syncInheritedPerTableValues(
  schema,
  tableValues,
  previousNodeValues,
  nextNodeValues,
) {
  const synced = pickPerTableConfig(schema, tableValues || {})
  for (const [key, fieldSchema] of Object.entries(propertiesOf(schema))) {
    if (fieldSchema?.['x-perTable'] === true) {
      const current = synced[key]
      const inherited = current === undefined || equalValue(current, previousNodeValues?.[key])
      if (inherited && !equalValue(previousNodeValues?.[key], nextNodeValues?.[key])) {
        if (nextNodeValues?.[key] === undefined) delete synced[key]
        else synced[key] = cloneValue(nextNodeValues[key])
      }
      continue
    }
    if (fieldSchema?.type === 'object' && fieldSchema.properties) {
      const nested = syncInheritedPerTableValues(
        fieldSchema,
        synced[key],
        previousNodeValues?.[key],
        nextNodeValues?.[key],
      )
      if (Object.keys(nested).length) synced[key] = nested
      else delete synced[key]
    }
  }
  return synced
}

export function perTableValuesEqual(left, right) {
  return equalValue(left, right)
}
