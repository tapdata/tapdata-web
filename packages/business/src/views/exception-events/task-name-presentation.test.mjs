import assert from 'node:assert/strict'
import test from 'node:test'

import * as taskNamePresentation from './task-name-presentation.ts'

const {
  displayDlqTaskName,
  DLQ_TASK_NAME_MAX_LENGTH,
  DLQ_TASK_NAME_LIST_MAX_LENGTH,
} = taskNamePresentation

test('keeps task names within the display limit unchanged', () => {
  const taskName = 'a'.repeat(DLQ_TASK_NAME_MAX_LENGTH)

  assert.equal(displayDlqTaskName(taskName), taskName)
})

test('truncates long task names and reserves one character for the ellipsis', () => {
  const taskName = 'a'.repeat(DLQ_TASK_NAME_MAX_LENGTH + 10)
  const displayedTaskName = displayDlqTaskName(taskName)

  assert.equal(Array.from(displayedTaskName).length, DLQ_TASK_NAME_MAX_LENGTH)
  assert.equal(displayedTaskName.endsWith('…'), true)
  assert.equal(
    displayedTaskName.slice(0, -1),
    'a'.repeat(DLQ_TASK_NAME_MAX_LENGTH - 1),
  )
})

test('supports a shorter limit for the event list', () => {
  const taskName = 'a'.repeat(DLQ_TASK_NAME_LIST_MAX_LENGTH + 10)
  const displayedTaskName = displayDlqTaskName(
    taskName,
    DLQ_TASK_NAME_LIST_MAX_LENGTH,
  )

  assert.equal(
    Array.from(displayedTaskName).length,
    DLQ_TASK_NAME_LIST_MAX_LENGTH,
  )
  assert.equal(displayedTaskName.endsWith('…'), true)
})

test('keeps the full task name as tooltip content after list truncation', () => {
  const taskName = 'a'.repeat(DLQ_TASK_NAME_LIST_MAX_LENGTH + 10)
  const getTooltipContent = taskNamePresentation.getDlqTaskNameTooltipContent
  const shouldShowTooltip = taskNamePresentation.shouldShowDlqTaskNameTooltip

  assert.equal(typeof getTooltipContent, 'function')
  assert.equal(getTooltipContent?.(taskName), taskName)
  assert.equal(typeof shouldShowTooltip, 'function')
  assert.equal(
    shouldShowTooltip?.(taskName, DLQ_TASK_NAME_LIST_MAX_LENGTH),
    true,
  )
})

test('does not enable the task name tooltip when the list name is not truncated', () => {
  const taskName = 'a'.repeat(DLQ_TASK_NAME_LIST_MAX_LENGTH)
  const shouldShowTooltip = taskNamePresentation.shouldShowDlqTaskNameTooltip

  assert.equal(typeof shouldShowTooltip, 'function')
  assert.equal(
    shouldShowTooltip?.(taskName, DLQ_TASK_NAME_LIST_MAX_LENGTH),
    false,
  )
})

test('counts unicode characters instead of UTF-16 code units', () => {
  const taskName = '任务😀'.repeat(DLQ_TASK_NAME_MAX_LENGTH)
  const displayedTaskName = displayDlqTaskName(taskName)

  assert.equal(Array.from(displayedTaskName).length, DLQ_TASK_NAME_MAX_LENGTH)
  assert.equal(displayedTaskName.endsWith('…'), true)
})
