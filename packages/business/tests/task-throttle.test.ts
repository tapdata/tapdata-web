import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildThrottleLimitSeries,
  bytesPerSecToMbPerSec,
  classifyTaskThrottleFilter,
  createDefaultThrottleDraft,
  draftToUpdateRequest,
  formatMbPerSec,
  getApplicableThrottlePhases,
  hasEnabledApplicablePhase,
  isDraftEqual,
  mbPerSecToBytesPerSec,
  normalizeThrottleTaskKind,
  policyViewToDraft,
  resolveThrottleBadgeState,
  validateCdcSampleInterval,
  validateThrottleDraft,
} from '../src/components/task-throttle/utils.ts'

test('unit conversions keep MB decimal precision and integer byte parity', () => {
  assert.equal(mbPerSecToBytesPerSec('1'), 1_000_000)
  assert.equal(mbPerSecToBytesPerSec('0.5'), 500_000)
  assert.equal(mbPerSecToBytesPerSec('12.345'), 12_345_000)
  assert.equal(mbPerSecToBytesPerSec('0'), null)
  assert.equal(mbPerSecToBytesPerSec('-1.2'), null)
  assert.equal(mbPerSecToBytesPerSec('abc'), null)

  assert.equal(bytesPerSecToMbPerSec(500_000), 0.5)
  assert.equal(bytesPerSecToMbPerSec(12_345_000), 12.345)
  assert.equal(bytesPerSecToMbPerSec(0), null)

  assert.equal(formatMbPerSec(1_500_000), '1.5')
  assert.equal(formatMbPerSec(10_000_000), '10')
  assert.equal(formatMbPerSec(null), '')
})

test('task kind normalization and applicable phases cover P0 matrix and exclude unsupported kinds', () => {
  assert.equal(normalizeThrottleTaskKind('migrate'), 'migrate')
  assert.equal(normalizeThrottleTaskKind('sync'), 'sync')
  assert.equal(normalizeThrottleTaskKind('logCollector'), 'logCollector')
  assert.equal(normalizeThrottleTaskKind('log_collector'), 'logCollector')
  assert.equal(normalizeThrottleTaskKind('shareCache'), null)
  assert.equal(normalizeThrottleTaskKind('inspect'), null)

  assert.deepEqual(getApplicableThrottlePhases('migrate', 'initial_sync+cdc'), [
    'FULL',
    'CDC',
  ])
  assert.deepEqual(getApplicableThrottlePhases('sync', 'initial_sync'), [
    'FULL',
  ])
  assert.deepEqual(getApplicableThrottlePhases('sync', 'cdc'), ['CDC'])
  assert.deepEqual(
    getApplicableThrottlePhases('logCollector', 'initial_sync+cdc'),
    ['CDC'],
  )
  assert.deepEqual(getApplicableThrottlePhases('shareCache', 'cdc'), [])
})

test('validation rejects empty phase, empty/zero/negative limits, decimals > 3 places, decimal QPS, and out-of-range inputs', () => {
  const draft = createDefaultThrottleDraft()
  assert.equal(validateThrottleDraft(draft, ['FULL', 'CDC']).length, 0)
  assert.equal(hasEnabledApplicablePhase(draft, ['FULL', 'CDC']), false)

  // Enabled phase with neither BYTES nor QPS selected
  draft.FULL.enabled = true
  assert.deepEqual(validateThrottleDraft(draft, ['FULL', 'CDC']), [
    { phase: 'FULL', field: 'phase', code: 'AT_LEAST_ONE_DIMENSION' },
  ])

  // Empty, zero, negative, excess precision, out of range for bytesPerSec
  draft.FULL.bytesEnabled = true
  draft.FULL.mbPerSecInput = ''
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'BYTES_REQUIRED')

  draft.FULL.mbPerSecInput = '0'
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'BYTES_RANGE')

  draft.FULL.mbPerSecInput = '-2'
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'BYTES_RANGE')

  draft.FULL.mbPerSecInput = '10000.1'
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'BYTES_RANGE')

  draft.FULL.mbPerSecInput = '1.2345'
  assert.equal(
    validateThrottleDraft(draft, ['FULL'])[0].code,
    'BYTES_PRECISION',
  )

  draft.FULL.mbPerSecInput = '2.5'
  assert.equal(validateThrottleDraft(draft, ['FULL']).length, 0)

  // QPS: integer required, positive within [1, 10_000_000]
  draft.FULL.qpsEnabled = true
  draft.FULL.eventsPerSecInput = '100.5'
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'QPS_INTEGER')

  draft.FULL.eventsPerSecInput = '0'
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'QPS_RANGE')

  draft.FULL.eventsPerSecInput = '-10'
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'QPS_RANGE')

  draft.FULL.eventsPerSecInput = '10000001'
  assert.equal(validateThrottleDraft(draft, ['FULL'])[0].code, 'QPS_RANGE')

  draft.FULL.eventsPerSecInput = '500'
  assert.deepEqual(validateThrottleDraft(draft, ['FULL']), [])
})

