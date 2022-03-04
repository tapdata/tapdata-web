export const SETTING_MODEL = {
  name: '',
  sync_type: 'initial_sync+cdc',
  distinctWriteType: 'intellect',
  stopOnError: true,
  isOpenAutoDDL: false,
  bidirectional: false,
  readBatchSize: 1000,
  cdcConcurrency: false,
  transformerConcurrency: 8,
  fieldNameTransform: '',
  tableNameTransform: '',
  noPrimaryKey: true,
  needToCreateIndex: false,
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
  isSchedule: false,
  cronExpression: '',
  scheduleTime: ''
}

export const DATASOURCE_MODEL = {
  source_sourceType: 'rds',
  target_sourceType: 'dds',
  source_connectionId: '',
  target_connectionId: '',
  source_connectionName: '',
  target_connectionName: ''
}
export const DFSDATASOURCE_MODEL = {
  source_databaseType: '',
  target_databaseType: '',
  source_filter_databaseType: 'all',
  target_filter_databaseType: 'all',
  source_connectionId: '',
  target_connectionId: '',
  source_connectionName: '',
  target_connectionName: '',
  mqType: '0'
}

export const INSTANCE_MODEL = {
  region: '', //区域
  zone: '', //可用区,
  regionName: '', //区域
  zoneName: '' //可用区,
}
