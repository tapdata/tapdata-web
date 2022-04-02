const Mock = require('mockjs')
const settings = require('./settings.json')
const permission = require('./permission.json')
const Random = Mock.Random
const dataflow = require('./dataflow.js')
const measurement = require('./measurement.js')
const subtask = require('./subtask.js')
const sharedCache = require('./sharedCache.js')

module.exports = Object.assign({}, dataflow, measurement, subtask, sharedCache, {
  '/api/Connections': {
    code: 'ok',
    msg: 'ok',
    data: {
      'items|1-30': [
        {
          name: '@name',
          connection_type: 'target',
          'database_type|1': ['mysql', 'oracle', 'mongodb'],
          database_host: '',
          database_username: '',
          database_port: Random.integer(0, 5000),
          database_uri: () => {
            return 'mongodb://192.168.1.191:' + Random.integer(0, 5000) + '/tapdata_test'
          },
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
          'loadFieldsStatus|1': ['loading', 'finished', 'error'],
          tableCount: Random.integer(0, 100),
          username: '@name'
        }
      ]
    }
  },
  '/api/Settings/findOne': {
    data: {
      category: 'notification',
      key: 'notification',
      value:
        '{"runNotification":[{"label":"jobStarted","notice":true,"email":false},{"label":"jobPaused","notice":true,"email":false},{"label":"jobDeleted","notice":true,"email":false},{"label":"jobStateError","notice":true,"email":false},{"label":"jobEncounterError","notice":true,"email":true,"noticeInterval":"noticeInterval","Interval":"1","util":"hour"},{"label":"CDCLagTime","notice":true,"email":true,"lagTime":"lagTime","lagTimeInterval":"20","lagTimeUtil":"second","noticeInterval":"noticeInterval","noticeIntervalInterval":"4","noticeIntervalUtil":"hour"},{"label":"inspectCount","notice":true,"email":false},{"label":"inspectValue","notice":true,"email":false},{"label":"inspectDelete","notice":true,"email":false},{"label":"inspectError","notice":true,"email":false}],"systemNotification":[],"agentNotification":[{"label":"serverDisconnected","notice":true,"email":true},{"label":"agentStarted","notice":true,"email":false},{"label":"agentStopped","notice":true,"email":true},{"label":"agentCreated","notice":true,"email":false},{"label":"agentDeleted","notice":true,"email":true}]}',
      default_value: '',
      documentation: 'Notification Setting',
      last_update: 0,
      last_update_by: '',
      scope: 'global',
      sort: 1,
      category_sort: 4,
      key_label: 'Notification Setting',
      user_visible: false,
      hot_reloading: true,
      id: '76',
      last_updated: '2021-06-16T09:43:53.468Z'
    },
    code: 'ok',
    msg: 'ok'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
        ],
        last_updated: '2021-05-06T13:27:26.902Z',
        createTime: '2021-05-06T13:27:26.902Z'
      },
      {
        id: '6093eebec51425290fec3d2a',
        type: 'tcp_udp',
        name: 'Tcp_Udp',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection',
          'mq'
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
          'tcp_udp',
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
          'tcp_udp',
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
          'tcp_udp',
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
          'tcp_udp',
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
          'tcp_udp',
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
      },
      {
        id: '6093eebec51425290fec3d35',
        type: 'mq',
        name: 'mq',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow', 'mysql'],
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
  '/api/tcm/product/vip': { code: 'ok', msg: 'ok' },
  '/api/Connections/:id/copy': {
    code: 'ok',
    msg: 'ok',
    data: {
      result: {}
    }
  },
  '/api/Connections/listAll': {
    reqId: '94c28e13-1934-491d-9680-2d636014eb36',
    ts: 1648839101914,
    code: 'ok',
    data: [
      {
        id: '621c426eae53313ba32f5886',
        createAt: '2022-02-28T03:33:02.000+00:00',
        lastUpdAt: '2022-04-01T02:28:05.703+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_oracle_sharecdc',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '621c43cdae53313ba3312fc2',
        createAt: '2022-02-28T03:38:53.000+00:00',
        lastUpdAt: '2022-03-31T11:51:20.274+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_oracle_sharecdc_132',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '621cb9a1ae53313ba3322487',
        createAt: '2022-02-28T12:01:37.000+00:00',
        lastUpdAt: '2022-04-01T07:01:02.655+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'TestMySQL_33061',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '621cba06ae53313ba3322dcf',
        createAt: '2022-02-28T12:03:18.000+00:00',
        lastUpdAt: '2022-03-31T04:07:14.710+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mysql_5733_33063',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '621da09698bcdf1ea2e02249',
        createAt: '2022-03-01T04:27:02.000+00:00',
        lastUpdAt: '2022-03-11T02:59:32.716+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'PG_183_15432',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '621dd7bc98bcdf1ea2e14aad',
        createAt: '2022-03-01T08:22:20.000+00:00',
        lastUpdAt: '2022-03-11T10:37:27.330+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'robot-mysql',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '621dd81698bcdf1ea2e14c70',
        createAt: '2022-03-01T08:23:50.000+00:00',
        lastUpdAt: '2022-03-30T03:55:12.696+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'TestADBMySQL_3306',
        connection_type: 'source',
        database_type: 'adb_mysql',
        status: 'invalid'
      },
      {
        id: '621dd94398bcdf1ea2e152d3',
        createAt: '2022-03-01T08:28:51.000+00:00',
        lastUpdAt: '2022-03-26T10:37:57.660+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'TestSQLserver2019_11434',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '621dda1498bcdf1ea2e15c11',
        createAt: '2022-03-01T08:32:20.000+00:00',
        lastUpdAt: '2022-03-12T04:59:43.809+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'TestMariaDB_43061',
        connection_type: 'source_and_target',
        database_type: 'mariadb',
        status: 'ready'
      },
      {
        id: '621ddab398bcdf1ea2e15f54',
        createAt: '2022-03-01T08:34:59.000+00:00',
        lastUpdAt: '2022-03-31T11:50:06.453+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Testoracle_tap122c',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'invalid'
      },
      {
        id: '621de90998bcdf1ea2e1d56c',
        createAt: '2022-03-01T09:36:09.000+00:00',
        lastUpdAt: '2022-03-21T08:23:25.181+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'TestKunDB_3306',
        connection_type: 'source_and_target',
        database_type: 'kundb',
        status: 'ready'
      },
      {
        id: '621df3ab98bcdf1ea2e22375',
        createAt: '2022-03-01T10:21:31.000+00:00',
        lastUpdAt: '2022-03-29T09:55:10.238+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_mysql_source',
        connection_type: 'source',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '621df3ab98bcdf1ea2e22392',
        createAt: '2022-03-01T10:21:31.000+00:00',
        lastUpdAt: '2022-03-29T10:13:29.754+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'oracle_19c_TAPDATA',
        connection_type: 'source',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '621df3ac98bcdf1ea2e22397',
        createAt: '2022-03-01T10:21:32.000+00:00',
        lastUpdAt: '2022-03-29T10:05:25.083+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'oracle_niko_TAPDATA',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '621df3ac98bcdf1ea2e223a3',
        createAt: '2022-03-01T10:21:32.000+00:00',
        lastUpdAt: '2022-04-01T03:19:36.147+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'sqlserver_2019_source',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '621df3ac98bcdf1ea2e223a8',
        createAt: '2022-03-01T10:21:32.000+00:00',
        lastUpdAt: '2022-03-31T08:05:52.717+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'sqlserver_2019_target',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '621df3ac98bcdf1ea2e223ab',
        createAt: '2022-03-01T10:21:32.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'sqlserver_2017_no_cdc',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '621df3ac98bcdf1ea2e223b5',
        createAt: '2022-03-01T10:21:32.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'postgres_5437',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '621df3ad98bcdf1ea2e223b7',
        createAt: '2022-03-01T10:21:33.000+00:00',
        lastUpdAt: '2022-03-29T11:14:00.934+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'postgres_5437_target',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '621df3ad98bcdf1ea2e223c2',
        createAt: '2022-03-01T10:21:33.000+00:00',
        lastUpdAt: '2022-03-24T07:03:48.660+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_db2_source',
        connection_type: 'source',
        database_type: 'db2',
        status: 'ready'
      },
      {
        id: '621df3ad98bcdf1ea2e223c5',
        createAt: '2022-03-01T10:21:33.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'auto_db2_target',
        connection_type: 'source',
        database_type: 'db2',
        status: 'ready'
      },
      {
        id: '621df3ad98bcdf1ea2e223cb',
        createAt: '2022-03-01T10:21:33.000+00:00',
        lastUpdAt: '2022-03-12T06:43:03.591+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_gaussdb_source_new',
        connection_type: 'source_and_target',
        database_type: 'gaussdb200',
        status: 'ready'
      },
      {
        id: '621df3ad98bcdf1ea2e223cf',
        createAt: '2022-03-01T10:21:33.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'auto_gaussdb_target_new',
        connection_type: 'source_and_target',
        database_type: 'gaussdb200',
        status: 'ready'
      },
      {
        id: '621df3ad98bcdf1ea2e223d5',
        createAt: '2022-03-01T10:21:33.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'auto_redis_target_01',
        connection_type: 'source',
        database_type: 'redis',
        status: 'ready'
      },
      {
        id: '621df3ad98bcdf1ea2e223e0',
        createAt: '2022-03-01T10:21:33.000+00:00',
        lastUpdAt: '2022-03-30T04:12:00.407+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_redis_target_02',
        connection_type: 'source',
        database_type: 'redis',
        status: 'ready'
      },
      {
        id: '621df3ae98bcdf1ea2e223e5',
        createAt: '2022-03-01T10:21:34.000+00:00',
        lastUpdAt: '2022-03-24T07:03:12.584+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'kafka_source_test',
        connection_type: 'source_and_target',
        database_type: 'kafka',
        status: 'ready'
      },
      {
        id: '621df3ae98bcdf1ea2e223e8',
        createAt: '2022-03-01T10:21:34.000+00:00',
        lastUpdAt: '2022-03-30T10:48:39.999+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'kafka_183_all_topic',
        connection_type: 'source_and_target',
        database_type: 'kafka',
        status: 'ready'
      },
      {
        id: '621df3ae98bcdf1ea2e223ec',
        createAt: '2022-03-01T10:21:34.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'auto_mariadb_source',
        connection_type: 'source',
        database_type: 'mariadb',
        status: 'ready'
      },
      {
        id: '621df3ae98bcdf1ea2e22415',
        createAt: '2022-03-01T10:21:34.000+00:00',
        lastUpdAt: '2022-03-28T10:21:34.356+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'ActiveMQ_source_and_target',
        connection_type: 'source_and_target',
        database_type: 'mq',
        status: 'ready'
      },
      {
        id: '621df3af98bcdf1ea2e2241a',
        createAt: '2022-03-01T10:21:35.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'Rocket_only_for_auto',
        connection_type: 'source_and_target',
        database_type: 'mq',
        status: 'ready'
      },
      {
        id: '621df3af98bcdf1ea2e2241d',
        createAt: '2022-03-01T10:21:35.000+00:00',
        lastUpdAt: '2022-03-13T04:54:31.958+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Rabbit_only_for_auto',
        connection_type: 'source_and_target',
        database_type: 'mq',
        status: 'invalid'
      },
      {
        id: '621df3af98bcdf1ea2e22421',
        createAt: '2022-03-01T10:21:35.000+00:00',
        lastUpdAt: '2022-03-12T05:02:49.590+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_hbase_source',
        connection_type: 'source',
        database_type: 'hbase',
        status: 'invalid'
      },
      {
        id: '621df3af98bcdf1ea2e22429',
        createAt: '2022-03-01T10:21:35.000+00:00',
        lastUpdAt: '2022-03-18T07:46:28.718+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_kudu_source',
        connection_type: 'source_and_target',
        database_type: 'kudu',
        status: 'invalid'
      },
      {
        id: '621df3b098bcdf1ea2e2245b',
        createAt: '2022-03-01T10:21:36.000+00:00',
        lastUpdAt: '2022-03-17T13:16:19.927+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Greenplum_183_source',
        connection_type: 'source_and_target',
        database_type: 'greenplum',
        status: 'ready'
      },
      {
        id: '621df3b098bcdf1ea2e22507',
        createAt: '2022-03-01T10:21:36.000+00:00',
        lastUpdAt: '2022-03-11T09:47:15.081+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Greenplum_183_target',
        connection_type: 'source_and_target',
        database_type: 'greenplum',
        status: 'ready'
      },
      {
        id: '621df3b098bcdf1ea2e22512',
        createAt: '2022-03-01T10:21:36.000+00:00',
        lastUpdAt: '2022-03-30T09:21:31.112+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'AUTO_TIDB_SOURCE',
        connection_type: 'source_and_target',
        database_type: 'tidb',
        status: 'ready'
      },
      {
        id: '621df3b198bcdf1ea2e2251c',
        createAt: '2022-03-01T10:21:37.000+00:00',
        lastUpdAt: '2022-03-30T09:24:41.812+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'AUTO_TIDB_TARGET',
        connection_type: 'source_and_target',
        database_type: 'tidb',
        status: 'testing'
      },
      {
        id: '621df3b198bcdf1ea2e22551',
        createAt: '2022-03-01T10:21:37.000+00:00',
        lastUpdAt: '2022-03-16T14:51:56.367+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_hana_source',
        connection_type: 'source_and_target',
        database_type: 'hana',
        status: 'ready'
      },
      {
        id: '621df3b198bcdf1ea2e2255c',
        createAt: '2022-03-01T10:21:37.000+00:00',
        lastUpdAt: '2022-03-16T14:52:02.913+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_hana_target',
        connection_type: 'source_and_target',
        database_type: 'hana',
        status: 'ready'
      },
      {
        id: '621df3b298bcdf1ea2e2256e',
        createAt: '2022-03-01T10:21:38.000+00:00',
        lastUpdAt: '2022-03-11T09:43:35.426+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_kundb_source',
        connection_type: 'source_and_target',
        database_type: 'kundb',
        status: 'ready'
      },
      {
        id: '621df3b298bcdf1ea2e22587',
        createAt: '2022-03-01T10:21:38.000+00:00',
        lastUpdAt: '2022-03-11T09:13:31.197+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_kundb_target',
        connection_type: 'source_and_target',
        database_type: 'kundb',
        status: 'ready'
      },
      {
        id: '621e027d98bcdf1ea2e2e0ee',
        createAt: '2022-03-01T11:24:45.000+00:00',
        lastUpdAt: '2022-03-12T03:03:52.004+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'test',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '62203d6da22d061bf2b206bc',
        createAt: '2022-03-03T04:00:45.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'TestMariaDB_43061 - Copy',
        connection_type: 'source_and_target',
        database_type: 'mariadb',
        status: 'ready'
      },
      {
        id: '6221c53a3c508618ff71ae37',
        createAt: '2022-03-04T07:52:26.000+00:00',
        lastUpdAt: '2022-03-04T07:53:15.191+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'sharecdc_mongo',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'invalid'
      },
      {
        id: '6221c5cc3c508618ff71ae9f',
        createAt: '2022-03-04T07:54:52.000+00:00',
        lastUpdAt: '2022-03-31T07:09:08.812+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'TestMongoDB_24212',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '62234fd03c508618ff76152f',
        createAt: '2022-03-05T11:56:00.000+00:00',
        lastUpdAt: '2022-03-31T11:50:41.202+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'oracle132_tap11g',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '6225a74e3c508618ff7fb8a8',
        createAt: '2022-03-07T06:33:50.000+00:00',
        lastUpdAt: '2022-03-18T07:27:26.099+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'TestMongoDB_27017',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '6229bbec33ce4462445aa1fd',
        createAt: '2022-03-10T08:50:52.000+00:00',
        lastUpdAt: '2022-03-31T11:45:29.365+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_mongo',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '622ab27e8c51e976658c45ad',
        createAt: '2022-03-11T02:22:54.000+00:00',
        lastUpdAt: '2022-03-11T02:16:11.447+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_mysql - Copy',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '622acd238c51e976658da02c',
        createAt: '2022-03-11T04:16:35.000+00:00',
        lastUpdAt: '2022-03-31T11:48:49.088+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_mysql',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '622ace0e8c51e976658dbcf9',
        createAt: '2022-03-11T04:20:30.000+00:00',
        lastUpdAt: '2022-03-14T05:09:38.600+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'docker_mysql_8023_target',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '622adb5d8c51e976658f58b1',
        createAt: '2022-03-11T05:17:17.000+00:00',
        lastUpdAt: '2022-03-11T05:17:23.861+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'test2',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '622adbed8c51e976658f6d9d',
        createAt: '2022-03-11T05:19:41.000+00:00',
        lastUpdAt: '2022-03-25T09:58:19.238+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_mysql',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '622ade528c51e976658fa95f',
        createAt: '2022-03-11T05:29:54.000+00:00',
        lastUpdAt: '2022-03-11T05:21:04.727+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_mysql - Copy - Copy',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '622aef43e7507c5119b1273e',
        createAt: '2022-03-11T06:42:11.000+00:00',
        lastUpdAt: '2022-03-31T07:53:37.991+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_sqlserver',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '622af5c5e7507c5119b130c0',
        createAt: '2022-03-11T07:09:57.000+00:00',
        lastUpdAt: '2022-03-14T11:38:25.886+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'test_gbase_183',
        connection_type: 'source',
        database_type: 'gbase-8s',
        status: 'ready'
      },
      {
        id: '622af678e7507c5119b13324',
        createAt: '2022-03-11T07:12:56.000+00:00',
        lastUpdAt: '2022-03-12T04:56:37.966+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'test_Sybase_183',
        connection_type: 'source_and_target',
        database_type: 'sybase ase',
        status: 'ready'
      },
      {
        id: '622af9d8e7507c5119b137d2',
        createAt: '2022-03-11T07:27:20.000+00:00',
        lastUpdAt: '2022-03-11T08:47:37.804+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'RabbitMQ_source_and_target',
        connection_type: 'source_and_target',
        database_type: 'mq',
        status: 'invalid'
      },
      {
        id: '622b0972e7507c5119b1c326',
        createAt: '2022-03-11T08:33:54.000+00:00',
        lastUpdAt: '2022-03-11T08:43:55.429+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'RocketMQ_source_and_target',
        connection_type: 'source_and_target',
        database_type: 'mq',
        status: 'ready'
      },
      {
        id: '622b1528e7507c5119b27ed7',
        createAt: '2022-03-11T09:23:52.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'test_ADB PostgreSQL',
        connection_type: 'source_and_target',
        database_type: 'adb_postgres',
        status: 'invalid'
      },
      {
        id: '622b2c2ae7507c5119b51634',
        createAt: '2022-03-11T11:02:02.000+00:00',
        lastUpdAt: '2022-03-18T06:44:01.375+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'auto_mongo_target',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '622b4013ed64913b9c50bc94',
        createAt: '2022-03-11T12:26:59.000+00:00',
        lastUpdAt: '2022-03-31T15:07:41.432+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_oracle',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '622c56f22565ef5315f4abbf',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-12T08:16:50.000+00:00',
        lastUpdAt: '2022-03-31T11:47:05.497+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_mongo1',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'invalid'
      },
      {
        id: '622c575b2565ef5315f4b214',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-12T08:18:35.000+00:00',
        lastUpdAt: '2022-04-01T12:09:59.482+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_pg',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '622f69d3d26a3d55c472a8f3',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-14T16:14:11.000+00:00',
        lastUpdAt: '2022-03-31T11:48:27.065+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_mysql_test',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '62303a9e8b7e4f3bbcee5aad',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-15T07:05:02.000+00:00',
        lastUpdAt: '2022-03-22T03:11:53.920+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'daivd_mongo',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '62187cf145873f53272955ec',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-02-25T14:53:37.000+00:00',
        lastUpdAt: '2022-03-17T12:06:57.939+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        createUser: 'admin@admin.com',
        name: 'DexterMongoTarget',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '61b88b0d089de279de34221e',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-16T17:17:24.000+00:00',
        lastUpdAt: '2022-03-25T09:04:50.165+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        createUser: 'admin@admin.com',
        name: 'MySLQ - Source',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '6232db93244134294fdd0b57',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-17T06:56:19.000+00:00',
        lastUpdAt: '2022-03-23T10:33:19.446+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'test_redolog',
        connection_type: 'source',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '62173beddfc4c80f880b7ef9',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-02-24T16:03:57.000+00:00',
        lastUpdAt: '2022-04-01T07:03:05.144+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_mongo_sharecdc',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '6233f1e557773654d6f3f261',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-18T02:43:49.000+00:00',
        lastUpdAt: '2022-03-18T06:23:29.036+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'daivd_mongo - Copy',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '6234064757773654d6f52eff',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-18T04:10:47.000+00:00',
        lastUpdAt: '2022-03-28T10:21:34.265+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'test_redolog_126_tap11g',
        connection_type: 'source',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '6234295757773654d6f685f4',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-18T06:40:23.000+00:00',
        lastUpdAt: '2022-03-23T10:32:39.880+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'oracle-126-tap11g',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '623555dbf97dba3311e9bd71',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-19T04:02:35.000+00:00',
        lastUpdAt: '2022-03-19T04:08:57.891+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'zed_test',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '62393f92decec63c31cdd25d',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T03:16:34.000+00:00',
        lastUpdAt: '2022-03-22T03:19:22.941+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Mongo to Mongo - Source and Target',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623940dfdecec63c31ce725b',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T03:22:07.000+00:00',
        lastUpdAt: '2022-03-23T04:04:49.141+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Mongo to Mongo Source',
        connection_type: 'source',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '62394713decec63c31d0c97a',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T03:48:35.000+00:00',
        lastUpdAt: '2022-03-22T07:47:52.131+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'oracle_132',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '6239471adecec63c31d0ce59',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T03:48:42.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'auto_mongo_source',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '62394729decec63c31d0e111',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T03:48:57.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'yun_target',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '62394d8edecec63c31d276b3',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T04:16:14.000+00:00',
        lastUpdAt: '2022-04-01T06:10:11.004+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'AL-Test',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '62396f19decec63c31d35e3c',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T06:39:21.000+00:00',
        lastUpdAt: '2022-03-31T11:48:07.748+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mysql8023TZ',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '62396ff1decec63c31d37c03',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T06:42:57.000+00:00',
        lastUpdAt: '2022-03-28T10:21:34.176+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Joe',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '623972dcdecec63c31d4f46a',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T06:55:24.000+00:00',
        lastUpdAt: '2022-03-23T03:53:18.115+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'PG1016TZ',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '6239733fdecec63c31d50416',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T06:57:03.000+00:00',
        lastUpdAt: '2022-03-22T07:46:32.220+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Mongo API',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623974fcdecec63c31d56478',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T07:04:28.000+00:00',
        lastUpdAt: '2022-03-22T07:23:08.744+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'oracel_132 - Copy',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '623980cbdecec63c31d8d376',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T07:54:51.000+00:00',
        lastUpdAt: '2022-03-31T11:49:14.163+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Oracle132TZ',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '623981dbdecec63c31d92208',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T07:59:23.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'SQLSerer2019TZ',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '623983bddecec63c31d9800c',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T08:07:25.000+00:00',
        lastUpdAt: '2022-04-01T06:07:22.851+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mazhuangtest',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '6239885fdecec63c31da4619',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T08:27:11.000+00:00',
        lastUpdAt: '2022-04-01T06:07:10.719+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mazhuangtest222',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '6239cea00accdd390aa24122',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T13:26:56.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mysql-dev',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '6239cebd0accdd390aa248d2',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-22T13:27:25.000+00:00',
        lastUpdAt: '2022-03-29T09:56:37.418+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mongo-dev',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623abd0cdc0d1f2c7269f71a',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T06:24:12.000+00:00',
        lastUpdAt: '2022-03-31T11:27:28.541+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Test_jira',
        connection_type: 'source_and_target',
        database_type: 'jira',
        status: 'testing'
      },
      {
        id: '623abd75dc0d1f2c7269fafb',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T06:25:57.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'Test_MySQL PXC',
        connection_type: 'source_and_target',
        database_type: 'mysql pxc',
        status: 'invalid'
      },
      {
        id: '623ae4d3dc0d1f2c726bb3ca',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T09:13:55.000+00:00',
        lastUpdAt: '2022-03-25T09:04:04.982+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'saddddddddddd',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'invalid'
      },
      {
        id: '623afa2a3baef91001916168',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T10:44:57.000+00:00',
        lastUpdAt: '2022-03-23T12:21:45.866+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzmongobd',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623b04b63baef91001921b80',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T11:29:58.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mzOracle',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '623b04fb3baef91001922367',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T11:31:07.000+00:00',
        lastUpdAt: '2022-03-24T09:33:33.167+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_mongodb',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623b0a613baef91001928afe',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T11:54:09.000+00:00',
        lastUpdAt: '2022-03-31T03:53:56.841+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_mysql',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '623b0e993baef9100193225e',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T12:12:09.000+00:00',
        lastUpdAt: '2022-04-01T08:47:28.245+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_Sql server',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '623b10913baef91001934980',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-23T12:20:33.000+00:00',
        lastUpdAt: '2022-03-24T09:56:00.306+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_pg',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '623c0eae65a20174d54df5c1',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-24T06:24:46.000+00:00',
        lastUpdAt: '2022-03-31T11:49:34.164+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mz_P2oracle',
        connection_type: 'source_and_target',
        database_type: 'oracle',
        status: 'ready'
      },
      {
        id: '623c452765a20174d550744f',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-24T10:17:11.000+00:00',
        lastUpdAt: '2022-04-01T03:01:42.860+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'yun_source',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623c49b865a20174d550d847',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-24T10:36:40.000+00:00',
        lastUpdAt: '2022-03-28T09:43:13.944+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_HANa',
        connection_type: 'source_and_target',
        database_type: 'hana',
        status: 'ready'
      },
      {
        id: '623c5e2865a20174d552c4cb',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-24T12:03:52.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_KAFKA',
        connection_type: 'source_and_target',
        database_type: 'kafka',
        status: 'ready'
      },
      {
        id: '623d24bb65a20174d575ae7b',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-25T02:11:07.000+00:00',
        lastUpdAt: '2022-03-31T08:39:18.973+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'docker_mysql_5733',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '623d2b9365a20174d577285d',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-25T02:40:19.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_Greenplum',
        connection_type: 'source_and_target',
        database_type: 'greenplum',
        status: 'ready'
      },
      {
        id: '623d2cd865a20174d5776f35',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-25T02:45:44.000+00:00',
        lastUpdAt: '2022-03-28T10:21:33.544+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_TiDB',
        connection_type: 'source_and_target',
        database_type: 'tidb',
        status: 'ready'
      },
      {
        id: '623d54e078a81b16f4b1071c',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-25T05:36:32.000+00:00',
        lastUpdAt: '2022-03-31T11:46:08.432+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_mongo _40',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623d7dd178a81b16f4bd8806',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-25T08:31:13.000+00:00',
        lastUpdAt: '2022-04-01T09:19:31.431+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'MongoDB44_27029',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623e72000bfc2b2a1b8e827e',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-26T01:53:04.000+00:00',
        lastUpdAt: '2022-03-30T03:26:58.279+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_pg - Copy',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '623e7b670bfc2b2a1b8fc97b',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-26T02:33:11.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mysql-test-tapdata',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '623e80bb45835e0df6dd1785',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-26T02:55:55.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'sqlserver-test-tapdata',
        connection_type: 'source_and_target',
        database_type: 'sqlserver',
        status: 'ready'
      },
      {
        id: '623e820245835e0df6dd2763',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-26T03:01:22.000+00:00',
        lastUpdAt: '2022-03-29T11:14:07.881+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'pg-test-tapdata',
        connection_type: 'source_and_target',
        database_type: 'postgres',
        status: 'ready'
      },
      {
        id: '623e850145835e0df6dd4476',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-26T03:14:09.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mongo-test-tapdata',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '623ed4e0e37bb479a52c2793',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-26T08:54:56.000+00:00',
        lastUpdAt: '2022-03-28T12:15:22.447+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'mzP2_kundb',
        connection_type: 'source_and_target',
        database_type: 'kundb',
        status: 'ready'
      },
      {
        id: '623f3d2ec6edd81190b3fc69',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-26T16:19:58.000+00:00',
        lastUpdAt: '2022-03-31T11:46:40.603+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_test_mongo',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '6242aa7dd98eb841aa80b321',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-29T06:43:09.000+00:00',
        lastUpdAt: '2022-04-01T07:30:20.935+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'david_kafka',
        connection_type: 'source_and_target',
        database_type: 'kafka',
        status: 'ready'
      },
      {
        id: '6233e99b7207ec602e5dc268',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-18T10:08:27.000+00:00',
        lastUpdAt: '2022-03-29T09:37:59.585+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'local_mysql_2_src',
        connection_type: 'source',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '6242d55ed98eb841aa868027',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-29T09:46:06.000+00:00',
        lastUpdAt: '2022-03-29T11:55:17.775+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'Agg测试源',
        connection_type: 'source',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '6245646986cb197d1ee92a17',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-31T08:20:57.000+00:00',
        lastUpdAt: '2022-03-31T08:29:39.179+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        lastUpdBy: '62172cfc49b865ee5379d3ed',
        name: 'erin_test_mongodb_connection',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      },
      {
        id: '6245740386cb197d1eee766d',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-03-31T09:27:31.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'kafka_183_9093',
        connection_type: 'source_and_target',
        database_type: 'kafka',
        status: 'ready'
      },
      {
        id: '6246620a9b4de251a8913284',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-04-01T02:23:06.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'auto_dummy_source',
        connection_type: 'source',
        database_type: 'dummy db',
        status: 'ready'
      },
      {
        id: '6246d243862e9516af713f84',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-04-01T10:21:55.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mysql-by-majp',
        connection_type: 'source_and_target',
        database_type: 'mysql',
        status: 'ready'
      },
      {
        id: '6246d297862e9516af71437b',
        customId: '62172cfc49b865ee5379d3ed',
        createAt: '2022-04-01T10:23:19.000+00:00',
        userId: '62172cfc49b865ee5379d3ed',
        name: 'mongo-by-majp',
        connection_type: 'source_and_target',
        database_type: 'mongodb',
        status: 'ready'
      }
    ]
  },
  '/api/Connections/databaseType': {
    reqId: '729ca9c8-12f5-4bde-ae6d-8e38625db101',
    ts: 1648839101876,
    code: 'ok',
    data: [
      'adb_mysql',
      'adb_postgres',
      'clickhouse',
      'dameng',
      'db2',
      'dummy db',
      'elasticsearch',
      'gaussdb200',
      'gbase-8s',
      'greenplum',
      'hana',
      'hbase',
      'hive',
      'jira',
      'kafka',
      'kudu',
      'kundb',
      'mariadb',
      'mongodb',
      'mq',
      'mysql',
      'mysql pxc',
      'oracle',
      'postgres',
      'redis',
      'sqlserver',
      'sybase ase',
      'tcp_udp',
      'tidb'
    ]
  },
  '/api/Connections/:id': {
    code: 'ok',
    msg: 'ok',
    data: {
      name: '@name',
      connection_type: 'target',
      'database_type|1': ['mysql', 'oracle', 'mongodb'],
      database_host: '',
      database_username: '',
      database_port: '@integer(0, 5000)',
      database_uri: () => {
        return 'mongodb://192.168.1.191:' + Random.integer(0, 5000) + '/tapdata_test'
      },
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
      'loadFieldsStatus|1': ['loading', 'finished', 'error'],
      tableCount: Random.integer(0, 100),
      username: '@name',
      file_source_protocol: 'ftp'
    }
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
  '/api/nodeConfigs': { data: [], code: 'ok', msg: 'ok' },
  '/api/Logs': { data: [], code: 'ok', msg: 'ok' },
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
        'result|1': ['failed', 'passed'],
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
    data: {
      'items|1-10': [
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
          user_id: '6072c1cbbf43e90010570f3c',
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
          },
          'fields|10-30': [
            {
              autoincrement: false,
              columnSize: 0,
              dataType: 7,
              data_type: 'OBJECT_ID',
              field_name: '@name',
              id: '@id',
              is_nullable: true,
              javaType: 'String',
              key: 'PRI',
              original_field_name: '@name',
              precision: 0,
              primary_key_position: 1,
              scale: 0,
              table_name: '@name'
            }
          ]
        }
      ]
    }
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
  '/api/MetadataInstances/tables': {
    code: 'ok',
    msg: 'ok',
    'data|10000-20000': ['@id']
  },
  '/api/MetadataInstances/schema': {},
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
  '/api/ScheduleTasks': {
    'data|10': [
      {
        id: '@id',
        task_type: 'CLEAR_PG_SLOT',
        period: 3600000,
        status: 'scheduling',
        task_name: '@name',
        task_profile: 'DEFAULT',
        agent_id: 'daaf405f-3d4c-4584-8087-bdc014966376',
        last_updated: '2021-06-21T07:33:59.956Z',
        ping_time: 1624260839953
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/ScheduleTasks/count': { data: { count: 6 }, code: 'ok', msg: 'ok' },
  '/api/DataFlowInsights/runtimeMonitor': ({ req }) => {
    let data = {
      throughput: {
        data: [
          {
            statsType: 'throughput',
            createTime: 1620633775336,
            dataFlowId: '@id',
            granularity: 'flow_minute',
            statsData: [
              {
                t: '2021-04-28 18:50:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:51:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:52:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:53:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:54:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:55:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:56:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:57:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:58:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 18:59:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 19:00:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 19:01:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 19:02:00',
                inputSize: 0,
                outputSize: 0,
                inputCount: 0,
                outputCount: 0
              },
              {
                t: '2021-04-28 19:03:00',
                inputSize: 39375,
                outputSize: 39375,
                inputCount: 15570,
                outputCount: 15570
              },
              {
                t: '2021-04-28 19:04:00',
                inputSize: 18750,
                outputSize: 18750,
                inputCount: 6001,
                outputCount: 6001
              },
              {
                t: '2021-04-28 19:05:00',
                inputSize: 17344,
                outputSize: 17344,
                inputCount: 6437,
                outputCount: 6437
              },
              {
                t: '2021-04-28 19:06:00',
                inputSize: 15469,
                outputSize: 15469,
                inputCount: 5619,
                outputCount: 5619
              },
              {
                t: '2021-04-28 19:07:00',
                inputSize: 16407,
                outputSize: 16407,
                inputCount: 5989,
                outputCount: 5989
              },
              {
                t: '2021-04-28 19:08:00',
                inputSize: 12657,
                outputSize: 12657,
                inputCount: 4575,
                outputCount: 4575
              },
              {
                t: '2021-04-28 19:09:00',
                inputSize: 12657,
                outputSize: 12657,
                inputCount: 5773,
                outputCount: 5773
              }
            ]
          }
        ],
        code: 'ok',
        msg: 'ok'
      },
      trans_time: {
        data: [
          {
            statsType: 'trans_time',
            createTime: 1620633775585,
            dataFlowId: '608940e76ea5330010a5e00e',
            granularity: 'flow_minute',
            statsData: [
              { t: '2021-04-28 18:50:00', d: 0 },
              { t: '2021-04-28 18:51:00', d: 0 },
              { t: '2021-04-28 18:52:00', d: 0 },
              { t: '2021-04-28 18:53:00', d: 0 },
              { t: '2021-04-28 18:54:00', d: 0 },
              { t: '2021-04-28 18:55:00', d: 0 },
              { t: '2021-04-28 18:56:00', d: 0 },
              { t: '2021-04-28 18:57:00', d: 0 },
              { t: '2021-04-28 18:58:00', d: 0 },
              { t: '2021-04-28 18:59:00', d: 0 },
              { t: '2021-04-28 19:00:00', d: 0 },
              { t: '2021-04-28 19:01:00', d: 0 },
              { t: '2021-04-28 19:02:00', d: 0 },
              { t: '2021-04-28 19:03:00', d: '0.56' },
              { t: '2021-04-28 19:04:00', d: '1.43' },
              { t: '2021-04-28 19:05:00', d: '1.12' },
              { t: '2021-04-28 19:06:00', d: '1.38' },
              { t: '2021-04-28 19:07:00', d: '1.44' },
              { t: '2021-04-28 19:08:00', d: '1.57' },
              { t: '2021-04-28 19:09:00', d: '1.35' }
            ]
          }
        ],
        code: 'ok',
        msg: 'ok'
      },
      repl_lag: {
        data: [
          {
            statsType: 'repl_lag',
            createTime: 1620633775588,
            dataFlowId: '608940e76ea5330010a5e00e',
            granularity: 'flow_minute',
            statsData: [
              { t: '2021-04-28 18:50:00', d: 0 },
              { t: '2021-04-28 18:51:00', d: 0 },
              { t: '2021-04-28 18:52:00', d: 0 },
              { t: '2021-04-28 18:53:00', d: 0 },
              { t: '2021-04-28 18:54:00', d: 0 },
              { t: '2021-04-28 18:55:00', d: 0 },
              { t: '2021-04-28 18:56:00', d: 0 },
              { t: '2021-04-28 18:57:00', d: 0 },
              { t: '2021-04-28 18:58:00', d: 0 },
              { t: '2021-04-28 18:59:00', d: 0 },
              { t: '2021-04-28 19:00:00', d: 0 },
              { t: '2021-04-28 19:01:00', d: 0 },
              { t: '2021-04-28 19:02:00', d: 0 },
              { t: '2021-04-28 19:03:00', d: 0 },
              { t: '2021-04-28 19:04:00', d: 0 },
              { t: '2021-04-28 19:05:00', d: 0 },
              { t: '2021-04-28 19:06:00', d: 0 },
              { t: '2021-04-28 19:07:00', d: 0 },
              { t: '2021-04-28 19:08:00', d: 0 },
              { t: '2021-04-28 19:09:00', d: 0 }
            ]
          }
        ],
        code: 'ok',
        msg: 'ok'
      },
      data_overview: {
        data: [
          {
            statsType: 'data_overview',
            createTime: 1620633775572,
            dataFlowId: '608940e76ea5330010a5e00e',
            granularity: 'flow',
            statsData: {
              t: '2021-04-28 19:10:39',
              inputSize: 155625,
              outputSize: 155625,
              inputCount: 3320000,
              outputCount: 3320000
            }
          }
        ],
        code: 'ok',
        msg: 'ok'
      }
    }
    return data[req.query?.statsType]
  },
  '/api/UserLogs': {
    code: 'ok',
    msg: 'ok',
    'data|10-100': [
      {
        createTime: '2021-06-18T07:25:46.688Z',
        id: '@guid',
        last_updated: '2021-06-18T07:25:46.688Z',
        'modular|1': ['connection', 'sync'],
        'operation|1': ['create', 'update', 'copy', 'delete', 'start', 'reset', 'stop', 'forceStop'],
        parameter1: '@name',
        parameter2: '',
        parameter3: '',
        rename: Boolean,
        oldName: '@name', //原名称
        type: 'userOperation',
        user_id: '60cc0c5887e32100106b6a17',
        username: '@name'
      }
    ]
  },
  '/api/Javascript_functions': {
    data: [
      {
        function_name: 'processTcp',
        parameters: 'host,port,timeout,mongoString',
        function_body: '{\n}',
        user_id: '61306d94725cec27ed3401e3',
        id: '6154119f0e5b5800dbcb2989',
        last_updated: '2021-11-02T02:59:09.129Z',
        createTime: '2021-09-29T07:11:27.158Z'
      },
      {
        function_name: 'majp',
        parameters: '',
        function_body: "{\n    var xx = 'xxxxxx';\n    return [{ a: 1 }];\n}",
        user_id: '61306d94725cec27ed3401e3',
        id: '6153e9940e5b5800dbcada25',
        last_updated: '2021-09-29T04:26:00.518Z',
        createTime: '2021-09-29T04:20:36.852Z'
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/Javascript_functions/count': { data: { count: 232 }, code: 'ok', msg: 'ok' },
  '/api/License/count': { data: { count: 232 }, code: 'ok', msg: 'ok' },
  '/api/License': {
    code: 'ok',
    msg: 'ok',
    'data|1-10': [
      {
        id: '@id',
        sid: '@id',
        license: '@name',
        createTime: '@now',
        last_updated: '@now',
        'expirationDate|+1': ['2021-10-10T00:00:00.000Z', '2021-12-10T00:00:00.000Z', '2022-01-10T00:00:00.000Z']
      }
    ]
  },
  '/api/License/sid': {
    code: 'ok',
    msg: 'ok',
    data: {
      sid: '@id'
    }
  },
  '/api/License/upload': {
    code: 'ok',
    msg: 'ok',
    data: 'ok'
  },
  '/api/Licenses/expires': {
    reqId: 'b8b050b0-9ef4-431b-81a0-f20dad252ddf',
    ts: 1645620145617,
    code: 'ok',
    data: { msg: 'No license', expires_on: 1646762402588, status: 'none' }
  },
  '/api/Messages/count': { reqId: 'aea4e226-fc68-4915-8c24-90104d8078f1', ts: 1645620145447, code: 'ok', data: 5170 }
})