test('disabled and non-applicable phases preserve previously filled values without blocking save', () => {
  const draft = createDefaultThrottleDraft()
  draft.FULL = {
    enabled: false,
    bytesEnabled: true,
    mbPerSecInput: '5.5',
    qpsEnabled: true,
    eventsPerSecInput: '2000',
  }
  draft.CDC = {
    enabled: true,
    bytesEnabled: true,
    mbPerSecInput: '1.25',
    qpsEnabled: false,
    eventsPerSecInput: '800',
  }

  // Only CDC is applicable -> FULL errors/values must not block CDC save, and preserved values remain
  assert.deepEqual(validateThrottleDraft(draft, ['CDC']), [])
  const payload = draftToUpdateRequest(draft, ['CDC'], 3)
  assert.equal(payload.expectedVersion, 3)
  assert.deepEqual(payload.phases.FULL, {
    enabled: false,
    bytesPerSec: 5_500_000,
    eventsPerSec: 2000,
  })
  assert.deepEqual(payload.phases.CDC, {
    enabled: true,
    bytesPerSec: 1_250_000,
    eventsPerSec: null,
  })
})

test('policyViewToDraft and isDraftEqual compare effective draft state', () => {
  const restored = policyViewToDraft({
    taskKey: 't:sync:1',
    tenantId: 't',
    taskKind: 'sync',
    taskId: '1',
    desiredVersion: 2,
    desiredPhases: {
      FULL: { enabled: true, bytesPerSec: 2_500_000, eventsPerSec: 1000 },
      CDC: { enabled: false, bytesPerSec: 500_000, eventsPerSec: null },
    },
    appliedVersion: 0,
    applyStatus: 'NONE',
    currentRunEpoch: 0,
    protectedRunActive: false,
    stopGateStatus: 'NONE',
  })
  assert.equal(restored.FULL.enabled, true)
  assert.equal(restored.FULL.mbPerSecInput, '2.5')
  assert.equal(restored.FULL.eventsPerSecInput, '1000')
  assert.equal(restored.CDC.enabled, false)
  assert.equal(restored.CDC.mbPerSecInput, '0.5')

  const copy = policyViewToDraft({
    taskKey: 't:sync:1',
    tenantId: 't',
    taskKind: 'sync',
    taskId: '1',
    desiredVersion: 2,
    desiredPhases: {
      FULL: { enabled: true, bytesPerSec: 2_500_000, eventsPerSec: 1000 },
      CDC: { enabled: false, bytesPerSec: 500_000, eventsPerSec: null },
    },
    appliedVersion: 0,
    applyStatus: 'NONE',
    currentRunEpoch: 0,
    protectedRunActive: false,
    stopGateStatus: 'NONE',
  })
  assert.equal(isDraftEqual(restored, copy, ['FULL', 'CDC']), true)
  copy.CDC.enabled = true
  assert.equal(isDraftEqual(restored, copy, ['FULL', 'CDC']), false)
})

