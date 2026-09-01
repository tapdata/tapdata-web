import type {
  DlqEvent,
  DlqEventDetail,
  DlqEventQueryParams,
  DlqEventStatus,
  DlqEventSummary,
  DlqRecoveryBatch,
  DlqRecoveryPreview,
} from '@tap/api/src/core/dlq-event'
import i18n from '@tap/i18n'

const now = Date.now()
const date = (minutesAgo: number) =>
  new Date(now - minutesAgo * 60_000).toISOString()

const rows: DlqEventDetail[] = [
  {
    id: 'evt-01',
    eventId: 'dlq_01J8K6CB1A2M04Q9X001',
    taskId: 'task-orders',
    taskName: i18n.t('packages_business_exception_events_mock_task_orders'),
    syncType: 'migrate',
    sourceTable: 'mysql.orders',
    targetTable: 'mongo.orders',
    dmlType: 'U',
    errorType: 'TARGET_WRITE_ERROR',
    errorCode: 'MongoWriteConflict',
    eventTime: date(32),
    failedAt: date(30),
    status: 'PENDING',
    recoveryCount: 0,
    sourceNodeName: i18n.t(
      'packages_business_exception_events_mock_source_mysql_orders',
    ),
    targetNodeName: i18n.t(
      'packages_business_exception_events_mock_target_mongo_orders',
    ),
    failedNodeName: i18n.t(
      'packages_business_exception_events_mock_failed_node_write_orders',
    ),
    stage: 'TARGET',
    captureSeq: 821903,
    eventKey: '{"order_id":1009821}',
    payloadFormat: 'JSON',
    payloadSize: 872,
    payloadComplete: true,
    payloadPreview: {
      order_id: 1009821,
      status: 'PAID',
      amount: 398,
      updated_at: '2026-08-26T08:46:12Z',
    },
    errorDetails:
      'WriteConflict: another write operation is in progress for this document.',
    recoveryAttempts: [],
  },
  {
    id: 'evt-02',
    eventId: 'dlq_01J8K69KKG0ACN5N4Q0B',
    taskId: 'task-orders',
    taskName: i18n.t('packages_business_exception_events_mock_task_orders'),
    syncType: 'migrate',
    sourceTable: 'mysql.orders',
    targetTable: 'mongo.orders',
    dmlType: 'I',
    errorType: 'TRANSFORM_ERROR',
    errorCode: 'SchemaCastError',
    eventTime: date(55),
    failedAt: date(54),
    status: 'RECOVERY_FAILED',
    recoveryCount: 2,
    lastRecoveryTime: date(18),
    sourceNodeName: i18n.t(
      'packages_business_exception_events_mock_source_mysql_orders',
    ),
    targetNodeName: i18n.t(
      'packages_business_exception_events_mock_target_mongo_orders',
    ),
    failedNodeName: i18n.t(
      'packages_business_exception_events_mock_failed_node_field_mapping',
    ),
    stage: 'TRANSFORM',
    captureSeq: 821876,
    eventKey: '{"order_id":1009819}',
    payloadFormat: 'JSON',
    payloadSize: 1254,
    payloadComplete: true,
    payloadPreview: {
      order_id: 1009819,
      status: 'CREATED',
      customer_level: 'VIP',
      amount: 'N/A',
    },
    errorDetails: 'Cannot cast field amount from string to decimal(12,2).',
    recoveryAttempts: [
      {
        attemptId: 'att-01',
        batchId: 'batch-01J8',
        startedAt: date(20),
        finishedAt: date(18),
        result: 'FAILED',
        message: i18n.t(
          'packages_business_exception_events_mock_attempt_field_type_mismatch',
        ),
      },
    ],
  },
  {
    id: 'evt-03',
    eventId: 'dlq_01J8K61XR5N2C6NB8KCV',
    taskId: 'task-inventory',
    taskName: i18n.t('packages_business_exception_events_mock_task_inventory'),
    syncType: 'sync',
    sourceTable: 'postgres.inventory',
    targetTable: 'es.inventory',
    dmlType: 'D',
    errorType: 'POISON_RECORD',
    errorCode: 'PrimaryKeyMissing',
    eventTime: date(70),
    failedAt: date(68),
    status: 'NOT_REPROCESSABLE',
    notReprocessableReason: i18n.t(
      'packages_business_exception_events_payload_incomplete',
    ),
    recoveryCount: 0,
    sourceNodeName: i18n.t(
      'packages_business_exception_events_mock_source_postgresql_inventory',
    ),
    targetNodeName: 'Elasticsearch inventory',
    failedNodeName: i18n.t(
      'packages_business_exception_events_mock_failed_node_primary_key',
    ),
    stage: 'SOURCE',
    eventKeyMissing: true,
    payloadFormat: 'JSON',
    payloadSize: 98,
    payloadComplete: false,
    payloadPreviewTruncated: true,
    payloadPreview: { sku: null, warehouse: 'SH-01', stock: 33 },
    errorDetails: 'Event key is missing. The record cannot be replayed safely.',
    recoveryAttempts: [],
  },
  {
    id: 'evt-04',
    eventId: 'dlq_01J8K5PCKPAF0V87ZQ8H',
    taskId: 'task-members',
    taskName: i18n.t('packages_business_exception_events_mock_task_members'),
    syncType: 'sync',
    sourceTable: 'mysql.members',
    targetTable: 'mongo.members',
    dmlType: 'U',
    errorType: 'TARGET_WRITE_ERROR',
    errorCode: 'DuplicateKey',
    eventTime: date(100),
    failedAt: date(99),
    status: 'REPROCESSING',
    recoveryCount: 1,
    lastRecoveryTime: date(4),
    sourceNodeName: i18n.t(
      'packages_business_exception_events_mock_source_mysql_members',
    ),
    targetNodeName: i18n.t(
      'packages_business_exception_events_mock_target_mongo_members',
    ),
    failedNodeName: i18n.t(
      'packages_business_exception_events_mock_failed_node_write_members',
    ),
    stage: 'TARGET',
    captureSeq: 88211,
    eventKey: '{"mobile":"***0921"}',
    payloadFormat: 'JSON',
    payloadSize: 671,
    payloadComplete: true,
    payloadPreview: { member_id: 662199, mobile: '***0921', level: 'gold' },
    errorDetails: 'E11000 duplicate key error collection: members.',
    recoveryAttempts: [
      {
        attemptId: 'att-active-01',
        batchId: 'batch-active-01',
        startedAt: date(4),
        result: 'RUNNING',
        message: i18n.t(
          'packages_business_exception_events_mock_attempt_recovery_running',
        ),
      },
    ],
  },
  {
    id: 'evt-05',
    eventId: 'dlq_01J8K4WEQYAX58VPYME6',
    taskId: 'task-orders',
    taskName: i18n.t('packages_business_exception_events_mock_task_orders'),
    syncType: 'migrate',
    sourceTable: 'mysql.order_items',
    targetTable: 'mongo.order_items',
    dmlType: 'I',
    errorType: 'MALFORMED_RECORD',
    errorCode: 'MalformedJson',
    eventTime: date(160),
    failedAt: date(159),
    status: 'RECOVERED',
    recoveryCount: 1,
    lastRecoveryTime: date(88),
    sourceNodeName: i18n.t(
      'packages_business_exception_events_mock_source_mysql_orders',
    ),
    targetNodeName: i18n.t(
      'packages_business_exception_events_mock_target_mongo_orders',
    ),
    failedNodeName: i18n.t(
      'packages_business_exception_events_mock_failed_node_deserialize',
    ),
    stage: 'TRANSFORM',
    captureSeq: 821102,
    eventKey: '{"item_id":900112}',
    payloadFormat: 'JSON',
    payloadSize: 512,
    payloadComplete: true,
    payloadPreview: {
      item_id: 900112,
      order_id: 1009760,
      sku: 'A-201',
      quantity: 2,
    },
    errorDetails: 'Malformed JSON was corrected by the source connector.',
    recoveryAttempts: [
      {
        attemptId: 'att-02',
        batchId: 'batch-01J7',
        startedAt: date(90),
        finishedAt: date(88),
        result: 'SUCCESS',
      },
    ],
  },
  {
    id: 'evt-06',
    eventId: 'dlq_01J8K3Q4VY0M6J2R7P8S',
    taskId: 'task-inventory',
    taskName: i18n.t('packages_business_exception_events_mock_task_inventory'),
    syncType: 'sync',
    sourceTable: 'postgres.inventory',
    targetTable: 'es.inventory',
    dmlType: 'U',
    errorType: 'TARGET_WRITE_ERROR',
    errorCode: 'VersionConflict',
    eventTime: date(84),
    failedAt: date(82),
    status: 'PENDING',
    recoveryCount: 0,
    sourceNodeName: i18n.t(
      'packages_business_exception_events_mock_source_postgresql_inventory',
    ),
    targetNodeName: 'Elasticsearch inventory',
    failedNodeName: i18n.t(
      'packages_business_exception_events_mock_failed_node_write_inventory',
    ),
    stage: 'TARGET',
    captureSeq: 44821,
    eventKey: '{"sku":"SKU-2048"}',
    payloadFormat: 'JSON',
    payloadSize: 634,
    payloadComplete: true,
    payloadPreview: {
      sku: 'SKU-2048',
      warehouse: 'SH-01',
      stock: 33,
      updated_at: '2026-08-26T08:21:12Z',
    },
    errorDetails: 'Version conflict while updating the inventory document.',
    recoveryAttempts: [],
  },
]

