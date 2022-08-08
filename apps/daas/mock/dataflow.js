const Mock = require('mockjs')
const Random = Mock.Random

module.exports = {
  '/api/DataFlows/overview': {
    data: {
      stats: {
        overview: {
          sourceName: '@name',
          sourceType: '@name',
          targetName: '@name',
          targatType: '@name',
          sourceTableNum: Random.integer(0, 100),
          sourceRowNum: Random.integer(0, 100),
          targetTableNum: Random.integer(0, 100),
          targatRowNum: Random.integer(0, 100),
          spendTime: Random.integer(0, 100),
          waitingForSyecTableNums: Random.integer(0, 100)
        }
      }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/insight': {
    data: {
      dataFlowId: '',
      statsType: 'dataFlowDetailsStats',
      createTime: new Date(),
      last_updated: new Date(),
      statsData: {
        sourceConnectionId: '@guid',
        sourceConnectionName: '@name',
        targetConnectionId: '@guid',
        targetConnectionName: '@name',
        sourceTableName: '@name',
        sourceRowNum: Random.integer(0, 100),
        targetTableName: '',
        targetRowNum: Random.integer(0, 100),
        status: '', //done running waiting,
        cdcRowNum: Random.integer(0, 100),
        lag: Random.integer(0, 100)
      }
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
    data: {
      'items|0-30': [
        {
          createTime: '2021-04-28T11:10:57.691Z',
          last_updated: '2021-04-28T13:03:49.326Z',
          id: '@id',
          name: '@name',
          'status|1': ['running', 'paused', 'error', 'draft', 'scheduled', 'stopping', 'force stopping'],
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
      ]
    },

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
      createTime: '2021-12-03T11:02:51.418Z',
      last_updated: '2021-12-03T11:02:51.742Z',
      id: '61a9f9377acc3b00c4bfbce5',
      category: '数据库克隆',
      checked: false,
      description: '',
      emailWaring: { edited: true, started: false, error: true, paused: false },
      executeMode: 'normal',
      mappingTemplate: 'custom',
      name: 'KKKKKK',
      operationTime: '2021-12-03T11:02:51.740Z',
      setting: {
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
        emailWaring: { edited: false, started: false, error: true, paused: true },
        readShareLogMode: 'STREAMING',
        stopOnError: true,
        syncPoints: [{ connectionId: '', type: 'current', time: '', date: '', name: '', timezone: '+08:00' }],
        processorConcurrency: 1,
        transformerConcurrency: 8,
        lagTimeFalg: false,
        userSetLagTime: 0,
        noPrimaryKey: false
      },
      stages: [
        {
          id: '080d125f-204c-4fba-93af-f208addaf582',
          inputLanes: [],
          outputLanes: ['2fef2923-ccd6-4d13-b217-3f17e7423f7e'],
          connectionId: '61a87d201308ba00533c0d5e',
          type: 'kudu',
          databaseType: 'kudu',
          tableName: 'CAR_CLAIM_07192055',
          field_process: [],
          isFirst: true,
          stageId: '080d125f-204c-4fba-93af-f208addaf582',
          showBtn: true,
          hiddenFieldProcess: true,
          hiddenChangeValue: true,
          name: 'CAR_CLAIM_07192055',
          dataQualityTag: false,
          joinTables: []
        },
        {
          id: '2fef2923-ccd6-4d13-b217-3f17e7423f7e',
          inputLanes: ['080d125f-204c-4fba-93af-f208addaf582'],
          outputLanes: [],
          tableId: '61a8bb70ea105d13a799eb09',
          connectionId: '61a730f9dfdda0258c9b0386',
          databaseType: 'postgres',
          tableName: 'A',
          sql: '',
          isFilter: false,
          stageId: '2fef2923-ccd6-4d13-b217-3f17e7423f7e',
          showBtn: true,
          hiddenFieldProcess: true,
          isFirst: true,
          hiddenChangeValue: true,
          custFields: [],
          custSql: {
            filterType: 'field',
            selectedFields: [],
            fieldFilterType: 'keepAllFields',
            limitLines: '',
            cSql: '',
            editSql: '',
            conditions: []
          },
          initialOffset: '',
          type: 'table',
          initialSyncOrder: 0,
          enableInitialOrder: false,
          cSql: '',
          name: 'A',
          dataQualityTag: false,
          joinTables: [
            {
              tableName: 'CAR_CLAIM_07192055',
              joinType: 'upsert',
              joinPath: '',
              manyOneUpsert: false,
              joinKeys: [{ source: 'CLAIM_ID', target: 'CLAIM_ID' }],
              stageId: '080d125f-204c-4fba-93af-f208addaf582',
              isArray: false,
              arrayUniqueKey: '',
              connectionId: '61a87d201308ba00533c0d5e',
              databaseType: 'kudu'
            }
          ],
          dropTable: false
        }
      ],
      status: 'draft',
      stopOnError: false,
      user_id: '61a4498c58db41e0d671691d',
      errorEvents: [],
      stats: { throughput: { t: '2021-12-03 11:02:00', inputSize: 0, outputSize: 0, inputCount: 0, outputCount: 0 } },
      user: { email: 'admin@admin.com' }
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
  '/api/CustomerJobLogs': {
    reqId: 'f45ba408-0249-432c-94d5-f587e0115d21',
    ts: 1658138223581,
    code: 'ok',
    data: {
      total: 100,
      'items|1-20': [
        {
          id: '@id',
          'level|1': ['INFO', 'WARN', 'ERROR', 'FATAL'],
          timestamp: 1658112574487,
          date: '@date',
          dataFlowId: '@cuid',
          params: {
            dataFlowName: '@name',
            dataFlowId: '62b17f9c6f8b70210f28683f',
            dataFlowType: '@name',
            errorCode: 'TM_NO_AVAILABLE_AGENT',
            errorMessage: 'TM_NO_AVAILABLE_AGENT',
            level: '致命错误'
          },
          template: '{dataFlowType}{dataFlowName}没有可用的Agent'
        }
      ]
    }
  }
}