test('badge state resolves single/dual dimension, parallel phases, 15s unknown, and non-rate wait exclusion', () => {
  // Active dual dimension on FULL and single QPS on CDC
  const active = resolveThrottleBadgeState('running', {
    taskId: '1',
    throttlingActive: true,
    statusUnknown: false,
    runEpoch: 1,
    activeWaits: [],
    activeDimensionsByPhase: {
      CDC: ['QPS'],
      FULL: ['QPS', 'BYTES'],
    },
  })
  assert.deepEqual(active, {
    state: 'active',
    phaseLines: [
      { phase: 'FULL', dimensions: ['BYTES', 'QPS'] },
      { phase: 'CDC', dimensions: ['QPS'] },
    ],
  })

  // Stopped task immediately clears throttling and unknown badges
  assert.deepEqual(
    resolveThrottleBadgeState('stop', {
      taskId: '1',
      throttlingActive: true,
      statusUnknown: true,
      runEpoch: 1,
      activeWaits: [],
      activeDimensionsByPhase: { FULL: ['BYTES'] },
    }),
    { state: 'none', phaseLines: [] },
  )

  // >15s without report marks unknown
  assert.deepEqual(
    resolveThrottleBadgeState('running', {
      taskId: '1',
      throttlingActive: false,
      statusUnknown: true,
      runEpoch: 1,
      activeWaits: [],
      activeDimensionsByPhase: {},
    }),
    { state: 'unknown', phaseLines: [] },
  )

  // Buffer/sample/IO waits (throttlingActive = false) do NOT mark throttling
  assert.deepEqual(
    resolveThrottleBadgeState('running', {
      taskId: '1',
      throttlingActive: false,
      statusUnknown: false,
      runEpoch: 1,
      activeWaits: [],
      activeDimensionsByPhase: {},
    }),
    { state: 'none', phaseLines: [] },
  )
})

test('list filter classifies 5 states including stopped tasks evaluated against applicable phases', () => {
  assert.equal(
    classifyTaskThrottleFilter(
      { status: 'running', syncType: 'sync', type: 'initial_sync+cdc' },
      {
        taskId: '1',
        throttlingActive: true,
        statusUnknown: false,
        policyConfigured: true,
        configuredPhases: ['FULL'],
        runEpoch: 1,
        activeWaits: [],
        activeDimensionsByPhase: { FULL: ['BYTES'] },
      },
    ),
    'throttling',
  )

  // Stopped task with FULL enabled stays configured_idle when FULL is applicable
  assert.equal(
    classifyTaskThrottleFilter(
      { status: 'stop', syncType: 'migrate', type: 'initial_sync+cdc' },
      {
        taskId: '2',
        throttlingActive: false,
        statusUnknown: false,
        policyConfigured: true,
        configuredPhases: ['FULL'],
        runEpoch: 0,
        activeWaits: [],
        activeDimensionsByPhase: {},
      },
    ),
    'configured_idle',
  )

  // Task switched to cdc-only while only FULL is configured counts as disabled for active run mode
  assert.equal(
    classifyTaskThrottleFilter(
      { status: 'stop', syncType: 'migrate', type: 'cdc' },
      {
        taskId: '3',
        throttlingActive: false,
        statusUnknown: false,
        policyConfigured: true,
        configuredPhases: ['FULL'],
        runEpoch: 0,
        activeWaits: [],
        activeDimensionsByPhase: {},
      },
    ),
    'disabled',
  )
})