let batch: DlqRecoveryBatch | undefined

const toListEvent = (item: DlqEventDetail): DlqEvent => {
  const { payloadPreview, recoveryAttempts, errorDetails, ...event } = item
  return event
}

export function fetchMockDlqEvents(params: DlqEventQueryParams) {
  advanceMockBatch()
  let list = rows.slice()
  const keyword = params.keyword?.toLowerCase().trim()
  const taskName = params.taskName?.toLowerCase().trim()
  const errorCode = params.errorCode?.toLowerCase().trim()
  if (params.status) list = list.filter((item) => item.status === params.status)
  if (params.taskId) list = list.filter((item) => item.taskId === params.taskId)
  if (keyword)
    list = list.filter((item) =>
      item.errorDetails?.toLowerCase().includes(keyword),
    )
  if (taskName)
    list = list.filter((item) => item.taskName.toLowerCase().includes(taskName))
  if (params.sourceTable)
    list = list.filter((item) => item.sourceTable.includes(params.sourceTable!))
  if (params.targetTable)
    list = list.filter((item) => item.targetTable.includes(params.targetTable!))
  if (params.dmlType)
    list = list.filter((item) => item.dmlType === params.dmlType)
  if (params.errorType)
    list = list.filter((item) => item.errorType === params.errorType)
  if (errorCode)
    list = list.filter((item) =>
      item.errorCode.toLowerCase().includes(errorCode),
    )
  const skip = params.skip || 0
  const limit = params.limit || 20
  return Promise.resolve({
    items: list.slice(skip, skip + limit).map(toListEvent),
    total: list.length,
  })
}

