export const DQL_TASK_NAME_MAX_LENGTH = 64
export const DQL_TASK_NAME_LIST_MAX_LENGTH = 15

export function getDqlTaskNameTooltipContent(taskName?: string): string {
  return taskName ?? ''
}

export function shouldShowDqlTaskNameTooltip(
  taskName?: string,
  maxLength = DQL_TASK_NAME_LIST_MAX_LENGTH,
): boolean {
  return Array.from(taskName ?? '').length > maxLength
}

export function displayDqlTaskName(
  taskName?: string,
  maxLength = DQL_TASK_NAME_MAX_LENGTH,
) {
  if (!taskName) return taskName ?? ''

  const characters = Array.from(taskName)
  if (characters.length <= maxLength) return taskName

  return `${characters.slice(0, maxLength - 1).join('')}…`
}
