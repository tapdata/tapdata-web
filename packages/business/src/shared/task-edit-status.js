export const taskEditStatuses = [
  'edit',
  'wait_start',
  'complete',
  'error',
  'stop',
  'renew_failed',
]

/** @param {string} status */
export function canEditTaskStatus(status) {
  return (
    taskEditStatuses.includes(status) ||
    ['ready', 'stopped', 'schedule_failed'].includes(status)
  )
}

/** @param {string} status */
export function canEditInspectionStatus(status) {
  return !['running', 'scheduling'].includes(status)
}
