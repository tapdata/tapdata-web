export const NODE_PREFIX = 'node-'
export const NODE_WIDTH = 180
export const NODE_HEIGHT = 40

export const DEFAULT_SETTINGS = {
  isSerialMode: false,
  sync_type: 'initial_sync+cdc',
  readBatchSize: 100,
  notificationWindow: 0,
  notificationInterval: 300,
  readCdcInterval: 500,
  maxTransactionLength: 12,
  description: '',
  cdcFetchSize: 1,
  distinctWriteType: 'intellect',
  drop_target: false,
  run_custom_sql: false,
  needToCreateIndex: true,
  increment: false,
  isSchedule: false,
  cronExpression: '',
  isOpenAutoDDL: false,
  cdcConcurrency: false,
  cdcShareFilterOnServer: false,
  emailWaring: {
    edited: false,
    started: false,
    error: false,
    paused: false
  },
  readShareLogMode: 'STREAMING',
  stopOnError: true,
  syncPoints: [
    {
      connectionId: '',
      type: 'current', // localTZ: 本地时区； connTZ：连接时区
      time: '',
      date: '',
      name: '',
      timezone: '+08:00' // 当type为localTZ时有该字段
    }
  ],
  processorConcurrency: 1,
  transformerConcurrency: 8,
  lagTimeFalg: false,
  userSetLagTime: 0,
  noPrimaryKey: false
}

export const DB_ICON = {
  mysql: 'mysql',
  'mysql pxc': 'mysqlpxc',
  dameng: 'dameng',
  oracle: 'oracle',
  mq: 'mq',
  hbase: 'hbase',
  kudu: 'kudu',
  mongodb: 'mongo',
  db2: 'db2',
  postgres: 'pg',
  sqlserver: 'sqlserver',
  'gbase-8s': 'gbase',
  'sybase ase': 'sybase',
  kafka: 'kafka',
  mariadb: 'maria',
  redis: 'redis',
  elasticsearch: 'elasticsearch',
  greenplum: 'greenplum',
  hana: 'hana',
  hive: 'hive'
}

export const NODE_TYPE_ICON = {
  table: 'table-line',
  js_processor: 'js',
  field_processor: 'field-processor',
  aggregation_processor: 'aggregator',
  row_filter_processor: 'row-filter',
  cache_lookup_processor: 'joint-cache'
}

export const STATUS_MAP = {
  draft: {
    start: false,
    stop: true,
    forceStop: true,
    reset: false,
    setting: false,
    preview: false,
    logs: false,
    reloadSchema: false,
    finder: false,
    edit: false
  },
  running: {
    start: true,
    stop: false,
    forceStop: true,
    reset: true,
    setting: true,
    preview: false,
    logs: false,
    reloadSchema: true,
    finder: true,
    edit: true
  },
  stopping: {
    start: true,
    stop: true,
    forceStop: false,
    reset: true,
    setting: true,
    preview: true,
    logs: true,
    reloadSchema: true,
    finder: true,
    edit: true
  },
  scheduled: {
    start: true,
    stop: true,
    forceStop: true,
    reset: true,
    setting: true,
    preview: true,
    logs: true,
    reloadSchema: true,
    finder: true,
    edit: true
  },
  error: {
    start: false,
    stop: true,
    forceStop: true,
    reset: false,
    setting: false,
    preview: false,
    logs: false,
    reloadSchema: false,
    finder: false,
    edit: false
  },
  paused: {
    start: false,
    stop: true,
    forceStop: true,
    reset: false,
    setting: false,
    preview: false,
    logs: false,
    reloadSchema: false,
    finder: true,
    edit: false
  },
  'force stopping': {
    start: true,
    stop: true,
    forceStop: true,
    reset: true,
    setting: true,
    preview: true,
    logs: true,
    reloadSchema: true,
    finder: true,
    edit: true
  }
}
