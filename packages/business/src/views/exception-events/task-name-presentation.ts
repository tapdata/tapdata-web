export const DLQ_TASK_NAME_MAX_LENGTH = 64
export const DLQ_TASK_NAME_LIST_MAX_LENGTH = 15

export function getDlqTaskNameTooltipContent(taskName?: string): string {
  return taskName ?? ''
}

export function shouldShowDlqTaskNameTooltip(
  taskName?: string,
  maxLength = DLQ_TASK_NAME_LIST_MAX_LENGTH,
): boolean {
  return Array.from(taskName ?? '').length > maxLength
}

export function displayDlqTaskName(
  taskName?: string,
  maxLength = DLQ_TASK_NAME_MAX_LENGTH,
) {
  if (!taskName) return taskName ?? ''

  const characters = Array.from(taskName)
  if (characters.length <= maxLength) return taskName

  return `${characters.slice(0, maxLength - 1).join('')}…`
}
