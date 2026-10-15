export function restoreSelectedFieldState(
  rows,
  fieldMappings,
  qualifiedName,
  selectedFieldNames,
  defaultTargetFieldNames,
) {
  const selectedNames = new Set(selectedFieldNames)

  rows.forEach((field) => {
    if (!selectedNames.has(field.sourceFieldName)) return

    field.isShow = true
    field.targetFieldName =
      defaultTargetFieldNames?.get(field.sourceFieldName) ??
      field.sourceFieldName
  })

  const mappings = fieldMappings || []
  const tableIndex = mappings.findIndex(
    (mapping) => mapping.qualifiedName === qualifiedName,
  )
  if (tableIndex === -1) return mappings

  const tableMapping = mappings[tableIndex]
  const tableFields = tableMapping.fields || []
  const hasSelectedOverrides = tableFields.some((field) =>
    selectedNames.has(field.sourceFieldName),
  )
  if (!hasSelectedOverrides) return mappings

  const remainingFields = tableFields.filter(
    (field) => !selectedNames.has(field.sourceFieldName),
  )
  if (remainingFields.length === 0) {
    return mappings.filter((_, index) => index !== tableIndex)
  }

  return mappings.map((mapping, index) =>
    index === tableIndex ? { ...mapping, fields: remainingFields } : mapping,
  )
}
