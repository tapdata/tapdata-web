export function getAffectedTaskDlqImpacts(impacts, taskMap = new Map()) {
  return (Array.isArray(impacts) ? impacts : [])
    .filter((impact) => impact?.exists && Number(impact.count) > 0)
    .map((impact) => ({
      ...impact,
      count: Number(impact.count),
      name: taskMap.get(impact.taskId)?.name || impact.taskId,
    }))
    .sort((a, b) => b.count - a.count)
}

export function getTaskDlqImpactMessageKey(operation, isBulk) {
  if (isBulk) {
    return operation === 'delete'
      ? 'packages_business_dataFlow_dlq_bulk_delete_impact_message'
      : 'packages_business_dataFlow_dlq_bulk_reset_impact_message'
  }
  return operation === 'delete'
    ? 'packages_business_dataFlow_dlq_delete_impact_message'
    : 'packages_business_dataFlow_dlq_reset_impact_message'
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

  const affected = getAffectedTaskDlqImpacts(impacts, taskMap)
  return affected.length ? confirmImpact(affected) : confirmOperation()
}
