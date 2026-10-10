import assert from 'node:assert/strict'
import test from 'node:test'
import { canMoveTask, visibleAgentIds } from './rebalance-constraints.ts'

const agents = ['a', 'b', 'c'].map((agentId) => ({ agentId, online: true }))
const task = {
  movable: true,
  sourceAgentId: 'a',
  currentAgentId: 'a',
  allowedAgentIds: ['a', 'b'],
}

test('一任务时显示全部三个在线节点，含零任务节点', () => {
  assert.deepEqual(visibleAgentIds(['a', 'b', 'c'], agents, [task]), [
    'a',
    'b',
    'c',
  ])
})
test('无任务时仍显示在线节点', () => {
  assert.deepEqual(visibleAgentIds(['a', 'b', 'c'], agents, []), [
    'a',
    'b',
    'c',
  ])
})
test('后端候选节点优先于页面中离线或不可用节点', () => {
  assert.deepEqual(visibleAgentIds(['a', 'b'], agents, [task]), ['a', 'b'])
})
test('旧接口显示在线节点但不扩大任务迁移范围', () => {
  assert.deepEqual(
    visibleAgentIds(
      undefined,
      [...agents, { agentId: 'd', online: false }],
      [task],
    ),
    ['a', 'b', 'c'],
  )
  assert.equal(canMoveTask({ movable: true, sourceAgentId: 'a' }, 'b'), false)
})
test('允许组内迁移并可拖回原节点', () => {
  assert.equal(canMoveTask(task, 'b'), true)
  assert.equal(canMoveTask({ ...task, allowedAgentIds: ['b'] }, 'a'), true)
})
test('组外节点拒绝拖放与保存', () => {
  assert.equal(canMoveTask(task, 'c'), false)
})
test('指定单节点等不可移动任务拒绝拖放', () => {
  assert.equal(canMoveTask({ ...task, movable: false }, 'b'), false)
})
test('源节点已离线时仍显示当前任务所在列', () => {
  assert.deepEqual(visibleAgentIds(['b', 'c'], agents, [task]), ['b', 'c', 'a'])
})
