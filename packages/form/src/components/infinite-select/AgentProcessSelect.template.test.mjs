import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./AgentProcessSelect.vue', import.meta.url),
  'utf8',
)

test('wraps selected and option agent names with full-name tooltips', () => {
  assert.equal(
    source.match(/class="agent-process-select__name-tooltip"/g)?.length,
    2,
  )
  assert.match(source, /:content="getName\(item, label\)"/)
  assert.match(
    source,
    /:content="getName\(item, getProcess\(item\)\.proxyProcessId\)"/,
  )
  assert.match(source, /text-overflow: ellipsis/)
})

test('keeps the agent process dropdown width aligned with the select', () => {
  assert.match(source, /<InfiniteSelectComponent[\s\S]*fit-input-width/)
  assert.match(source, /&__main[\s\S]*?flex:\s*1 1 auto/)
  assert.match(
    source,
    /agent-process-select__name-tooltip[\s\S]*?flex:\s*1 1 auto/,
  )
})
