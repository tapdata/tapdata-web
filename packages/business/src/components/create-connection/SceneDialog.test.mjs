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
  const storage = new Map()
  const dependencies = {
    window: {
      localStorage: {
        setItem: (key, value) => storage.set(key, value),
        getItem: (key) => storage.get(key),
        removeItem: (key) => storage.delete(key),
      },
    },
    connectorCatalog,
    mapGetters: () => ({}),
    ...Object.fromEntries(
      [
        'RequestDialog',
        'ConnectorQualityBadge',
        'ConnectorReleaseDialog',
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
    connectorCatalogLoading: false,
    currentScene: 'installed',
    sceneList: [],
    tagList: [],
    startingTour: false,
    pausedGuide: false,
    lockedTypes: [],
    $t: (key) => key,
    $message: { error() {}, success() {}, info() {} },
    $i18n: { locale: 'zh-CN' },
    storage,
    connectorJobsStorageKey: 'tapdata.connectorRegistrationJobs',
    releaseImpactRequestId: 0,
    releaseImpact: { tasks: [], inspects: [] },
    database: [],
    ...overrides,
  }
  for (const [key, method] of Object.entries(component.methods)) {
    if (!(key in dialog)) dialog[key] = method.bind(dialog)
  }
  for (const [key, getter] of Object.entries(component.computed)) {
    if (!(key in dialog) && typeof getter === 'function') {
      Object.defineProperty(dialog, key, { get: getter.bind(dialog) })
    }
  }
  return dialog
}

test('enterprise browsing defaults to installed while other sidebar categories and search include the full catalog', () => {
  const dialog = createDialog({
    selectorType: 'source_and_target',
    tagList: [
      { key: 'all' },
      { key: 'recommend' },
      { key: 'Database' },
      { key: 'File' },
      { key: 'Custom' },
    ],
    database: [
      {
        pdkId: 'mysql',
        name: 'MySQL',
        pdkHash: 'mysql-hash',
        tags: ['Database'],
      },
      { pdkId: 'json', name: 'JSON', pdkHash: 'json-hash', tags: ['File'] },
      {
        pdkId: 'custom',
        name: 'Private',
        pdkHash: 'private-hash',
        tags: ['Custom'],
      },
      { pdkId: 'legacy', name: 'Legacy API', tags: ['Database'] },
      { pdkId: 'xml', name: 'XML', requiresDownload: true, tags: ['File'] },
      {
        pdkId: 'aws',
        name: 'Amazon MySQL',
        requiresDownload: true,
        tags: ['Database'],
      },
    ],
  })
  dialog.resetConnectorBrowser()
  assert.equal(dialog.currentScene, 'installed')
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['mysql', 'json', 'custom', 'legacy'],
  )
  assert.equal(dialog.installedConnectorCount, 4)
  assert.equal(
    dialog.options.some((item) => item.key === 'recommend'),
    true,
  )

  dialog.handleSelectScene({ key: 'all' })
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['mysql', 'json', 'custom', 'legacy', 'xml', 'aws'],
  )
  assert.equal(
    dialog.options.some((item) => item.key === 'Custom'),
    true,
  )
  dialog.currentScene = 'File'
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['json', 'xml'],
  )
  dialog.handleSelectScene({ key: 'installed' })
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['mysql', 'json', 'custom', 'legacy'],
  )
  dialog.search = 'mysql'
  assert.deepEqual(
    dialog.connectorSections.map((section) => [
      section.key,
      section.items.map((item) => item.pdkId),
    ]),
    [
      ['installed', ['mysql']],
      ['available', ['aws']],
    ],
  )
})

test('enterprise target filters use connector types and keep the API creation entry', () => {
  const dialog = createDialog({
    tagList: [{ key: 'all' }, { key: 'SaaS' }],
    sceneList: [{ key: 'api', hidden: false }],
    currentScene: 'SaaS',
    database: [
      { pdkId: 'saas', name: 'SaaS', pdkHash: 'hash', tags: ['SaaS'] },
    ],
  })
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['saas'],
  )
  assert.ok(dialog.options.some((item) => item.key === 'api'))
})

test('API category global search waits for the pending connector catalog without blocking the API entry itself', () => {
  const dialog = createDialog({
    currentScene: 'api',
    specialScene: { api: [{ key: 'apiApp' }] },
    connectorCatalogLoading: true,
  })
  assert.equal(dialog.showSpecialScene, true)
  assert.equal(dialog.connectorListLoading, false)
  dialog.search = 'mysql'
  assert.equal(dialog.showSpecialScene, false)
  assert.deepEqual(dialog.connectorSections, [])
  assert.equal(dialog.connectorListLoading, true)
  dialog.database = [{ pdkId: 'mysql', name: 'MySQL', requiresDownload: true }]
  assert.equal(dialog.connectorListLoading, false)
  assert.equal(dialog.connectorSections[0].items[0].pdkId, 'mysql')
})

