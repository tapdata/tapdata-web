import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('task operation confirmation imports the DLQ impact checker', async () => {
  const source = await readFile(
    new URL('./useCanvasOperation.ts', import.meta.url),
    'utf8',
  )

  assert.match(
    source,
    /import\s*\{[\s\S]*\bcheckTaskDlqImpact\b[\s\S]*\}\s*from '@tap\/api\/src\/core\/task'/,
  )
})