export function fetchMockDlqSummary(
  params: DlqEventQueryParams = {},
): Promise<DlqEventSummary> {
  const matches = (status: DlqEventStatus) =>
    fetchMockDlqEvents({ ...params, status, limit: rows.length }).then(
      (result) => result.total,
    )
  return Promise.all([
    fetchMockDlqEvents({ ...params, limit: rows.length }),
    matches('PENDING'),
    matches('REPROCESSING'),
    matches('RECOVERED'),
    matches('RECOVERY_FAILED'),
    matches('NOT_REPROCESSABLE'),
  ]).then(
    ([all, pending, reprocessing, recovered, recoveryFailed, notReprocessable]) => ({
      total: all.total,
      pending,
      reprocessing,
      recovered,
      recoveryFailed,
      notReprocessable,
    }),
  )
}

export function fetchMockDlqEventDetail(eventId: string) {
  advanceMockBatch()
  const event = rows.find((item) => item.eventId === eventId)
  if (!event) return Promise.resolve(undefined)

  const recoveryAttempts = [...(event.recoveryAttempts || [])]
  if (batch?.eventIds.includes(eventId)) {
    const index = batch.eventIds.indexOf(eventId)
    const isRunning = ['CREATED', 'DISPATCHED', 'RUNNING'].includes(batch.status)
    const failed = batch.status === 'PARTIAL_FAILED' && index === 0
    recoveryAttempts.unshift({
      attemptId: `${batch.batchId}-${eventId}`,
      batchId: batch.batchId,
      startedAt: batch.startedAt || new Date().toISOString(),
      finishedAt: isRunning ? undefined : batch.finishedAt,
      result: isRunning ? 'RUNNING' : failed ? 'FAILED' : 'SUCCESS',
      message: isRunning
        ? i18n.t('packages_business_exception_events_mock_attempt_replay_running')
        : undefined,
      errorMessage: failed
        ? i18n.t(
            'packages_business_exception_events_mock_attempt_replay_failed',
          )
        : undefined,
    })
  }

  return Promise.resolve({ ...event, recoveryAttempts })
}

