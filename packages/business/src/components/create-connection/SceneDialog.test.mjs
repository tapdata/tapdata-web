import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const source = readFileSync(
  new URL('./SceneDialog.vue', import.meta.url),
  'utf8',
)
const connectorCatalog = JSON.parse(
  readFileSync(new URL('./connectorCatalog.json', import.meta.url), 'utf8'),
)

function createDialog(overrides = {}, api = {}) {
  const script = source
    .match(/<script>([\s\S]*?)<\/script>/)[1]
    .replaceAll(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replaceAll('import.meta.env', '{}')
    .replace('export default', 'return')
  const dependencies = {
    connectorCatalog,
    mapGetters: () => ({}),
    ...Object.fromEntries(
      [
        'RequestDialog',
        'ConnectionForm',
        'ServeForm',
        'VEmpty',
        'DatabaseIcon',
        'IconButton',
        'getConnectorImage',
        'getIcon',
      ].map((key) => [key, () => {}]),
    ),
    ...api,
  }
  const component = new Function(...Object.keys(dependencies), script)(
    ...Object.values(dependencies),
  )
  const dialog = {
    selectorType: 'target',
    isDaas: true,
    isCommunity: false,
    isControlEnabled: false,
    connectors: [],
    connectorJobs: {},
    connectorJobTimers: {},
    connectorReleaseRequestId: 0,
    lockedTypes: [],
    $t: (key) => key,
    $message: { error() {}, success() {}, info() {} },
    persistConnectorJobs() {},
    ...overrides,
  }
  for (const [key, method] of Object.entries(component.methods)) {
    if (!(key in dialog)) dialog[key] = method.bind(dialog)
  }
  return dialog
}

test('recovers the failed job instead of the most recently selected connector', async () => {
  const impacts = []
  const dialog = createDialog(
    {
      connectorJobs: {
        mysql: { jobId: 'mysql-job', artifactId: 'mysql-connector' },
      },
      releaseItem: { pdkId: 'postgres', artifactId: 'postgres-connector' },
    },
    {
      getConnectorRegistrationJob: () =>
        Promise.resolve({
          status: 'failed',
          errorCode: 'RESOURCE_IMPACT_CHANGED',
        }),
      getConnectorRegistrationImpact: (...args) => {
        impacts.push(args)
        return Promise.resolve({ tasks: [], inspects: [] })
      },
    },
  )
  await dialog.pollConnectorRegistration('mysql-job', 'mysql')
  assert.equal(dialog.releaseItem.pdkId, 'mysql')
  assert.deepEqual(impacts, [['mysql', 'mysql-connector']])
  assert.equal(dialog.releaseDialogVisible, true)
})

test('filters installed and uninstalled single-direction connectors before and after releases arrive', async () => {
  let resolveReleases
  const releases = new Promise((resolve) => (resolveReleases = resolve))
  const dialog = createDialog(
    {},
    {
      fetchDatabases: () =>
        Promise.resolve([
          {
            pdkId: 'coding',
            type: 'Coding',
            name: 'Coding',
            connectionType: 'source',
            pdkHash: 'installed',
          },
          {
            pdkId: 'custom-source',
            type: 'Custom Source',
            name: 'Custom Source',
            connectionType: 'source',
            pdkHash: 'custom-installed',
          },
        ]),
      getConnectorReleases: () => releases,
    },
  )
  const check = () => {
    assert.ok(dialog.database.length > 0)
    for (const pdkId of [
      'coding',
      'custom-source',
      'aliyun-adb-mysql',
      'zoho-desk',
    ]) {
      assert.equal(
        dialog.database.some((item) => item.pdkId === pdkId),
        false,
      )
    }
    assert.ok(dialog.database.some((item) => item.pdkId === 'gbase8a'))
  }
  await dialog.getData()
  check()
  resolveReleases([{ artifactId: 'coding-connector', version: '2.0' }])
  await releases
  check()
})

test('preserves entitlements after Nexus refresh and guards selection and upgrades', async () => {
  let resolveReleases
  const releases = new Promise((resolve) => (resolveReleases = resolve))
  let lockedPrompts = 0
  let impactRequests = 0
  const dialog = createDialog(
    {
      isControlEnabled: true,
      connectors: ['Mysql'],
      openLocked: () => lockedPrompts++,
    },
    {
      fetchDatabases: () =>
        Promise.resolve([
          {
            pdkId: 'mysql',
            type: 'Mysql',
            name: 'Mysql',
            version: '1.0',
            connectionType: 'source_and_target',
            pdkHash: 'mysql-installed',
          },
          {
            pdkId: 'postgres',
            type: 'PostgreSQL',
            name: 'PostgreSQL',
            version: '1.0',
            connectionType: 'source_and_target',
            pdkHash: 'postgres-installed',
          },
        ]),
      getConnectorReleases: () => releases,
      getConnectorRegistrationImpact: () => {
        impactRequests++
        return Promise.resolve({ tasks: [], inspects: [] })
      },
    },
  )
  const check = async () => {
    const allowed = dialog.database.find((item) => item.pdkId === 'mysql')
    const forbidden = dialog.database.find((item) => item.pdkId === 'postgres')
    const uninstalled = dialog.database.find((item) => item.pdkId === 'oracle')
    assert.equal(allowed.locked, false)
    assert.equal(forbidden.locked, true)
    assert.equal(uninstalled.locked, true)
    await dialog.handleSelect(uninstalled)
    await dialog.handleReleaseAction(forbidden)
    assert.equal(impactRequests, 0)
    assert.equal(dialog.releaseDialogVisible, undefined)
  }
  await dialog.getData()
  await check()
  resolveReleases([
    { artifactId: 'postgres-connector', version: '2.0' },
    { artifactId: 'oracle-connector', version: '2.0' },
  ])
  await releases
  await check()
  assert.equal(lockedPrompts, 4)
})

test('shows a failed job error and removes its persisted progress', async () => {
  const errors = []
  const persisted = []
  const dialog = createDialog(
    {
      connectorJobs: { mysql: { jobId: 'failed-job' } },
      $message: { error: (message) => errors.push(message) },
      persistConnectorJobs: (jobs) => persisted.push(jobs),
    },
    {
      getConnectorRegistrationJob: () =>
        Promise.resolve({
          status: 'failed',
          error: 'Download checksum mismatch',
        }),
    },
  )
  await dialog.pollConnectorRegistration('failed-job', 'mysql')
  assert.deepEqual(errors, ['Download checksum mismatch'])
  assert.deepEqual(dialog.connectorJobs, {})
  assert.deepEqual(persisted, [{}])
  assert.deepEqual(dialog.connectorJobTimers, {})
})

test('keeps confirmation open and shows registration request errors', async () => {
  const errors = []
  const dialog = createDialog(
    {
      releaseDialogVisible: true,
      releaseItem: { pdkId: 'mysql', artifactId: 'mysql-connector' },
      releaseImpact: { tasks: [], inspects: [] },
      $message: { error: (message) => errors.push(message) },
    },
    {
      registerConnectorRelease: () =>
        Promise.reject(new Error('Nexus unavailable')),
      getConnectorRegistrationImpact: () =>
        Promise.resolve({ tasks: [], inspects: [] }),
    },
  )
  await dialog.registerRelease(false)
  assert.deepEqual(errors, ['Nexus unavailable'])
  assert.equal(dialog.releaseDialogVisible, true)
  assert.equal(dialog.releaseLoading, false)
  assert.deepEqual(dialog.connectorJobs, {})
})