test('installed, type and search empty states share recovery to the full catalog without hiding pending results', () => {
  const dialog = createDialog()
  dialog.resetConnectorBrowser()
  assert.equal(dialog.showInstalledEmptyState, true)
  assert.equal(
    dialog.connectorEmptyMessage,
    'packages_business_connector_none_installed',
  )
  assert.equal(dialog.canResetConnectorFilters, true)
  for (const category of ['Database', 'SaaS', 'File', 'Custom', 'recommend']) {
    dialog.handleSelectScene({ key: category })
    assert.equal(dialog.connectorSections.length, 0)
    assert.equal(
      dialog.connectorEmptyMessage,
      'packages_business_connector_no_matches',
    )
    assert.equal(dialog.canResetConnectorFilters, true)
  }
  dialog.handleSelectScene({ key: 'all' })
  assert.equal(dialog.canResetConnectorFilters, false)
  dialog.search = 'not-found'
  assert.equal(dialog.canResetConnectorFilters, true)
  dialog.connectorCatalogLoading = true
  assert.equal(dialog.connectorListLoading, true)
  dialog.handleSelectScene({ key: 'all' })
  assert.equal(dialog.search, '')
  assert.equal(dialog.currentScene, 'all')
})

test('Cloud and community keep their existing recommendation and target-scenario browsing', () => {
  for (const platform of [
    { isDaas: false, isCommunity: false },
    { isDaas: true, isCommunity: true },
  ]) {
    const mysql = {
      pdkId: 'mysql',
      name: 'MySQL',
      type: 'Mysql',
      pdkHash: 'hash',
    }
    const dialog = createDialog({
      ...platform,
      sceneList: [{ key: 'recommend', types: ['Mysql'] }, { key: 'api' }],
      database: [mysql],
      databaseTypeMap: { Mysql: mysql },
    })
    dialog.resetConnectorBrowser()
    assert.equal(dialog.usesConnectorCatalog, false)
    assert.equal(dialog.currentScene, 'recommend')
    assert.deepEqual(dialog.sceneDatabases, [mysql])
    assert.equal(dialog.connectorSections.length, 1)
    assert.ok(dialog.options.some((item) => item.key === 'api'))
  }
})

test('a pending release catalog keeps local entries usable and waits before showing empty category or search results', async () => {
  let resolveReleases
  const releases = new Promise((resolve) => (resolveReleases = resolve))
  const dialog = createDialog(
    { selectorType: 'source_and_target' },
    {
      fetchDatabases: () =>
        Promise.resolve([
          {
            pdkId: 'mysql',
            name: 'MySQL',
            type: 'Mysql',
            pdkHash: 'hash',
            connectionType: 'source_and_target',
          },
        ]),
      getConnectorReleases: () => releases,
    },
  )
  await dialog.getData()
  assert.equal(dialog.connectorListLoading, false)
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['mysql'],
  )
  dialog.handleSelectScene({ key: 'all' })
  assert.equal(dialog.connectorListLoading, false)
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['mysql'],
  )
  dialog.search = 'mongo'
  assert.equal(dialog.connectorListLoading, true)
  assert.deepEqual(dialog.sceneDatabases, [])
  resolveReleases([{ artifactId: 'mongodb-connector', version: '2.11.0' }])
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(dialog.connectorListLoading, false)
  assert.equal(dialog.currentScene, 'all')
  assert.deepEqual(
    dialog.sceneDatabases.map((item) => item.pdkId),
    ['mongodb'],
  )
})