export function previewMockDlqRecovery(
  eventIds: string[],
): Promise<DlqRecoveryPreview> {
  const selected = rows.filter((item) => eventIds.includes(item.eventId))
  const canRecover = (item: DlqEventDetail) =>
    ['PENDING', 'RECOVERY_FAILED'].includes(item.status) &&
    item.payloadComplete !== false
  const orderedEvents = selected
    .filter(canRecover)
    .sort(
      (a, b) =>
        a.eventTime.localeCompare(b.eventTime) ||
        (a.captureSeq || 0) - (b.captureSeq || 0),
    )
  const blockedEvents = selected
    .filter((item) => !canRecover(item))
    .map((item) => ({
      eventId: item.eventId,
      sourceTable: item.sourceTable,
      targetTable: item.targetTable,
      dmlType: item.dmlType,
      eventTime: item.eventTime,
      captureSeq: item.captureSeq,
      message:
        item.payloadComplete === false
          ? i18n.t(
              'packages_business_exception_events_mock_blocked_payload_incomplete',
            )
          : i18n.t(
              'packages_business_exception_events_mock_blocked_status_unsupported',
            ),
    }))
  return Promise.resolve({
    taskId: selected[0]?.taskId,
    taskName: selected[0]?.taskName,
    canSubmit: !!orderedEvents.length && !blockedEvents.length,
    orderedEvents: orderedEvents.map(toListEvent),
    blockedEvents,
    message: blockedEvents.length
      ? i18n.t('packages_business_exception_events_mock_blocked_events')
      : undefined,
  })
}

export function startMockDlqRecovery(eventIds: string[]) {
  const selected = rows.filter((item) => eventIds.includes(item.eventId))
  selected.forEach((item) => {
    item.status = 'REPROCESSING'
    item.recoveryCount += 1
    item.lastRecoveryTime = new Date().toISOString()
  })
  batch = {
    batchId: `batch_${Date.now().toString(36)}`,
    taskId: selected[0]!.taskId,
    taskName: selected[0]!.taskName,
    status: 'RUNNING',
    selectedCount: selected.length,
    successCount: 0,
    failedCount: 0,
    skippedCount: 0,
    eventIds,
    orderedEventIds: eventIds,
    startedAt: new Date().toISOString(),
    message: i18n.t('packages_business_exception_events_mock_batch_running'),
  }
  return Promise.resolve(batch)
}

function advanceMockBatch() {
  if (!batch) return
  const elapsed = Date.now() - new Date(batch.startedAt || Date.now()).getTime()
  if (elapsed > 6_000 && batch.status === 'RUNNING') {
    batch.status = 'PARTIAL_FAILED'
    batch.successCount = Math.max(batch.selectedCount - 1, 0)
    batch.failedCount = batch.selectedCount ? 1 : 0
    batch.finishedAt = new Date().toISOString()
    rows
      .filter((item) => batch!.eventIds.includes(item.eventId))
      .forEach((item, index) => {
        item.status = index === 0 ? 'RECOVERY_FAILED' : 'RECOVERED'
      })
  }
}
