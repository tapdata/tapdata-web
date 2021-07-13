export const NODE_PREFIX = 'node-'

export const DEFAULT_SETTINGS = {
  isSerialMode: false,
  sync_type: 'initial_sync+cdc',
  readBatchSize: 1000,
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
  cdcConcurrency: true,
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
  transformerConcurrency: 8
}
