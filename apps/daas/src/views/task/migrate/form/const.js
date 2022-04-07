export const SETTING_MODEL = {
  name: '',
  desc: '',
  // sync_type: '', //'全量+增量'
  automaticallyCreateTables: true, //自动建表
  isStopOnError: true, //遇到错误停止
  isSchedule: false, //定时调度任务
  isAutoCreateIndex: true, //自动创建索引
  crontabExpression: '', //crontab表达式
  isFilter: false, //启动引擎过滤 默认false
  writeThreadSize: 8, //目标写入线程数
  deduplicWriteMode: 'intellect', //去重写入机制  智能去重写入
  readShareLogMode: false, //共享挖掘
  isOpenAutoDDL: false, //自动处理ddl
  increOperationMode: true, //增量数据处理模式，支持批量false  跟逐行true
  // increShareReadMode: '', //共享增量读取模式, 支持流式读取STREAMING和轮询读取POLLING两种模式
  increSyncConcurrency: false, //增量同步并发写入 默认关闭
  existDataProcessMode: 'keepData', //已有数据处理模式 保持已存在的数据 keepData，运行前删除已存在的数据removeData，删除表结构 dropTable
  writeStrategy: 'updateOrInsert', //数据写入策略配置，数据写入模式： 更新已存在或者插入新数据（updateOrInsert）， 追加写入(appendWrite)， 更新写入(updateWrite)15
  increHysteresis: false, //增量滞后判断时间设置  默认关闭
  increaseReadSize: 500, //增量读取条数 1
  increaseSyncInterval: 500, //增量同步间隔
  readBatchSize: 500, //全量一批读取条数
  hysteresisInterval: 500, //增量之后判断时间间隔 ms
  noPrimaryKey: true,
  syncPoints: [
    {
      connectionId: '',
      type: 'current', // localTZ: 本地时区； connTZ：连接时区
      time: '',
      date: '',
      name: '',
      timezone: '+08:00' // 当type为localTZ时有该字段
    }
  ]
}

export const DATASOURCE_MODEL = {
  id: '',
  name: '',
  source_sourceType: '',
  target_targetType: '',
  source_filter_databaseType: 'all',
  target_filter_databaseType: 'all',
  source_connectionId: '',
  target_connectionId: '',
  source_connectionName: '',
  target_connectionName: ''
}
export const DFSDATASOURCE_MODEL = {
  source_databaseType: 'mysql',
  target_databaseType: 'mysql',
  source_connectionId: '',
  target_connectionId: '',
  source_connectionName: '',
  target_connectionName: '',
  mqType: '0'
}
export const TRANSFER_MODEL = {
  tableNameTransform: '', //表名大小写
  tablePrefix: '', //前缀,
  tableSuffix: '', //后缀
  selectSourceArr: [], //可用区,
  topicData: [],
  queueData: [],
  showBtn: false,
  isFirst: false,
  nodeId: '',
  mode: 'all',
  syncType: 'migrate',
  automaticallyCreateTables: true,
  fieldProcess: [],
  fieldsNameTransform: '',
  batchOperationList: []
}
