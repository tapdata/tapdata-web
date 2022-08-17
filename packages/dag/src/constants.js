export const NODE_PREFIX = 'node-'
export const NODE_WIDTH = 180
export const NODE_HEIGHT = 40

export const DEFAULT_SETTINGS = {
  name: '', // 任务名称
  desc: '', // 任务描述
  type: 'initial_sync+cdc', // 任务类型：全量+增量
  isAutoCreateIndex: true, // 自动创建索引
  isOpenAutoDDL: false, // 自动DDL
  increOperationMode: false, // 增量数据处理模式：批量,
  increaseReadSize: 1, // 增量批次读取行数
  processorThreadNum: 1, // 处理器线程数
  shareCdcEnable: false, //开启共享挖掘
  isSchedule: false,
  cronExpression: ' ',
  accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
  isAutoInspect: false

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

// 不支持全量
export const NONSUPPORT_SYNC = ['elasticsearch', 'redis', 'hive', 'tcp_udp', 'clickhouse', 'hazelcast_cloud_cluster']
// 不支持增量
export const NONSUPPORT_CDC = [
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
