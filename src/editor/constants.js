/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/19/20
 * @description
 */
export const FORM_DATA_KEY = 'form_data',
  SCHEMA_DATA_KEY = 'schema',
  OUTPUT_SCHEMA_DATA_KEY = 'outputSchema',
  DATA_FLOW_SETTING_DATA_KEY = 'settingData',
  JOIN_TABLE_TPL = {
    tableName: '',
    joinType: 'upsert',
    joinPath: '',
    manyOneUpsert: false,
    joinKeys: [
      {
        source: '',
        target: ''
      }
    ],
    // primaryKeys: '',
    stageId: '',
    isArray: false,
    // fieldProcesses: [],
    arrayUniqueKey: ''
  },
  DEFAULT_SETTING = {
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
    emailWaring: {
      edited: false,
      started: false,
      error: false,
      paused: false
    },
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
  },
  DATABASE_TYPE_MAPPING = {
    mysql: {
      name: 'MySQL',
      type: 'mysql',
      shapeImage: 'editor/o-mysql.svg',
      stencilImage: 'editor/mysql.svg'
    },
    'mysql pxc': {
      type: 'mysql pxc',
      name: 'Mysql PXC',
      shapeImage: 'editor/o-mysqlpxc.svg',
      stencilImage: 'editor/mysqlpxc.svg'
    },
    oracle: {
      type: 'oracle',
      name: 'Oracle',
      shapeImage: 'editor/o-ora.svg',
      stencilImage: 'editor/ora2.svg'
    },
    mongodb: {
      type: 'mongodb',
      name: 'MongoDB',
      shapeImage: 'editor/o-mongo.svg',
      stencilImage: 'editor/mongo.svg'
    },
    db2: {
      type: 'db2',
      name: 'DB2',
      shapeImage: 'editor/o-db2.svg',
      stencilImage: 'editor/DB2.svg'
    },
    postgres: {
      type: 'postgres',
      name: 'Postgres',
      shapeImage: 'editor/o-pg.svg',
      stencilImage: 'editor/pg.svg'
    },
    sqlserver: {
      type: 'sqlserver',
      name: 'SQL Server',
      shapeImage: 'editor/o-sqlserver.svg',
      stencilImage: 'editor/sqlserver.svg'
    },
    'gbase-8s': {
      type: 'gbase-8s',
      name: 'GBase 8s',
      shapeImage: 'editor/o-gbase.svg',
      stencilImage: 'editor/gbase.svg'
    },
    'sybase ase': {
      type: 'sybase ase',
      name: 'Sybase ASE',
      shapeImage: 'editor/o-sybase.svg',
      stencilImage: 'editor/sybase.svg'
    },
    kafka: {
      type: 'kafka',
      name: 'Kafka',
      shapeImage: 'editor/o-kafka-q.svg',
      stencilImage: 'editor/wKafka.svg'
    },
    mariadb: {
      type: 'mariadb',
      name: 'MariaDB',
      shapeImage: 'editor/o-maria.svg',
      stencilImage: 'editor/maria.svg'
    }
  },
  FILE_TYPE_MAPPING = {
    xml: {
      type: 'xml',
      name: 'XML',
      shapeImage: 'editor/o-xml.svg',
      stencilImage: 'editor/xml.svg'
    },
    excel: {
      type: 'excel',
      name: 'EXCEL',
      shapeImage: 'editor/o-excel.svg',
      stencilImage: 'editor/excel.svg'
    },
    csv: {
      type: 'csv',
      name: 'CSV',
      shapeImage: 'editor/o-csv.svg',
      stencilImage: 'editor/csv.svg'
    },
    json: {
      type: 'json',
      name: 'JSON',
      shapeImage: 'editor/o-json.svg',
      stencilImage: 'editor/json.svg'
    }
  }
