const Mock = require('mockjs')
const settings = require('./settings.json')
const permission = require('./permission.json')
const Random = Mock.Random
const dataflow = require('./dataflow.js')

module.exports = Object.assign({}, dataflow, {
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
  }
})
