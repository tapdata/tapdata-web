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
    transformModelVersion: 'v1',
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
    noPrimaryKey: false,
    oracleLogminer: 'automatically',
    useCustomSQLParser: false
  },
  DATABASE_TYPE_MAPPING = {
    mysql: {
      name: 'MySQL',
      type: 'mysql',
      shapeImage: 'static/editor/mysql.svg',
      stencilImage: 'static/editor/mysql.svg'
    },
    'mysql pxc': {
      type: 'mysql pxc',
      name: 'Mysql PXC',
      shapeImage: 'static/editor/mysqlpxc.svg',
      stencilImage: 'static/editor/mysqlpxc.svg'
    },
    dameng: {
      name: 'DM DB',
      type: 'dameng',
      shapeImage: 'static/editor/dameng.svg',
      stencilImage: 'static/editor/dameng.svg'
    },
    oracle: {
      type: 'oracle',
      name: 'Oracle',
      shapeImage: 'static/editor/oracle.svg',
      stencilImage: 'static/editor/oracle.svg'
    },
    mq: {
      type: 'mq',
      name: 'MQ',
      shapeImage: 'static/editor/mq.svg',
      stencilImage: 'static/editor/mq.svg'
    },
    hbase: {
      type: 'hbase',
      name: 'HBase',
      shapeImage: 'static/editor/hbase.svg',
      stencilImage: 'static/editor/hbase.svg'
    },
    kudu: {
      type: 'kudu',
      name: 'kudu',
      shapeImage: 'static/editor/kudu.svg',
      stencilImage: 'static/editor/kudu.svg'
    },
    mongodb: {
      type: 'mongodb',
      name: 'MongoDB',
      shapeImage: 'static/editor/mongodb.svg',
      stencilImage: 'static/editor/mongodb.svg'
    },
    db2: {
      type: 'db2',
      name: 'DB2',
      shapeImage: 'static/editor/DB2.svg',
      stencilImage: 'static/editor/DB2.svg'
    },
    postgres: {
      type: 'postgres',
      name: 'Postgres',
      shapeImage: 'static/editor/pg.svg',
      stencilImage: 'static/editor/pg.svg'
    },
    sqlserver: {
      type: 'sqlserver',
      name: 'SQL Server',
      shapeImage: 'static/editor/sqlserver.svg',
      stencilImage: 'static/editor/sqlserver.svg'
    },
    'gbase-8s': {
      type: 'gbase-8s',
      name: 'GBase 8s',
      shapeImage: 'static/editor/gbase.svg',
      stencilImage: 'static/editor/gbase.svg'
    },
    'sybase ase': {
      type: 'sybase ase',
      name: 'Sybase ASE',
      shapeImage: 'static/editor/sybase.svg',
      stencilImage: 'static/editor/sybase.svg'
    },
    kafka: {
      type: 'kafka',
      name: 'Kafka',
      shapeImage: 'static/editor/Kafka.svg',
      stencilImage: 'static/editor/Kafka.svg'
    },
    mariadb: {
      type: 'mariadb',
      name: 'MariaDB',
      shapeImage: 'static/editor/mariadb.svg',
      stencilImage: 'static/editor/mariadb.svg'
    },
    redis: {
      type: 'redis',
      name: 'Redis',
      shapeImage: 'static/editor/redis.svg',
      stencilImage: 'static/editor/redis.svg'
    },
    elasticsearch: {
      type: 'elasticsearch',
      name: 'Elasticsearch',
      shapeImage: 'static/editor/elasticsearch.svg',
      stencilImage: 'static/editor/elasticsearch.svg'
    },
    greenplum: {
      type: 'greenplum',
      name: 'Greenplum',
      shapeImage: 'static/editor/greenplum.svg',
      stencilImage: 'static/editor/greenplum.svg'
    },
    tidb: {
      type: 'tidb',
      name: 'TiDB',
      shapeImage: 'static/editor/tidb.svg',
      stencilImage: 'static/editor/tidb.svg'
    },
    hana: {
      type: 'hana',
      name: 'SPA Hana',
      shapeImage: 'static/editor/hana.svg',
      stencilImage: 'static/editor/hana.svg'
    },
    hive: {
      type: 'hive',
      name: 'Hive',
      shapeImage: 'static/editor/hive.svg',
      stencilImage: 'static/editor/hive.svg'
    },
    clickhouse: {
      type: 'clickhouse',
      name: 'ClickHouse',
      shapeImage: 'static/editor/click.svg',
      stencilImage: 'static/editor/click.svg'
    },
    gaussdb200: {
      type: 'gaussdb200',
      name: 'GaussDB200',
      shapeImage: 'static/editor/gaussdb200.svg',
      stencilImage: 'static/editor/gaussdb200.svg'
    },
    kundb: {
      type: 'kundb',
      name: 'KunDB',
      shapeImage: 'static/editor/kundb.svg',
      stencilImage: 'static/editor/kundb.svg'
    },
    adb_mysql: {
      type: 'adb_mysql',
      name: 'ADB MySql',
      shapeImage: 'static/editor/adb_mysql.svg',
      stencilImage: 'static/editor/adb_mysql.svg'
    },
    adb_postgres: {
      type: 'adb_postgres',
      name: 'ADB PostgreSQL',
      shapeImage: 'static/editor/adb_postgres.svg',
      stencilImage: 'static/editor/adb_postgres.svg'
    }
  },
  FILE_TYPE_MAPPING = {
    xml: {
      type: 'xml',
      name: 'XML',
      shapeImage: 'static/editor/xml.svg',
      stencilImage: 'static/editor/xml.svg'
    },
    excel: {
      type: 'excel',
      name: 'EXCEL',
      shapeImage: 'static/editor/excel.svg',
      stencilImage: 'static/editor/excel.svg'
    },
    csv: {
      type: 'csv',
      name: 'CSV',
      shapeImage: 'static/editor/csv.svg',
      stencilImage: 'static/editor/csv.svg'
    },
    json: {
      type: 'json',
      name: 'JSON',
      shapeImage: 'static/editor/json.svg',
      stencilImage: 'static/editor/json.svg'
    }
  },
  ALLOW_FIELD_MAPPING = [
    'hive',
    'mssql',
    'mysql',
    'mysql_pxc',
    'mariadb',
    'oracle',
    'dameng',
    'postgres',
    'kafka',
    'mongodb',
    'clickhouse'
  ]
