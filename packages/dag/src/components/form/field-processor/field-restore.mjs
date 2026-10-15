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

    field.targetFieldName =
      defaultTargetFieldNames?.get(field.sourceFieldName) ??
      field.sourceFieldName
    field.isShow = true
  })

  const mappings = fieldMappings || []
  const hasSelectedOverrides = mappings.some(
    (mapping) =>
      mapping.qualifiedName === qualifiedName &&
      (mapping.fields || []).some((field) =>
        selectedNames.has(field.sourceFieldName),
      ),
  )
  if (!hasSelectedOverrides) return mappings

  return mappings.flatMap((mapping) => {
    if (mapping.qualifiedName !== qualifiedName) return [mapping]

    const remainingFields = (mapping.fields || []).filter(
      (field) => !selectedNames.has(field.sourceFieldName),
    )
    return remainingFields.length
      ? [{ ...mapping, fields: remainingFields }]
      : []
  })
}
