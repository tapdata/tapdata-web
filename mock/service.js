const Mock = require('mockjs')
const settings = require('./settings.json')
const permission = require('./permission.json')
const Random = Mock.Random

module.exports = {
  '/api/Connections': {
    code: 'ok',
    msg: 'ok',
    'data|1-30': [
      {
        name: '@name',
        connection_type: 'target',
        'database_type|1': ['mysql', 'oracle', 'mongodb'],
        database_host: '',
        database_username: '',
        database_port: Random.integer(0, 5000),
        database_uri: 'mongodb://192.168.1.191:27017/tapdata_test',
        database_name: '',
        id: '@id',
        sslCert: '',
        additionalString: '',
        'ssl|1': Boolean,
        sslKey: '',
        sslPass: '',
        'schemaAutoUpdate|1': Boolean,
        sslCA: '',
        search_databaseType: '',
        status: 'ready',
        fill: 'uri',
        user_id: '@id',
        last_updated: Random.datetime(),
        loadCount: Random.integer(0, 100),
        'loadFieldsStatus|1': ['loading', 'finished'],
        tableCount: Random.integer(0, 100),
        username: '@name'
      }
    ]
  },
  '/api/Settings': settings,
  '/api/timeStamp': { data: '1620388869929', code: 'ok', msg: 'ok' },
  '/api/users/login': { data: '1620388869929', code: 'ok', msg: 'ok' },
  '/api/users/:id/permissions': permission,
  '/api/DatabaseTypes': {
    data: [
      {
        id: '6093eebec51425290fec3d22',
        type: 'mysql',
        name: 'MySql',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.849Z',
        createTime: '2021-05-06T13:27:26.849Z'
      },
      {
        id: '6093eebec51425290fec3d23',
        type: 'oracle',
        name: 'Oracle',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.864Z',
        createTime: '2021-05-06T13:27:26.864Z'
      },
      {
        id: '6093eebec51425290fec3d24',
        type: 'mongodb',
        name: 'MongoDB',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.871Z',
        createTime: '2021-05-06T13:27:26.871Z'
      },
      {
        id: '6093eebec51425290fec3d25',
        type: 'sqlserver',
        name: 'SQL Server',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.877Z',
        createTime: '2021-05-06T13:27:26.877Z'
      },
      {
        id: '6093eebec51425290fec3d26',
        type: 'sybase ase',
        name: 'Sybase ASE',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.883Z',
        createTime: '2021-05-06T13:27:26.883Z'
      },
      {
        id: '6093eebec51425290fec3d27',
        type: 'gridfs',
        name: 'GridFS',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.890Z',
        createTime: '2021-05-06T13:27:26.890Z'
      },
      {
        id: '6093eebec51425290fec3d28',
        type: 'file',
        name: 'File(s)',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow', 'gridfs', 'file'],
        last_updated: '2021-05-06T13:27:26.896Z',
        createTime: '2021-05-06T13:27:26.896Z'
      },
      {
        id: '6093eebec51425290fec3d29',
        type: 'rest api',
        name: 'REST API',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.902Z',
        createTime: '2021-05-06T13:27:26.902Z'
      },
      {
        id: '6093eebec51425290fec3d2a',
        type: 'udp',
        name: 'Udp',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.910Z',
        createTime: '2021-05-06T13:27:26.910Z'
      },
      {
        id: '6093eebec51425290fec3d2b',
        type: 'dummy db',
        name: 'Dummy DB',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.922Z',
        createTime: '2021-05-06T13:27:26.922Z'
      },
      {
        id: '6093eebec51425290fec3d2c',
        type: 'gbase-8s',
        name: 'GBase 8s',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.928Z',
        createTime: '2021-05-06T13:27:26.928Z'
      },
      {
        id: '6093eebec51425290fec3d2d',
        type: 'custom_connection',
        name: 'Custom Connection',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.935Z',
        createTime: '2021-05-06T13:27:26.935Z'
      },
      {
        id: '6093eebec51425290fec3d2e',
        type: 'db2',
        name: 'IBM Db2',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.941Z',
        createTime: '2021-05-06T13:27:26.941Z'
      },
      {
        id: '6093eebec51425290fec3d2f',
        type: 'gaussdb200',
        name: 'GaussDB200',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.948Z',
        createTime: '2021-05-06T13:27:26.948Z'
      },
      {
        id: '6093eebec51425290fec3d30',
        type: 'postgres',
        name: 'PostgreSQL',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.954Z',
        createTime: '2021-05-06T13:27:26.954Z'
      },
      {
        id: '6093eebec51425290fec3d31',
        type: 'elasticsearch',
        name: 'Elasticsearch',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.960Z',
        createTime: '2021-05-06T13:27:26.960Z'
      },
      {
        id: '6093eebec51425290fec3d32',
        type: 'mem_cache',
        name: 'Memory Cache',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.966Z',
        createTime: '2021-05-06T13:27:26.966Z'
      },
      {
        id: '6093eebec51425290fec3d33',
        type: 'log_collect',
        name: 'Log Collect',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.972Z',
        createTime: '2021-05-06T13:27:26.972Z'
      },
      {
        id: '6093eebec51425290fec3d34',
        type: 'redis',
        name: 'Redis',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.978Z',
        createTime: '2021-05-06T13:27:26.978Z'
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/Connections/count': { data: { count: 232 }, code: 'ok', msg: 'ok' },
  '/api/Workers/availableAgent': {
    data: {
      result: [
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172519,
          worker_type: 'connector',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        },
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172520,
          worker_type: 'transformer',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/Connections/:id/customQuery': { code: 'ok', msg: 'ok' },
  '/api/tcm/agent': {
    code: 'ok',
    data: {
      total: 10,
      'items|10': [{}]
    }
  },
  '/api/tcm/agent/regionZone': { code: 'ok', msg: 'ok' },
  '/api/tcm/product/vip': { code: 'ok', msg: 'ok' },
  '/api/Connections/:id/copy': {
    code: 'ok',
    msg: 'ok',
    data: {
      result: {}
    }
  },
  '/api/Connections/:id': {
    code: 'ok',
    msg: 'ok'
  },
  '/api/Workers/:id/availableAgent': {
    data: {
      result: [
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172519,
          worker_type: 'connector',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        },
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172520,
          worker_type: 'transformer',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/users/self': {
    data: {
      account_status: 1,
      accesscode: '5033fb0b9245df807b56e068a66ec639',
      username: '小瓶套',
      email: '60718c178fbae2c47bc294b3@custom.com',
      emailVerified: true,
      id: '6072c1cbbf43e90010570f3c',
      userId: '60718c178fbae2c47bc294b3',
      customId: '60718c178fbae2c47bc294b3',
      isPrimary: '0',
      role: 0,
      user_id: '604f4b7ce1ca905fa754520c',
      isCompleteGuide: true,
      last_updated: '2021-04-13T13:46:24.922Z',
      createTime: '2021-04-11T09:30:51.937Z',
      'roleMappings|1-10': [
        {
          id: '@id',
          principalType: 'USER',
          principalId: '6072c1cbbf43e90010570f3c',
          roleId: '5cda998c39a8c094a56811cf',
          role: {
            description: '@name',
            name: '@name',
            register_user_default: true,
            user_id: '604f4b7ce1ca905fa754520c',
            id: '5cda998c39a8c094a56811cf',
            modified: '2021-05-08T03:25:49.846Z',
            created: '2021-05-08T03:25:49.846Z'
          }
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/chart': {
    data: {
      chart1: {
        totalDataFlows: Random.integer(0, 100),
        'statusCount|4': [
          {
            '_id|+1': ['draft', 'error', 'paused', 'running'],
            count: Random.integer(0, 100)
          }
        ]
      },
      chart2: [
        {
          _id: '',
          totalInput: Random.integer(0, 100),
          totalOutput: Random.integer(0, 100),
          totalInputDataSize: Random.integer(0, 100),
          totalOutputDataSize: Random.integer(0, 100),
          totalInsert: Random.integer(0, 100),
          totalInsertSize: Random.integer(0, 100),
          totalUpdate: Random.integer(0, 100),
          totalUpdateSize: Random.integer(0, 100),
          totalDelete: Random.integer(0, 100),
          totalDeleteSize: Random.integer(0, 100)
        }
      ],
      chart3: [],
      chart4: {
        initializing: Random.integer(0, 100),
        initialized: Random.integer(0, 100),
        cdc: Random.integer(0, 100),
        Lag: Random.integer(0, 100)
      },
      chart5: {
        totalDataFlows: Random.integer(0, 100),
        'statusCount|4': [
          {
            '_id|+1': ['draft', 'error', 'paused', 'running'],
            count: Random.integer(0, 100)
          }
        ]
      },
      chart6: {
        initializing: Random.integer(0, 100),
        initialized: Random.integer(0, 100),
        cdc: Random.integer(0, 100),
        Lag: Random.integer(0, 100)
      },
      chart7: {
        total: Random.integer(0, 100),
        passed: Random.integer(0, 100),
        countDiff: Random.integer(0, 100),
        valueDiff: Random.integer(0, 100),
        error: Random.integer(0, 100)
      }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/count': { data: { count: 41 }, code: 'ok', msg: 'ok' },
  '/api/DataFlows/:id/reset': {
    code: 'ok',
    msg: 'ok',
    data: {}
  },
  '/api/DataFlows': {
    'data|0-30': [
      {
        createTime: '2021-04-28T11:10:57.691Z',
        last_updated: '2021-04-28T13:03:49.326Z',
        id: '@id',
        name: '@name',
        'status|1': [
          'running',
          'paused',
          'error',
          'draft',
          'scheduled',
          'stopping',
          'force stopping'
        ],
        executeMode: 'normal',
        category: '数据库克隆',
        'stopOnError|1': Boolean,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '860486ba-a620-44e8-82a4-dc98b62778ec',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['76dfca82-f8d1-4909-b6e4-d341fb310bb2'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: 'cdc'
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
            inputLanes: ['860486ba-a620-44e8-82a4-dc98b62778ec'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'ff013_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'sudu 8',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 25000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '@id',
        agentId: '',
        startTime: '2021-04-28T11:11:05.961Z',
        stats: {
          input: { rows: 4990000, dataSize: 239520000 },
          output: { rows: 4990000, dataSize: 239520000 },
          insert: { rows: 4990000, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 662899,
          transTimeAvg: 0,
          replicationLag: 7872,
          'stagesMetrics|1-10': [
            {
              stageId: '860486ba-a620-44e8-82a4-dc98b62778ec',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 4990000, dataSize: 239520000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: Random.integer(0, 100000),
              transTimeAvg: Random.integer(0, 100000),
              replicationLag: Random.integer(0, 10000),
              status: 'cdc'
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '@id',
          agentName: '@name'
        }
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/update': {
    data: {
      success: [{ id: '@id', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/:id': {
    data: {
      createTime: '2021-04-28T11:10:57.691Z',
      last_updated: '2021-05-10T07:55:32.824Z',
      id: '@id',
      name: '@name',
      description: '',
      status: 'paused',
      executeMode: 'normal',
      category: '数据库克隆',
      stopOnError: false,
      mappingTemplate: 'cluster-clone',
      stages: [
        {
          connectionId: '60803202ddc0f40343b87e35',
          dataQualityTag: false,
          distance: Random.integer(0, 1),
          freeTransform: false,
          id: '860486ba-a620-44e8-82a4-dc98b62778ec',
          inputLanes: [],
          joinTables: [],
          name: 'local_179',
          outputLanes: ['76dfca82-f8d1-4909-b6e4-d341fb310bb2'],
          type: 'database',
          database_type: 'mysql',
          dropType: 'no_drop',
          readBatchSize: 1000,
          readCdcInterval: 500,
          statsStatus: 'cdc'
        },
        {
          connectionId: '6087c2ee0786e30010d4c882',
          dataQualityTag: false,
          distance: 0,
          freeTransform: false,
          id: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
          inputLanes: ['860486ba-a620-44e8-82a4-dc98b62778ec'],
          joinTables: [],
          name: 'DRS-ALI-DEST',
          outputLanes: [],
          type: 'database',
          syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
          table_prefix: 'ff013_',
          table_suffix: '',
          readBatchSize: 1000,
          readCdcInterval: 500,
          dropType: 'no_drop',
          database_type: 'mysql',
          statsStatus: null
        }
      ],
      setting: {
        name: 'sudu 8',
        sync_type: 'initial_sync+cdc',
        distinctWriteType: 'intellect',
        stopOnError: false,
        isOpenAutoDDL: false,
        twoWay: false,
        syncPoints: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            type: 'current',
            time: '',
            date: '',
            name: '',
            timezone: '+8'
          }
        ],
        readBatchSize: 25000,
        notificationWindow: 0,
        notificationInterval: 300,
        readCdcInterval: 500,
        description: '',
        drop_target: false,
        needToCreateIndex: false,
        increment: false,
        isSchedule: false,
        emailWaring: {
          edited: false,
          started: false,
          error: true,
          paused: true
        }
      },
      dataFlowType: 'normal',
      dataSourceModel: {
        source_databaseType: 'mysql',
        target_databaseType: 'mysql',
        source_connectionId: '60803202ddc0f40343b87e35',
        target_connectionId: '6087c2ee0786e30010d4c882',
        source_connectionName: 'local_179',
        target_connectionName: 'DRS-ALI-DEST'
      },
      platformInfo: { region: '', zone: '' },
      agentTags: ['', ''],
      pausedTime: '2021-05-10T07:56:19.429Z',
      finishTime: '2021-05-10T07:56:19.429Z',
      emailWaring: { edited: true, started: false, error: true, paused: false },
      user_id: '6072c1cbbf43e90010570f3c',
      customId: '60718c178fbae2c47bc294b3',
      agentId: '6086a74b71e5a600109bc483-knyj7h6l',
      errorTime: '',
      forceStoppingTime: '',
      operationTime: '2021-05-10T07:56:04.279Z',
      runningTime: '2021-05-10T07:55:32.967Z',
      scheduledTime: '2021-05-10T07:55:28.486Z',
      startTime: '2021-05-10T07:55:28.486Z',
      stoppingTime: '2021-05-10T07:56:04.279Z',
      msg: '',
      scheduleTime: 1620633332823,
      scheduleTimes: 1,
      pingTime: 1620633379338,
      milestones: [
        {
          code: 'INIT_DATAFLOW',
          status: 'finish',
          errorMessage: '',
          start: 1620633333182,
          end: 1620633333221
        },
        {
          code: 'INIT_CONNECTOR',
          status: 'finish',
          errorMessage: '',
          start: 1620633334786,
          end: 1620633334998
        },
        {
          code: 'INIT_TRANSFORMER',
          status: 'running',
          errorMessage: '',
          start: 1620633336474,
          end: 0
        },
        {
          code: 'CONNECT_TO_SOURCE',
          status: 'finish',
          errorMessage: '',
          start: 1620633335270,
          end: 1620633336835
        },
        {
          code: 'CONNECT_TO_TARGET',
          status: 'waiting',
          errorMessage: '',
          start: 0,
          end: 0
        },
        {
          code: 'READ_SOURCE_DDL',
          status: 'finish',
          errorMessage: '',
          start: 1619608272305,
          end: 1619608272507
        },
        {
          code: 'CREATE_TARGET_TABLE',
          status: 'finish',
          errorMessage: '',
          start: 1619608277704,
          end: 1619608462662
        },
        {
          code: 'READ_SNAPSHOT',
          status: 'finish',
          errorMessage: '',
          start: 1619608272891,
          end: 1619608461742
        },
        {
          code: 'WRITE_SNAPSHOT',
          status: 'finish',
          errorMessage: '',
          start: 1619608277671,
          end: 1619608466755
        },
        {
          code: 'READ_CDC_EVENT',
          status: 'finish',
          errorMessage: '',
          start: 1620633335037,
          end: 1620633337825
        },
        {
          code: 'WRITE_CDC_EVENT',
          status: 'waiting',
          errorMessage: '',
          start: 0,
          end: 0
        }
      ],
      stats: {
        input: { rows: 4990000, dataSize: 239520000 },
        output: { rows: 4990000, dataSize: 239520000 },
        insert: { rows: 4990000, dataSize: 0 },
        update: { rows: 0, dataSize: 0 },
        delete: { rows: 0, dataSize: 0 },
        transmissionTime: 662899,
        transTimeAvg: 0,
        replicationLag: 26874,
        stagesMetrics: [
          {
            stageId: '860486ba-a620-44e8-82a4-dc98b62778ec',
            input: { rows: 0, dataSize: 0 },
            output: { rows: 4990000, dataSize: 239520000 },
            insert: { rows: 0, dataSize: 0 },
            update: { rows: 0, dataSize: 0 },
            delete: { rows: 0, dataSize: 0 },
            transmissionTime: 0,
            transTimeAvg: 0,
            replicationLag: 26874,
            status: 'cdc'
          },
          {
            stageId: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
            input: { rows: 4990000, dataSize: 239520000 },
            output: { rows: 0, dataSize: 0 },
            insert: { rows: 4990000, dataSize: 0 },
            update: { rows: 0, dataSize: 0 },
            delete: { rows: 0, dataSize: 0 },
            transmissionTime: 662899,
            transTimeAvg: 0,
            replicationLag: 26874,
            status: null
          }
        ],
        totalCount: null
      },
      cdcLastTimes: [
        {
          sourceConnectionId: '60803202ddc0f40343b87e35',
          sourceConnectionName: 'local_179',
          targetConnectionId: '6087c2ee0786e30010d4c882',
          targetConnectionName: 'DRS-ALI-DEST',
          cdcTime: 1619608271000
        }
      ],
      executionTime: 1.5743833333333332,
      errorEvents: [],
      user: { email: '60718c178fbae2c47bc294b3@custom.com', username: '小瓶套' }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/:id/copy': {
    data: {
      last_updated: '2021-05-10T07:58:26.739Z',
      id: '6098e7a2c66ab70010981c53',
      name: 'sudu 8 (1)',
      description: '',
      status: 'draft',
      executeMode: 'normal',
      category: '数据库克隆',
      stopOnError: false,
      mappingTemplate: 'cluster-clone',
      stages: [
        {
          connectionId: '60803202ddc0f40343b87e35',
          dataQualityTag: false,
          distance: 1,
          freeTransform: false,
          id: '860486ba-a620-44e8-82a4-dc98b62778ec',
          inputLanes: [],
          joinTables: [],
          name: 'local_179',
          outputLanes: ['76dfca82-f8d1-4909-b6e4-d341fb310bb2'],
          type: 'database',
          database_type: 'mysql',
          dropType: 'no_drop',
          readBatchSize: 1000,
          readCdcInterval: 500,
          statsStatus: 'cdc'
        },
        {
          connectionId: '6087c2ee0786e30010d4c882',
          dataQualityTag: false,
          distance: 0,
          freeTransform: false,
          id: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
          inputLanes: ['860486ba-a620-44e8-82a4-dc98b62778ec'],
          joinTables: [],
          name: 'DRS-ALI-DEST',
          outputLanes: [],
          type: 'database',
          syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
          table_prefix: 'ff013_',
          table_suffix: '',
          readBatchSize: 1000,
          readCdcInterval: 500,
          dropType: 'no_drop',
          database_type: 'mysql',
          statsStatus: null
        }
      ],
      setting: {
        name: 'sudu 8',
        sync_type: 'initial_sync+cdc',
        distinctWriteType: 'intellect',
        stopOnError: false,
        isOpenAutoDDL: false,
        twoWay: false,
        syncPoints: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            type: 'current',
            time: '',
            date: '',
            name: '',
            timezone: '+8'
          }
        ],
        readBatchSize: 25000,
        notificationWindow: 0,
        notificationInterval: 300,
        readCdcInterval: 500,
        description: '',
        drop_target: false,
        needToCreateIndex: false,
        increment: false,
        isSchedule: false,
        emailWaring: {
          edited: false,
          started: false,
          error: true,
          paused: true
        }
      },
      dataFlowType: 'normal',
      dataSourceModel: {
        source_databaseType: 'mysql',
        target_databaseType: 'mysql',
        source_connectionId: '60803202ddc0f40343b87e35',
        target_connectionId: '6087c2ee0786e30010d4c882',
        source_connectionName: 'local_179',
        target_connectionName: 'DRS-ALI-DEST'
      },
      platformInfo: { region: '', zone: '' },
      agentTags: ['', ''],
      emailWaring: { edited: true, started: false, error: true, paused: false },
      user_id: '6072c1cbbf43e90010570f3c',
      customId: '60718c178fbae2c47bc294b3',
      msg: '',
      scheduleTime: 1620633332823,
      scheduleTimes: 1,
      pingTime: 1620633379338,
      stats: {}
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/resetAll': {
    data: {
      success: [{ id: '6098e7a2c66ab70010981c53', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/removeAll': {
    data: {
      success: [{ id: '6098e7a2c66ab70010981c53', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/nodeConfigs': { data: [], code: 'ok', msg: 'ok' },
  '/api/Logs': { data: [], code: 'ok', msg: 'ok' },
  '/api/DataFlowInsights/runtimeMonitor': {
    code: 'ok',
    msg: 'ok',
    data: []
  },
  '/api/Inspects/count': { data: { count: 1 }, code: 'ok', msg: 'ok' },
  '/api/Inspects': {
    code: 'ok',
    msg: 'ok',
    'data|10-50': [
      {
        InspectResult: {
          agentId: '@id',
          createTime: '@now',
          end: 1619339604593,
          errorMsg: 'errorMsg',
          id: '@id',
          inspect: {},
          inspect_id: '@id',
          last_updated: '@now',
          progress: Random.integer(0, 3),
          source_total: Random.integer(10000, 1000000),
          spendMilli: Random.integer(0, 100),
          start: 1619339546788,
          'stats|0-10': [
            {
              taskId: '@name',
              target_total: Random.integer(100, 10000),
              target_only: Random.integer(100, 10000),
              status: 'done',
              speed: Random.integer(0, 100),
              start: 1619339546806,
              end: 1619339587965
            }
          ],
          status: 'error',
          target_total: 44625001,
          threads: Random.integer(0, 100),
          ttlTime: '2021-07-24T08:32:26.799Z'
        },
        agentId: '@id',
        agentTags: [],
        createTime: '2021-04-25T08:32:22.866Z',
        customId: '@id',
        dataFlowName: '@name',
        difference_number: 0,
        enabled: true,
        errorMsg: 'errorMsg',
        flowId: '@id',
        id: '@id',
        inspectMethod: 'row_count',
        lastStartTime: 1619339546685,
        last_updated: '2021-04-25T08:33:24.609Z',
        limit: { keep: 100 },
        mode: 'manual',
        name: '@name',
        ping_time: 1619339601803,
        result: 'failed',
        scheduleTime: 1619339546690,
        scheduleTimes: 1,
        'status|1': ['waiting', 'scheduling', 'error', 'done', 'running'],
        'tasks|0-20': [
          {
            fullMatch: true,
            script: '',
            showAdvancedVerification: false,
            taskId: '@id',
            webScript: '',
            source: {
              connectionId: '@id',
              connectionName: '@name',
              sortColumn: 'id',
              table: '@name',
              'fields|0-10': [
                {
                  field_name: '@name',
                  id: '@id',
                  primary_key_position: 1
                }
              ]
            },
            target: {
              connectionId: '@id',
              connectionName: '@name',
              sortColumn: '@name',
              table: '@name',
              'fields|0-10': [
                {
                  field_name: '@name',
                  id: '@id',
                  primary_key_position: 1
                }
              ]
            }
          }
        ],
        timing: {
          end: 1619425927612,
          intervals: 1440,
          intervalsUnit: 'minute',
          start: 1619339527612
        },
        user_id: '@id'
      }
    ]
  },
  '/api/Inspects/update': { data: { count: 1 }, code: 'ok', msg: 'ok' },
  '/api/InspectResults/count': { data: { count: 1 }, code: 'ok', msg: 'ok' },
  '/api/InspectResults': {
    code: 'ok',
    msg: 'ok',
    data: [
      {
        agentId: '@id',
        createTime: '@now',
        difference_number: Random.integer(0, 20),
        end: '',
        errorMsg: '',
        id: '@id',
        inspect: {},
        inspect_id: '@id',
        last_updated: '@now',
        progress: Random.integer(0, 20),
        result: 'passed',
        source_total: Random.integer(0, 20),
        spendMilli: Random.integer(0, 20),
        start: 1620639705702,
        'stats|1-5': [
          {
            both: Random.integer(0, 20),
            cycles: Random.integer(0, 20),
            end: null,
            errorMsg: null,
            progress: Random.integer(0, 20),
            result: null,
            row_failed: Random.integer(0, 20),
            row_passed: Random.integer(0, 20),
            source: {
              columns: null,
              connectionId: '@id',
              connectionName: '@name',
              direction: null,
              limit: Random.integer(0, 20),
              skip: Random.integer(0, 20),
              sortColumn: '@name',
              table: '@name',
              where: null
            },
            source_only: Random.integer(0, 20),
            source_total: Random.integer(0, 20),
            speed: Random.integer(0, 20),
            start: 1620639705703,
            status: 'running',
            target: {
              columns: null,
              connectionId: '@id',
              connectionName: '@name',
              direction: null,
              limit: Random.integer(0, 20),
              skip: Random.integer(0, 20),
              sortColumn: '@name',
              table: '@name',
              where: null
            },
            target_only: Random.integer(0, 20),
            target_total: Random.integer(0, 20),
            taskId: '@id'
          }
        ],
        status: 'running',
        target_total: Random.integer(0, 20),
        threads: Random.integer(0, 20),
        ttlTime: '@now'
      }
    ]
  },
  '/api/InspectDetails/count': { data: { count: 0 }, code: 'ok', msg: 'ok' },
  '/api/InspectDetails': { data: [], code: 'ok', msg: 'ok' },
  '/api/users': {
    'data|1-10': [
      {
        'account_status|1': [0, 1],
        accesscode: '3324cfdf-7d3e-4792-bd32-571638d4562f',
        username: '@name',
        email: 'admin@admin.com',
        emailVerified: true,
        id: '@id',
        role: 1,
        emailVerified_from_frontend: true,
        data: { isCompleteGuide: true },
        last_updated: '2021-04-03T08:05:58.827Z',
        'isCompleteGuide|1': Boolean,
        favorites: [
          {
            name: 'dataExplorer',
            query: {
              apiServer: 'apiServerId',
              collection: 'v1POLICY_REPL_v1',
              condition: '{"and":[{"POLICY_ID":"P100000001"}]}',
              sortBy: '_id',
              fields:
                '{"POLICY_ID":true,"CUSTOMER_ID":true,"QUOTE_DAY":true,"COVER_START":true,"LAST_ANN_PREMIUM_GROSS":true,"POLICY_STATUS":true,"LAST_CHANGE":true,"_id":true}'
            },
            meta: { title: 'tst' }
          }
        ],
        'roleMappings|1-5': [
          {
            id: '@id',
            principalType: 'USER',
            principalId: '5fcf01b8f89acdf892e8bf78',
            roleId: '5b9a0a383fcba02649524bf1',
            role: {
              created: '2021-01-07T13:03:42.794Z',
              modified: '2021-01-07T13:03:42.794Z',
              name: 'admin',
              id: '5b9a0a383fcba02649524bf1',
              last_updated: '2021-01-15T13:15:19.201Z',
              register_user_default: false,
              user_id: '5fcf01b8f89acdf892e8bf78'
            }
          }
        ]
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/menu': {
    'data|1-20': [
      {
        type: 'menu',
        name: '@name',
        label: '@name',
        'public|1': Boolean,
        'isApplication|1': Boolean,
        client_id: '@id'
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/Workers': {
    'data|1-10': [
      {
        process_id: '@id',
        start_time: 1620307647517,
        ping_time: 1620809129793,
        worker_type: 'connector',
        total_thread: 1,
        running_thread: 0,
        job_ids: [],
        id: '@id',
        worker_ip: '::ffff:127.0.0.1',
        version: 'v1.19.0-216-g54d4110e9',
        hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2',
        last_updated: '2021-05-06T13:27:27.657Z',
        createTime: '2021-05-06T13:27:27.657Z',
        cpuLoad: Random.integer(0, 10),
        usedMemory: 1016008704,
        user_id: '5fcf01b8f89acdf892e8bf78',
        serverDate: 1620809130695
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/Workers/count': { data: { count: 232 }, code: 'ok', msg: 'ok' },
  '/api/users/roles': {
    'data|0-20': [
      {
        id: '@id',
        name: '@name',
        description: '只有数据源权限的用户',
        created: '2021-04-23T03:43:08.092Z',
        modified: '2021-04-23T03:43:08.092Z',
        register_user_default: false,
        user_id: '5fcf01b8f89acdf892e8bf78',
        last_updated: '2021-04-23T03:43:08.093Z',
        createTime: '2021-04-23T03:43:08.093Z',
        userEmail: 'admin@admin.com',
        userCount: 1
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/roles/count': { data: { count: 27 }, code: 'ok', msg: 'ok' },
  '/api/roles': {
    'data|0-20': [
      {
        id: '@id',
        name: '@name',
        created: '2021-01-07T13:03:42.794Z',
        modified: '2021-01-07T13:03:42.794Z',
        last_updated: '2021-01-15T13:15:19.201Z',
        'register_user_default|1': Boolean,
        user_id: '@id'
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/Licenses': { data: [], code: 'ok', msg: 'ok' },
  '/api/users/:id': {
    data: {
      account_status: 1,
      accesscode: '3324cfdf-7d3e-4792-bd32-571638d4562f',
      username: 'admin',
      email: 'admin@admin.com',
      emailVerified: true,
      id: '5fcf01b8f89acdf892e8bf78',
      role: 1,
      emailVerified_from_frontend: true,
      data: { isCompleteGuide: true },
      last_updated: '2021-04-03T08:05:58.827Z',
      isCompleteGuide: true,
      favorites: [
        {
          name: 'dataExplorer',
          query: {
            apiServer: 'apiServerId',
            collection: 'v1POLICY_REPL_v1',
            condition: '{"and":[{"POLICY_ID":"P100000001"}]}',
            sortBy: '_id',
            fields:
              '{"POLICY_ID":true,"CUSTOMER_ID":true,"QUOTE_DAY":true,"COVER_START":true,"LAST_ANN_PREMIUM_GROSS":true,"POLICY_STATUS":true,"LAST_CHANGE":true,"_id":true}'
          },
          meta: { title: 'tst' }
        }
      ],
      roleMappings: [
        {
          id: '600162d8188734b1d4e010e1',
          principalType: 'USER',
          principalId: '5fcf01b8f89acdf892e8bf78',
          roleId: '5b9a0a383fcba02649524bf1',
          role: {
            created: '2021-01-07T13:03:42.794Z',
            modified: '2021-01-07T13:03:42.794Z',
            name: 'admin',
            id: '5b9a0a383fcba02649524bf1',
            last_updated: '2021-01-15T13:15:19.201Z',
            register_user_default: false,
            user_id: '5fcf01b8f89acdf892e8bf78'
          }
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/clusterStates': {
    'data|0-10': [
      {
        id: '@id',
        systemInfo: {
          hostname: '@name',
          uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
          ip: '10.233.67.116',
          ips: ['10.233.67.116'],
          time: 1620812073175,
          accessCode: '<ACCESS_CODE>',
          username: '',
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278'
        },
        reportInterval: 20000,
        engine: { processID: ' 10491', 'status|1': ['running', 'stopped'] },
        management: { processID: ' 10484', 'status|1': ['running', 'stopped'] },
        apiServer: { processID: ' 10493', 'status|1': ['running', 'stopped'] },
        customMonitorStatus: [
          {
            uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
            id: '@id',
            name: '@name',
            command: '7',
            arguments: '',
            'status|1': ['stopped', 'running']
          }
        ],
        uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
        'status|1': ['running', 'down'],
        insertTime: '2021-05-12T09:34:33.176Z',
        ttl: '2021-05-12T09:35:13.176Z',
        last_updated: '2021-05-12T09:34:33.177Z',
        createTime: '2021-01-28T08:59:46.302Z',
        agentName: 'tapdaas-test2',
        custIP: '10.233.67.191',
        customMonitor: [
          {
            uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
            id: '601a1434aa4cc500b3adf9cb',
            name: '7',
            command: '7',
            arguments: ''
          }
        ],
        updateTime: '2021-03-25T08:47:29.245Z',
        managementOperation: {
          _id: '60786d75252a040057bfaf10',
          status: 4,
          msg: '执行超时',
          operation: 'restart',
          ttl: 1618505127738
        },
        apiServerOperation: {
          _id: '604b3cf1fb4a8302ffe5e510',
          status: 4,
          msg: '执行超时',
          operation: 'start',
          ttl: 1615543576247
        },
        engineOperation: {
          _id: '6084e3b958c76a2315177468',
          status: 2,
          msg: '',
          operation: 'start',
          ttl: 1619321840158
        }
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/clusterStates/updataStatus': {
    data: { greeting: '1' },
    code: 'ok',
    msg: 'ok'
  },
  '/api/clusterStates/removeMonitor': {
    data: {},
    code: 'ok',
    msg: 'ok'
  },
  '/api/clusterStates/editMonitor': {
    data: {},
    code: 'ok',
    msg: 'ok'
  },
  '/api/MetadataInstances/count': {
    data: { count: 100 },
    code: 'ok',
    msg: 'ok'
  },
  '/api/MetadataInstances/dataMap': {
    data: { records: [] },
    code: 'ok',
    msg: 'ok'
  },
  '/api/MetadataInstances': {
    code: 'ok',
    msg: 'ok',
    'data|1-10': [
      {
        id: '@id',
        meta_type: 'database',
        original_name: '@name',
        username: '@name',
        'indexes|1-10': [
          {
            create_by: '@name',
            name: '@name',
            ns: 'jason_db.d3333',
            status: 'created',
            v: 2,
            key: { _id: 1, CUSTOMER_ID: 1 }
          }
        ],
        source: {
          name: 'CSS-MongoDB-Test',
          connection_type: 'source_and_target',
          database_type: 'mongodb',
          database_host: '192.168.1.189',
          database_username: 'root',
          database_port: 24212,
          database_uri: '',
          database_name: 'PC',
          database_owner: '',
          retry: 0,
          nextRetry: null,
          id: '6076ffbab0f20408b0ec0914',
          response_body: {
            validate_details: [
              {
                stage_code: 'validate-3000',
                show_msg: 'CHECK_CONNECT',
                status: 'passed',
                sort: 1,
                error_code: null,
                fail_message: null,
                required: true
              },
              {
                stage_code: 'validate-3100',
                show_msg: 'CHECK_AUTH',
                status: 'passed',
                sort: 2,
                error_code: null,
                fail_message: null,
                required: true
              },
              {
                stage_code: 'validate-3400',
                show_msg: 'CHECK_PERMISSION',
                status: 'passed',
                sort: 3,
                error_code: null,
                fail_message: null,
                required: true
              },
              {
                stage_code: 'validate-3200',
                show_msg: 'LOAD_SCHEMA',
                status: 'passed',
                sort: 4,
                error_code: null,
                fail_message: null,
                required: true
              }
            ],
            retry: 0,
            next_retry: 1619355584409
          },
          project: '',
          submit: true,
          plain_password: '',
          table_filter: '',
          additionalString: 'authSource=admin',
          thin_type: '',
          node_name: '',
          database_schema: '',
          plugin_name: '',
          pgsql_log_decorder_plugin_name: '',
          database_datetype_without_timezone: '',
          supportUpdatePk: false,
          ssl: false,
          sslKey: '',
          sslPass: '',
          schemaAutoUpdate: false,
          sslValidate: false,
          sslCA: '',
          search_databaseType: '',
          sourceType: 'dds',
          updateSchema: false,
          editTest: true,
          sslCert: '',
          status: 'ready',
          fill: '',
          transformed: true,
          user_id: '6072c1cbbf43e90010570f3c',
          customId: '60718c178fbae2c47bc294b3',
          last_updated: '2021-04-25T13:29:36.021Z',
          createTime: '2021-04-14T14:44:10.392Z',
          testTime: 1619357376015,
          dbFullVersion: '4.2.12',
          db_version: 4,
          loadCount: 8,
          loadFieldsStatus: 'finished',
          loadSchemaField: false,
          schemaVersion: '08309d72-2d22-48cf-9b9a-b3942e9279ec',
          tableCount: 8,
          everLoadSchema: true,
          errorMsg: 'testing timeout',
          schema: {},
          _id: '6076ffbab0f20408b0ec0914'
        }
      }
    ]
  },
  '/api/MetadataInstances/search': {
    data: {
      records: {
        pageSize: 16,
        'data|1-10': [
          {
            id: '@id',
            table: { name: '@name', original_name: '@name', comment: '@name' }
          }
        ]
      }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataCatalogs/count': { data: { count: 6 }, code: 'ok', msg: 'ok' },
  '/api/DataCatalogs/getList': {
    'data|0-50': [
      {
        _id: '@id',
        conn_info: {
          uri: 'mongodb://root:123456@demodb.tapdata.net:21330/jason_db?replicaSet=tapd8_l&authSource=admin',
          collection: 'TEST_DATA_CATALOG'
        },
        asset_desc: 'TEST_DATA_CATALOG',
        collection: 'TEST_DATA_CATALOG',
        connection_id: '@id',
        create_time: '2021-01-28T01:45:07.217Z',
        database: '@name',
        lastModified: '2021-01-28T01:45:07.217Z',
        tags: null,
        total_docs: Random.integer(0, 10000),
        user_id: '5fcf29bb8f6b63010045655a',
        violated_docs: Random.integer(0, 10000),
        violated_percentage: Random.integer(0, 10000),
        source: {
          name: '@name',
          database_type: 'mongodb',
          'status|1': ['ready']
        }
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/old/static/localize': { code: 'ok', msg: 'ok' },
  '/api/MetadataDefinitions': {
    'data|0-10': [
      {
        value: 'Dass',
        id: '@id',
        item_type: ['collection'],
        user_id: '@id',
        last_updated: '2020-12-17T04:55:29.220Z',
        createTime: '2020-12-17T04:27:55.480Z'
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/tcm/agent/agentCount': {
    reqId: '77006b00-0afb-4ed5-acf4-916655e83e93',
    code: 'ok',
    data: {
      agentTotalCount: 4,
      agentRunningCount: 1,
      twoWayAgentRunningCount: 0
    }
  }
}