test('buildThrottleLimitSeries draws piecewise applied bounds only after confirm and resets on disable', () => {
  const times = [1000, 2000, 3000, 4000, 5000]

  // Unconfirmed first enablement -> all null (dotted line does not appear before confirmation)
  assert.deepEqual(
    buildThrottleLimitSeries(
      times,
      [],
      {
        taskKey: 't:sync:1',
        tenantId: 't',
        taskKind: 'sync',
        taskId: '1',
        desiredVersion: 1,
        appliedVersion: 0,
        applyStatus: 'PENDING',
        currentRunEpoch: 1,
        protectedRunActive: true,
        stopGateStatus: 'NONE',
      },
      'size',
      'FULL',
    ),
    [null, null, null, null, null],
  )

  // Policy changes + monotonic apply receipts: v1 @ 2000 (2MB/s), v2 @ 4000 (5MB/s), v3 @ 5000 disabled
  const changes = [
    {
      id: 'c1',
      dedupKey: 'CHANGE:1',
      taskId: '1',
      eventType: 'POLICY_CHANGE',
      runEpoch: 0,
      policyVersion: 1,
      afterPhases: {
        FULL: { enabled: true, bytesPerSec: 2_000_000, eventsPerSec: 100 },
      },
      occurredAt: 1500,
    },
    {
      id: 'r1',
      dedupKey: 'RECEIPT:1',
      taskId: '1',
      eventType: 'APPLY_RECEIPT',
      runEpoch: 1,
      policyVersion: 1,
      outcome: 'APPLIED',
      occurredAt: 2000,
    },
    {
      id: 'c2',
      dedupKey: 'CHANGE:2',
      taskId: '1',
      eventType: 'POLICY_CHANGE',
      runEpoch: 1,
      policyVersion: 2,
      afterPhases: {
        FULL: { enabled: true, bytesPerSec: 5_000_000, eventsPerSec: 250 },
      },
      occurredAt: 3500,
    },
    {
      id: 'r2',
      dedupKey: 'RECEIPT:2',
      taskId: '1',
      eventType: 'APPLY_RECEIPT',
      runEpoch: 1,
      policyVersion: 2,
      outcome: 'APPLIED',
      occurredAt: 4000,
    },
    {
      id: 'c3',
      dedupKey: 'CHANGE:3',
      taskId: '1',
      eventType: 'POLICY_CHANGE',
      runEpoch: 1,
      policyVersion: 3,
      afterPhases: {
        FULL: { enabled: false, bytesPerSec: 5_000_000, eventsPerSec: 250 },
      },
      occurredAt: 4500,
    },
    {
      id: 'r3',
      dedupKey: 'RECEIPT:3',
      taskId: '1',
      eventType: 'APPLY_RECEIPT',
      runEpoch: 1,
      policyVersion: 3,
      outcome: 'APPLIED',
      occurredAt: 5000,
    },
  ]

  assert.deepEqual(
    buildThrottleLimitSeries(times, changes, null, 'size', 'FULL'),
    [null, 2_000_000, 2_000_000, 5_000_000, null],
  )
  assert.deepEqual(
    buildThrottleLimitSeries(times, changes, null, 'count', 'FULL'),
    [null, 100, 100, 250, null],
  )
})

test('validateCdcSampleInterval enforces 5-300 integer boundaries', () => {
  assert.deepEqual(validateCdcSampleInterval(5), { valid: true, value: 5 })
  assert.deepEqual(validateCdcSampleInterval('30'), { valid: true, value: 30 })
  assert.deepEqual(validateCdcSampleInterval(300), {
    valid: true,
    value: 300,
  })

  assert.deepEqual(validateCdcSampleInterval(''), {
    valid: false,
    errorCode: 'REQUIRED',
  })
  assert.deepEqual(validateCdcSampleInterval('12.5'), {
    valid: false,
    errorCode: 'INTEGER',
  })
  assert.deepEqual(validateCdcSampleInterval(4), {
    valid: false,
    errorCode: 'RANGE',
  })
  assert.deepEqual(validateCdcSampleInterval(301), {
    valid: false,
    errorCode: 'RANGE',
  })
})

test('validateThrottleDraft rejects decimal QPS with .0 and scientific notation', () => {
  const draft = createDefaultThrottleDraft()
  draft.CDC.enabled = true
  draft.CDC.qpsEnabled = true
  draft.CDC.eventsPerSecInput = '100.0'
  assert.equal(validateThrottleDraft(draft, ['CDC'])[0].code, 'QPS_INTEGER')

  draft.CDC.eventsPerSecInput = '1e3'
  assert.equal(validateThrottleDraft(draft, ['CDC'])[0].code, 'QPS_INTEGER')
})

test('hasEnabledApplicablePhase ignores disabled or non-applicable phases', () => {
  const draft = createDefaultThrottleDraft()
  draft.FULL.enabled = true
  draft.FULL.bytesEnabled = true
  draft.FULL.mbPerSecInput = '2'
  assert.equal(hasEnabledApplicablePhase(draft, ['FULL', 'CDC']), true)
  assert.equal(hasEnabledApplicablePhase(draft, ['CDC']), false)
  assert.equal(hasEnabledApplicablePhase(draft, []), false)
})

