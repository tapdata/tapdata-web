export function getAffectedTaskDqlImpacts(impacts, taskMap = new Map()) {
  return (Array.isArray(impacts) ? impacts : [])
    .filter((impact) => impact?.exists && Number(impact.count) > 0)
    .map((impact) => ({
      ...impact,
      count: Number(impact.count),
      name: taskMap.get(impact.taskId)?.name || impact.taskId,
    }))
    .sort((a, b) => b.count - a.count)
}

export function getTaskDqlImpactMessageKey(operation, isBulk) {
  if (isBulk) {
    return operation === 'delete'
      ? 'packages_business_dataFlow_dql_bulk_delete_impact_message'
      : 'packages_business_dataFlow_dql_bulk_reset_impact_message'
  }
  return operation === 'delete'
    ? 'packages_business_dataFlow_dql_delete_impact_message'
    : 'packages_business_dataFlow_dql_reset_impact_message'
}

export async function confirmTaskOperation({
  taskIds,
  taskMap,
  fetchImpacts,
  confirmImpact,
  confirmOperation,
}) {
  let impacts
  try {
    impacts = await fetchImpacts(taskIds)
  } catch {
    return confirmOperation()
  }

  const affected = getAffectedTaskDqlImpacts(impacts, taskMap)
  return affected.length ? confirmImpact(affected) : confirmOperation()
}
