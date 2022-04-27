export const NODE_PREFIX = 'node-'
export const NODE_WIDTH = 180
export const NODE_HEIGHT = 50

export const DEFAULT_SETTINGS = {
  name: '', // 任务名称
  type: 'initial_sync+cdc', // 任务类型：全量+增量
  desc: '', // 任务描述
  isAutoCreateIndex: true, // 自动创建索引
  isOpenAutoDDL: false, // 自动DDL
  writeThreadSize: 8, // 目标写入线程数
  deduplicWriteMode: 'intelligent', // 去重写入机制: 智能去重写入
  increOperationMode: false, // 增量数据处理模式：批量,
  increaseReadSize: 1, // 增量批次读取行数
  increShareReadMode: 'STREAMING', // 共享增量读取模式
  increaseSyncInterval: 500, // 增量同步间隔(ms)
  readBatchSize: 100, // 每次读取行数
  processorThreadNum: 1, // 处理器线程数
  shareCdcEnable: false, //开启共享挖掘
  isSchedule: false,
  cronExpression: ' ',
  accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION'

  // readBatchSize: 100,
  // notificationWindow: 0,
  // notificationInterval: 300,
  // readCdcInterval: 500,
  // maxTransactionLength: 12,
  // description: '',
  // cdcFetchSize: 1,
  // distinctWriteType: 'intellect',
  // drop_target: false,
  // run_custom_sql: false,
  // needToCreateIndex: true,
  // increment: false,
  // isSchedule: false,
  // cronExpression: '',
  // isOpenAutoDDL: false,
  // cdcConcurrency: false,
  // cdcShareFilterOnServer: false,
  // emailWaring: {
  //   edited: false,
  //   started: false,
  //   error: false,
  //   paused: false
  // },
  // readShareLogMode: 'STREAMING',
  // stopOnError: true,
  // syncPoints: [
  //   {
  //     connectionId: '',
  //     type: 'current', // localTZ: 本地时区； connTZ：连接时区
  //     time: '',
  //     date: '',
  //     name: '',
  //     timezone: '+08:00' // 当type为localTZ时有该字段
  //   }
  // ],
  // processorConcurrency: 1,
  // transformerConcurrency: 8,
  // lagTimeFalg: false,
  // userSetLagTime: 0,
  // noPrimaryKey: false
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
  hive: 'hive',
  clickhouse: 'clickhouse',
  gaussdb200: 'GaussDB200',
  kundb: 'KunDB',
  adb_mysql: 'ADB MySQL',
  adb_postgres: 'ADB PostgreSQL',
  hazelcast_cloud_cluster: 'Hazelcast cloud'
}

export const NODE_TYPE_ICON = {
  table: 'table',
  js_processor: 'javascript',
  field_processor: 'field-processor',
  aggregation_processor: 'aggregator',
  row_filter_processor: 'row-filter',
  cache_lookup_processor: 'joint-cache',
  join_processor: 'join',
  merge_table_processor: 'merge_table',
  custom_processor: 'custom',
  field_rename_processor: 'field_rename',
  field_add_del_processor: 'field_add_del',
  field_calc_processor: 'field_calc',
  field_mod_type_processor: 'field_mod_type'
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

// 不支持全量
export const NONSUPPORT_SYNC = ['elasticsearch', 'redis', 'hive', 'tcp_udp', 'clickhouse', 'hazelcast_cloud_cluster']
// 不支持增量
export const NONSUPPORT_CDC = [
  'db2',
  'gbase-8s',
  'sybase ase',
  'gaussdb200',
  'elasticsearch',
  'redis',
  'dameng',
  'hive',
  'tcp_udp',
  'hbase',
  'kudu',
  'greenplum',
  'hana',
  'adb_mysql',
  'adb_postgres',
  'kundb',
  'clickhouse',
  'hazelcast_cloud_cluster'
]
