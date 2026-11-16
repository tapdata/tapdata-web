import assert from 'node:assert/strict'
import test from 'node:test'
import { auditExportError } from '../../../packages/api/src/core/audit-export-error.ts'

test('uses the message from an unwrapped server response', async () => {
  const error = await auditExportError({ message: 'No export permission' })
  assert.ok(error instanceof Error)
  assert.equal(error.message, 'No export permission')
})

test('reads JSON blobs even when their content type is absent', async () => {
  const error = await auditExportError(
    new Blob(['{"code":"Audit.Export.TooMany"}']),
  )
  assert.ok(error instanceof Error)
  assert.equal(error.message, 'Audit.Export.TooMany')
})

test('also accepts an Axios-style error containing a JSON blob', async () => {
  const error = await auditExportError({
    response: {
      data: new Blob(['{"message":"Access denied"}'], {
        type: 'application/json',
      }),
    },
  })
  assert.ok(error instanceof Error)
  assert.equal(error.message, 'Access denied')
})

test('preserves network errors and unparseable response blobs', async () => {
  const network = new Error('network unavailable')
  const blob = new Blob(['not json'], { type: 'text/plain' })
  assert.equal(await auditExportError(network), network)
  assert.equal(await auditExportError(blob), blob)
})