test('installation completion returns its open dialog to installed connectors without interrupting other browsing', async () => {
  for (const context of [
    { visible: true, selected: 'mysql', expected: 'installed' },
    { visible: true, selected: 'postgres', expected: 'File' },
    { visible: false, selected: 'mysql', expected: 'File' },
  ]) {
    const dialog = createDialog(
      {
        currentScene: 'File',
        releaseDialogVisible: context.visible,
        releaseItem: { pdkId: context.selected },
        connectorJobs: { mysql: { jobId: 'install', operation: 'install' } },
        getData: () => Promise.resolve(),
      },
      {
        getConnectorRegistrationJob: () =>
          Promise.resolve({ status: 'completed', progress: 100 }),
      },
    )
    await dialog.pollConnectorRegistration('install', 'mysql')
    assert.equal(dialog.currentScene, context.expected)
  }
})

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
            pdkId: 'mysql',
            type: 'Mysql',
            name: 'MySQL',
            connectionType: 'source_and_target',
            pdkHash: 'mysql-installed',
          },
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
  const check = (installAvailable) => {
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
    assert.equal(
      dialog.database.some((item) => item.pdkId === 'gbase8a'),
      installAvailable,
    )
  }
  await dialog.getData()
  check(false)
  resolveReleases([
    { artifactId: 'coding-connector', version: '2.0' },
    { artifactId: 'gbase8a-connector', version: '2.0' },
  ])
  await releases
  check(true)
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
    if (uninstalled) {
      assert.equal(uninstalled.locked, true)
      await dialog.handleSelect(uninstalled)
    }
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
  assert.equal(lockedPrompts, 3)
})

