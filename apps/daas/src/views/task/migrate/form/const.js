export const SETTING_MODEL = {
  name: '',
  sync_type: 'initial_sync+cdc',
  distinctWriteType: 'intellect',
  automaticallyCreateTables: true,
  stopOnError: false,
  isOpenAutoDDL: false,
  bidirectional: false,
  readBatchSize: 1000,
  cdcConcurrency: false,
  transformerConcurrency: 8,
  fieldNameTransform: '',
  tableNameTransform: '',
  noPrimaryKey: true,
  needToCreateIndex: true,
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
  table_prefix: '', //前缀,
  table_suffix: '', //后缀
  selectSourceArr: [], //可用区,
  topicData: [],
  queueData: [],
  showBtn: true,
  isFirst: false,
  nodeId: '',
  field_process: [],
  fieldsNameTransform: '',
  batchOperationList: []
}