test('classifyTaskThrottleFilter distinguishes unknown running state and disabled running tasks', () => {
  assert.equal(
    classifyTaskThrottleFilter(
      { status: 'running', syncType: 'logCollector', type: 'cdc' },
      {
        taskId: '4',
        throttlingActive: false,
        statusUnknown: true,
        policyConfigured: true,
        configuredPhases: ['CDC'],
        runEpoch: 2,
        activeWaits: [],
        activeDimensionsByPhase: {},
      },
    ),
    'unknown',
  )

  assert.equal(
    classifyTaskThrottleFilter(
      { status: 'running', syncType: 'logCollector', type: 'cdc' },
      {
        taskId: '5',
        throttlingActive: false,
        statusUnknown: false,
        policyConfigured: false,
        configuredPhases: [],
        runEpoch: 2,
        activeWaits: [],
        activeDimensionsByPhase: {},
      },
    ),
    'disabled',
  )
})

test('buildThrottleLimitSeries switches bounds between FULL and CDC when phase resolver transitions', () => {
  const times = [1000, 2000, 3000, 4000]
  const changes = [
    {
      id: 'c1',
      dedupKey: 'CHANGE:10',
      taskId: '10',
      eventType: 'POLICY_CHANGE',
      runEpoch: 1,
      policyVersion: 1,
      afterPhases: {
        FULL: { enabled: true, bytesPerSec: 10_000_000, eventsPerSec: 500 },
        CDC: { enabled: true, bytesPerSec: 2_000_000, eventsPerSec: 100 },
      },
      occurredAt: 900,
    },
    {
      id: 'r1',
      dedupKey: 'RECEIPT:10',
      taskId: '10',
      eventType: 'APPLY_RECEIPT',
      runEpoch: 1,
      policyVersion: 1,
      outcome: 'APPLIED',
      occurredAt: 1000,
    },
  ]
  const resolver = (ts: number) => (ts < 3000 ? 'FULL' : 'CDC')
  assert.deepEqual(
    buildThrottleLimitSeries(times, changes, null, 'size', resolver),
    [10_000_000, 10_000_000, 2_000_000, 2_000_000],
  )
  assert.deepEqual(
    buildThrottleLimitSeries(times, changes, null, 'count', resolver),
    [500, 500, 100, 100],
  )
})

test('draftToUpdateRequest drops invalid dormant inputs while keeping valid dormant values', () => {
  const draft = createDefaultThrottleDraft()
  draft.FULL.enabled = false
  draft.FULL.bytesEnabled = true
  draft.FULL.mbPerSecInput = '-99'
  draft.CDC.enabled = true
  draft.CDC.qpsEnabled = true
  draft.CDC.eventsPerSecInput = '250'

  const req = draftToUpdateRequest(draft, ['FULL', 'CDC'], 7)
  assert.equal(req.phases.FULL?.enabled, false)
  assert.equal(req.phases.FULL?.bytesPerSec, null)
  assert.equal(req.phases.CDC?.enabled, true)
  assert.equal(req.phases.CDC?.eventsPerSec, 250)
})

test('draftToUpdateRequest preserves exact non-round byte limits like 1501 B/s when only QPS changes', () => {
  const view = {
    taskKey: 't:sync:task-1501',
    tenantId: 't',
    taskKind: 'sync' as const,
    taskId: 'task-1501',
    desiredVersion: 3,
    desiredPhases: {
      CDC: { enabled: true, bytesPerSec: 1501, eventsPerSec: 100 },
    },
    appliedVersion: 3,
    applyStatus: 'APPLIED' as const,
    currentRunEpoch: 1,
    protectedRunActive: true,
    stopGateStatus: 'NONE' as const,
  }
  const draft = policyViewToDraft(view)
  assert.equal(draft.CDC.mbPerSecInput, '0.002')
  // User edits only QPS while leaving the byte limit field untouched
  draft.CDC.eventsPerSecInput = '200'
  const unchangedByteReq = draftToUpdateRequest(draft, ['CDC'], 3)
  assert.equal(unchangedByteReq.phases.CDC?.bytesPerSec, 1501)
  assert.equal(unchangedByteReq.phases.CDC?.eventsPerSec, 200)

  // Once user explicitly edits the byte limit field, recalculate from MB/s input
  draft.CDC.mbPerSecInput = '0.003'
  const changedByteReq = draftToUpdateRequest(draft, ['CDC'], 3)
  assert.equal(changedByteReq.phases.CDC?.bytesPerSec, 3000)
})