test('retains a failed result but removes it from persisted active jobs', async () => {
  const errors = []
  const dialog = createDialog(
    {
      connectorJobs: { mysql: { jobId: 'failed-job' } },
      $message: { error: (message) => errors.push(message) },
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
  assert.equal(dialog.connectorJobs.mysql.status, 'failed')
  assert.equal(dialog.connectorJobs.mysql.error, 'Download checksum mismatch')
  assert.equal(dialog.storage.has(dialog.connectorJobsStorageKey), false)
  assert.deepEqual(dialog.connectorJobTimers, {})
})

test('keeps confirmation open with an inline registration request error', async () => {
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
  assert.deepEqual(errors, [])
  assert.equal(dialog.releaseRequestError, 'Nexus unavailable')
  assert.equal(dialog.releaseDialogVisible, true)
  assert.equal(dialog.releaseLoading, false)
  assert.deepEqual(dialog.connectorJobs, {})
})

test('completed jobs retain the installation result and clear persisted polling state', async () => {
  const dialog = createDialog(
    {
      releaseDialogVisible: true,
      releaseItem: { pdkId: 'mysql' },
      connectorJobs: {
        mysql: {
          jobId: 'install-job',
          operation: 'install',
          releaseVersion: '2.1.0',
        },
      },
      getData: () => Promise.resolve(),
    },
    {
      getConnectorRegistrationJob: () =>
        Promise.resolve({
          jobId: 'install-job',
          status: 'completed',
          progress: 100,
        }),
    },
  )
  await dialog.pollConnectorRegistration('install-job', 'mysql')
  assert.equal(dialog.connectorJobs.mysql.operation, 'install')
  assert.equal(dialog.connectorJobs.mysql.status, 'completed')
  assert.equal(dialog.connectorJobs.mysql.progress, 100)
  assert.equal(dialog.storage.has(dialog.connectorJobsStorageKey), false)
  assert.deepEqual(dialog.connectorJobTimers, {})
})

test('completion hides the card action during catalog refresh while retaining the result and allowing future releases', async () => {
  for (const operation of ['install', 'update']) {
    let finishRefresh
    const item = {
      pdkId: 'mysql',
      releaseVersion: '2.1.0',
      requiresDownload: operation === 'install',
      updateAvailable: operation === 'update',
    }
    const dialog = createDialog(
      {
        releaseDialogVisible: true,
        releaseItem: item,
        connectorJobs: {
          mysql: {
            jobId: 'job',
            status: 'registering',
            operation,
            releaseVersion: '2.1.0',
          },
        },
        getData: () => new Promise((resolve) => (finishRefresh = resolve)),
      },
      {
        getConnectorRegistrationJob: () =>
          Promise.resolve({ status: 'completed', progress: 100 }),
      },
    )
    assert.equal(dialog.showConnectorAction(item), true)
    const polling = dialog.pollConnectorRegistration('job', 'mysql')
    await Promise.resolve()
    assert.equal(dialog.connectorJobs.mysql.status, 'completed')
    assert.equal(dialog.releaseDialogVisible, true)
    assert.equal(dialog.showConnectorAction(item), false)
    finishRefresh()
    await polling
    assert.equal(dialog.showConnectorAction(item), false)
    assert.equal(
      dialog.showConnectorAction({
        ...item,
        requiresDownload: false,
        updateAvailable: true,
        releaseVersion: '2.2.0',
      }),
      true,
    )
  }
})

test('a polling outage retains the active job and cannot resubmit registration', async () => {
  let submitted = 0
  const dialog = createDialog(
    {
      releaseDialogVisible: true,
      releaseItem: { pdkId: 'mysql', artifactId: 'mysql-connector' },
      connectorJobs: {
        mysql: { jobId: 'live-job', status: 'downloading', progress: 40 },
      },
    },
    {
      getConnectorRegistrationJob: () => Promise.reject(new Error('offline')),
      registerConnectorRelease: () => {
        submitted++
        return Promise.resolve({})
      },
    },
  )
  await dialog.pollConnectorRegistration('live-job', 'mysql', 10)
  assert.equal(dialog.connectorJobs.mysql.jobId, 'live-job')
  assert.equal(dialog.connectorJobs.mysql.status, 'downloading')
  assert.ok(dialog.connectorJobs.mysql.pollError)
  assert.equal(
    JSON.parse(dialog.storage.get(dialog.connectorJobsStorageKey)).mysql.jobId,
    'live-job',
  )
  await dialog.registerRelease(false)
  assert.equal(submitted, 0)
  assert.deepEqual(dialog.connectorJobTimers, {})
})

test('a delayed impact response cannot replace the selected connector impact', async () => {
  let resolveFirst
  const first = new Promise((resolve) => {
    resolveFirst = resolve
  })
  const dialog = createDialog(
    {},
    {
      getConnectorRegistrationImpact: (pdkId) =>
        pdkId === 'mysql'
          ? first
          : Promise.resolve({ tasks: [{ id: 'postgres-task' }], inspects: [] }),
    },
  )
  const request = dialog.handleReleaseAction({
    pdkId: 'mysql',
    artifactId: 'mysql-connector',
    releaseAvailable: true,
  })
  await dialog.handleReleaseAction({
    pdkId: 'postgres',
    artifactId: 'postgres-connector',
    releaseAvailable: true,
  })
  resolveFirst({ tasks: [{ id: 'mysql-task' }], inspects: [] })
  await request
  assert.equal(dialog.releaseItem.pdkId, 'postgres')
  assert.equal(dialog.releaseImpact.tasks[0].id, 'postgres-task')
  assert.equal(dialog.releaseImpactLoading, false)
})

test('an impact query failure stays visible and blocks registration', async () => {
  let submitted = 0
  const dialog = createDialog(
    {},
    {
      getConnectorRegistrationImpact: () =>
        Promise.reject(new Error('catalog offline')),
      registerConnectorRelease: () => {
        submitted++
        return Promise.resolve({})
      },
    },
  )
  await dialog.handleReleaseAction({
    pdkId: 'mysql',
    artifactId: 'mysql-connector',
    releaseAvailable: true,
  })
  assert.equal(dialog.releaseDialogVisible, true)
  assert.equal(dialog.releaseImpactError, 'catalog offline')
  await dialog.registerRelease(false)
  assert.equal(submitted, 0)
})

test('an unmounted dialog cannot restart polling after an in-flight response', async () => {
  let resolveJob
  const response = new Promise((resolve) => {
    resolveJob = resolve
  })
  const dialog = createDialog(
    { connectorJobs: { mysql: { jobId: 'live-job', status: 'downloading' } } },
    { getConnectorRegistrationJob: () => response },
  )
  const polling = dialog.pollConnectorRegistration('live-job', 'mysql')
  dialog.connectorPollingDisposed = true
  resolveJob({ status: 'registering', progress: 80 })
  await polling
  assert.deepEqual(dialog.connectorJobTimers, {})
  assert.equal(dialog.connectorJobs.mysql.status, 'downloading')
})

test('impact changes in a background job do not replace another open confirmation', async () => {
  const dialog = createDialog(
    {
      releaseDialogVisible: true,
      releaseItem: { pdkId: 'postgres' },
      connectorJobs: {
        mysql: { jobId: 'mysql-job', artifactId: 'mysql-connector' },
      },
    },
    {
      getConnectorRegistrationJob: () =>
        Promise.resolve({
          status: 'failed',
          errorCode: 'RESOURCE_IMPACT_CHANGED',
        }),
    },
  )
  await dialog.pollConnectorRegistration('mysql-job', 'mysql')
  assert.equal(dialog.releaseItem.pdkId, 'postgres')
  assert.equal(dialog.connectorJobs.mysql.status, 'failed')
  assert.equal(dialog.storage.has(dialog.connectorJobsStorageKey), false)
})

test('registration sends the selected policy and uses backend progress without simulation', async () => {
  const calls = []
  const dialog = createDialog(
    {
      releaseDialogVisible: true,
      releaseItem: {
        pdkId: 'mysql',
        artifactId: 'mysql-connector',
        name: 'MySQL',
        version: '1.0',
        releaseVersion: '2.1',
      },
      releaseImpact: { tasks: [{ id: 'task' }], inspects: [] },
      getData: () => Promise.resolve(),
    },
    {
      registerConnectorRelease: (data) => {
        calls.push(data)
        return Promise.resolve({ jobId: 'job', status: 'queued', progress: 0 })
      },
      getConnectorRegistrationJob: () =>
        Promise.resolve({ status: 'completed', progress: 100 }),
    },
  )
  await dialog.registerRelease(false)
  await Promise.resolve()
  assert.deepEqual(calls, [
    {
      pdkId: 'mysql',
      artifactId: 'mysql-connector',
      stopTasks: false,
      ignoreInFlightResources: true,
    },
  ])
  assert.equal(dialog.releaseDialogVisible, true)
  assert.equal(dialog.connectorJobs.mysql.releaseVersion, '2.1')
  assert.equal(dialog.connectorJobs.mysql.stopTasks, false)
  assert.equal(dialog.connectorJobs.mysql.status, 'completed')
  assert.equal(dialog.connectorJobs.mysql.progress, 100)
})

test('stop-and-update delegates stopping to the backend and does not bypass the impact check', async () => {
  const calls = []
  const dialog = createDialog(
    {
      releaseDialogVisible: true,
      releaseItem: {
        pdkId: 'mysql',
        artifactId: 'mysql-connector',
        name: 'MySQL',
      },
      releaseImpact: { tasks: [{ id: 'task' }], inspects: [{ id: 'inspect' }] },
      getData: () => Promise.resolve(),
    },
    {
      registerConnectorRelease: (data) => {
        calls.push(data)
        return Promise.resolve({
          jobId: 'stop-job',
          status: 'queued',
          progress: 0,
        })
      },
      getConnectorRegistrationJob: () =>
        Promise.resolve({ status: 'completed', progress: 100 }),
    },
  )
  await dialog.registerRelease(true)
  await Promise.resolve()
  assert.deepEqual(calls, [
    {
      pdkId: 'mysql',
      artifactId: 'mysql-connector',
      stopTasks: true,
      ignoreInFlightResources: false,
    },
  ])
  assert.equal(dialog.connectorJobs.mysql.stopTasks, true)
  assert.equal(dialog.connectorJobs.mysql.status, 'completed')
})

test('an optional release catalog outage keeps installed connectors usable without notifications', async () => {
  const messages = []
  const dialog = createDialog(
    {
      $message: {
        error: (message) => messages.push(message),
        info: (message) => messages.push(message),
        success: (message) => messages.push(message),
      },
    },
    {
      fetchDatabases: () =>
        Promise.resolve([
          {
            pdkId: 'mysql',
            name: 'MySQL',
            type: 'Mysql',
            pdkHash: 'installed-hash',
            connectionType: 'source_and_target',
          },
        ]),
      getConnectorReleases: () =>
        Promise.reject(new Error('release service unavailable')),
    },
  )
  await dialog.getData()
  await Promise.resolve()
  const installed = dialog.database.find((item) => item.pdkId === 'mysql')
  assert.equal(installed.pdkHash, 'installed-hash')
  assert.equal(installed.locked, false)
  assert.equal(installed.updateAvailable, false)
  assert.equal(dialog.loading, false)
  assert.deepEqual(messages, [])
  assert.deepEqual(
    dialog.database.map((item) => item.pdkId),
    ['mysql'],
  )
})

test('only published installable connectors are added to the installed catalog', () => {
  const dialog = createDialog({ selectorType: 'source_and_target' })
  const installed = [
    { pdkId: 'mysql', type: 'Mysql', pdkHash: 'mysql-hash' },
    { pdkId: 'private-connector', type: 'Custom', pdkHash: 'custom-hash' },
  ]
  assert.deepEqual(
    dialog.buildEnterpriseConnectorList(installed).map((item) => item.pdkId),
    ['mysql', 'private-connector'],
  )
  const available = dialog.buildEnterpriseConnectorList(installed, [
    { artifactId: 'hazelcast-connector', version: '2.1.0' },
  ])
  assert.ok(available.some((item) => item.pdkId === 'mysql'))
  assert.ok(available.some((item) => item.pdkId === 'private-connector'))
  const hazelcast = available.find((item) => item.pdkId === 'hazelcast')
  assert.equal(hazelcast.requiresDownload, true)
  assert.equal(hazelcast.releaseAvailable, true)
  assert.equal(
    available.some((item) => item.pdkId === 'oracle'),
    false,
  )
  dialog.connectorJobs.hazelcast = {
    jobId: 'existing-operation',
    status: 'downloading',
  }
  assert.ok(
    dialog
      .buildEnterpriseConnectorList(installed)
      .some((item) => item.pdkId === 'hazelcast'),
  )
})
