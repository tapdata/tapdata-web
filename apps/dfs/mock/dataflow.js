const Mock = require('mockjs')
const Random = Mock.Random
const moment = require('moment')

module.exports = {
  '/tm/api/DataFlows/chart': {
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
      },
      chart8: { total: 0, invalid: 0, ready: 0 },
      chart9: { total: 0, 'initial_sync+cdc': 0, initial_sync: 0, cdc: 0 }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/DataFlows/findOne': {
    data: {
      id: '60dc5941fdbc9e1764636842',
      name: 'test js ',
      mappingTemplate: 'custom',
      stages: [
        {
          id: '76a33ab1-cb0f-42ac-9240-41bb1f421ff0',
          inputLanes: [],
          outputLanes: ['c44fdef0-a4c7-4f75-964a-8e920b044420'],
          connectionId: '60cda022f0e73a0067428c38',
          databaseType: 'mysql',
          tableName: 'CLAIM',
          sql: '',
          dropTable: false,
          type: 'table',
          isFilter: false,
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
          initialSyncOrder: 0,
          enableInitialOrder: false,
          tableId: '60cda023f0e73a0067428c4b',
          name: 'CLAIM',
          dataQualityTag: false,
          joinTables: [],
          statsStatus: 'cdc'
        },
        {
          id: '9a74cec4-db3e-488f-bd17-ff844f846f50',
          inputLanes: ['c44fdef0-a4c7-4f75-964a-8e920b044420'],
          outputLanes: [],
          connectionId: '60cda022f0e73a0067428c38',
          databaseType: 'mysql',
          tableName: 'CLAIM_C1',
          sql: '',
          dropTable: true,
          type: 'table',
          isFilter: false,
          custFields: [],
          custSql: {
            filterType: 'field',
            selectedFields: [],
            fieldFilterType: 'keepAllFields',
            limitLines: '',
            cSql: '',
            editSql: '',
            conditions: [],
            custFields: [
              'CLAIM_ID',
              'POLICY_ID',
              'CLAIM_DATE',
              'SETTLED_DATE',
              'CLAIM_TYPE',
              'CLAIM_AMOUNT',
              'SETTLED_AMOUNT',
              'CLAIM_REASON',
              'LAST_CHANGE',
              'P2'
            ]
          },
          initialOffset: '',
          initialSyncOrder: 0,
          enableInitialOrder: false,
          tableId: '60dc35702340b60e00088d0d',
          cSql: '',
          name: 'CLAIM_C1',
          dataQualityTag: false,
          joinTables: [
            {
              tableName: 'CLAIM',
              joinType: 'upsert',
              joinPath: '',
              manyOneUpsert: false,
              joinKeys: [{ source: 'CLAIM_ID', target: 'CLAIM_ID' }],
              stageId: '76a33ab1-cb0f-42ac-9240-41bb1f421ff0',
              isArray: false,
              arrayUniqueKey: ''
            }
          ],
          statsStatus: null
        },
        {
          id: 'c44fdef0-a4c7-4f75-964a-8e920b044420',
          inputLanes: ['76a33ab1-cb0f-42ac-9240-41bb1f421ff0'],
          outputLanes: ['9a74cec4-db3e-488f-bd17-ff844f846f50'],
          name: 'JavaScript',
          type: 'js_processor',
          script:
            "function process(record){\n\n\tif (record.CLAIM_ID == 'CL_000000000'){record.CLAIM_ID=null};\n    if (record.CLAIM_ID == 'CL_000000002'){record.CLAIM_ID=null};\n\treturn record; }",
          statsStatus: null
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/DataFlows/count': { data: { count: 41 }, code: 'ok', msg: 'ok' },
  '/tm/api/DataFlows/:id/reset': {
    code: 'ok',
    msg: 'ok',
    data: {}
  },
  '/tm/api/DataFlows': {
    code: 'ok',
    msg: 'ok',
    data: {
      size: 20,
      total: '@integer(0, 100)',
      totalPage: 1,
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
            'sync_type|1': ['initial_sync+cdc', 'initial_sync', 'cdc'],
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
    }
  },
  '/tm/api/DataFlows/update': {
    data: {
      success: [{ id: '@id', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/DataFlows/resetAll': {
    data: {
      success: [{ id: '6098e7a2c66ab70010981c53', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/DataFlows/metadata': {
    data: [
      {
        invalid: false,
        sourceQualifiedName: 'T_mysql_source_CAR_CLAIM_6130a1f21b3c6200548d5c45',
        sourceDbName: 'auto_mysql',
        sourceObjectName: 'CAR_CLAIM',
        sourceFieldCount: 8,
        sourceTableId: '6130a1f31b3c6200548d5c70',
        sinkQulifiedName: 'T_mysql_source_CAR_CLAIM_6130a1f21b3c6200548d5c45',
        sinkDbName: 'auto_mysql',
        sinkObjectName: 'CAR_CLAIM',
        sinkDbType: 'mysql',
        sinkStageId: 'd832dec3-a42c-4c39-ac7a-86fff95bebb7',
        userDeletedNum: 0,
        sinkTableId: '6130a1f31b3c6200548d5c70'
      },
      {
        invalid: false,
        sinkDbName: 'auto_mysql',
        sinkDbType: 'mysql',
        sinkObjectName: 'CAR_POLICY',
        sinkQulifiedName: 'T_mysql_source_CAR_POLICY_6130a1f21b3c6200548d5c45',
        sinkStageId: 'd832dec3-a42c-4c39-ac7a-86fff95bebb7',
        sinkTableId: '6130a1f31b3c6200548d5c69',
        sourceDbName: 'auto_mysql',
        sourceFieldCount: 7,
        sourceObjectName: 'CAR_POLICY',
        sourceQualifiedName: 'T_mysql_source_CAR_POLICY_6130a1f21b3c6200548d5c45',
        sourceTableId: '6130a1f31b3c6200548d5c69',
        userDeletedNum: 0
      },
      {
        invalid: false,
        sinkDbName: 'auto_mysql',
        sinkDbType: 'mysql',
        sinkObjectName: 'CAR_POLICY',
        sinkQulifiedName: 'T_mysql_source_CAR_POLICY_6130a1f21b3c6200548d5c45w',
        sinkStageId: 'd832dec3-a42c-4c39-ac7a-86fff95bebb7',
        sinkTableId: '6130a1f31b3c6200548d5c69',
        sourceDbName: 'auto_mysql',
        sourceFieldCount: 7,
        sourceObjectName: 'CAR_POLICY',
        sourceQualifiedName: 'T_mysql_source_CAR_POLICY_6130a1f21b3c6200548d5c45w',
        sourceTableId: '6130a1f31b3c6200548d5c69',
        userDeletedNum: 0
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/MetadataInstances/originalData': {
    data: [
      {
        meta_type: 'table',
        comment: 'kujliuctc叫基金哦isd',
        name: 'CAR_CLAIM',
        qualified_name: 'T_mysql_source_CAR_CLAIM_6130a1f21b3c6200548d5c45',
        last_updated: '2021-09-17T06:32:49.948Z',
        is_deleted: false,
        id: '6130a1f31b3c6200548d5c70',
        original_name: 'CAR_CLAIM',
        source: {
          name: 'auto_mysql',
          connection_type: 'source_and_target',
          database_type: 'mysql',
          database_host: '47.115.163.10',
          database_username: 'root',
          database_port: 3306,
          database_name: 'source',
          database_password: 'f93b5e4141d32918fc09e20ef3a0fb4d',
          retry: 0,
          submit: true,
          supportUpdatePk: false,
          isUrl: false,
          ssl: false,
          schemaAutoUpdate: false,
          multiTenant: false,
          sslValidate: false,
          increamentalTps: 100,
          initialReadSize: 100000,
          status: 'ready',
          transformed: true,
          user_id: '61306d94725cec27ed3401e3',
          last_updated: '2021-09-10T09:19:19.632Z',
          createTime: '2021-09-02T10:05:38.665Z',
          testTime: 1631240728894,
          loadFieldsStatus: 'loading',
          loadCount: 0,
          loadSchemaField: true,
          schemaVersion: 'ba4eea34-6632-4cb7-928d-534811d6907a',
          tableCount: 12,
          everLoadSchema: true,
          id: '6130a1f21b3c6200548d5c45',
          _id: '6130a1f21b3c6200548d5c45'
        },
        dev_version: 1,
        last_user_id: '61306d94725cec27ed3401e3',
        last_user_name: 'admin@admin.com',
        relation: [],
        fields: [
          {
            field_name: 'CLAIM_ID',
            data_type: 'VARCHAR',
            data_code: 12,
            java_type: 'String',
            primary_key_position: 1,
            foreign_key_position: 0,
            is_nullable: false,
            parent: null,
            precision: 12,
            scale: null,
            oriPrecision: 12,
            oriScale: null,
            default_value: null,
            unique: true,
            columnSize: 12,
            autoincrement: 'NO',
            key: 'PRI',
            original_field_name: 'CLAIM_ID',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5ce5',
            tapType: 'String'
          },
          {
            field_name: 'POLICY_ID',
            data_type: 'VARCHAR',
            data_code: 12,
            java_type: 'String',
            primary_key_position: 0,
            foreign_key_position: 0,
            is_nullable: true,
            parent: null,
            precision: 12,
            scale: null,
            oriPrecision: 12,
            oriScale: null,
            default_value: null,
            columnSize: 12,
            autoincrement: 'NO',
            original_field_name: 'POLICY_ID',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5ce6',
            tapType: 'String'
          },
          {
            field_name: 'CLAIM_DATE',
            data_type: 'DATETIME',
            data_code: 93,
            java_type: 'Date',
            primary_key_position: 0,
            foreign_key_position: 0,
            is_nullable: true,
            parent: null,
            precision: 0,
            scale: null,
            oriPrecision: 0,
            oriScale: null,
            default_value: null,
            columnSize: 19,
            autoincrement: 'NO',
            original_field_name: 'CLAIM_DATE',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5ce7',
            tapType: 'Datetime'
          },
          {
            field_name: 'SETTLED_DATE',
            data_type: 'DATETIME',
            data_code: 93,
            java_type: 'Date',
            primary_key_position: 0,
            foreign_key_position: 0,
            is_nullable: true,
            parent: null,
            precision: 0,
            scale: null,
            oriPrecision: 0,
            oriScale: null,
            default_value: null,
            columnSize: 19,
            autoincrement: 'NO',
            original_field_name: 'SETTLED_DATE',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5ce8',
            tapType: 'Datetime'
          },
          {
            field_name: 'CLAIM_AMOUNT',
            data_type: 'DECIMAL',
            data_code: 3,
            java_type: 'BigDecimal',
            primary_key_position: 0,
            foreign_key_position: 0,
            is_nullable: true,
            parent: null,
            precision: 30,
            scale: 2,
            oriPrecision: 30,
            oriScale: 2,
            default_value: null,
            columnSize: 30,
            autoincrement: 'NO',
            original_field_name: 'CLAIM_AMOUNT',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5ce9',
            tapType: 'Number'
          },
          {
            field_name: 'SETTLED_AMOUNT',
            data_type: 'DECIMAL',
            data_code: 3,
            java_type: 'BigDecimal',
            primary_key_position: 0,
            foreign_key_position: 0,
            is_nullable: true,
            parent: null,
            precision: 30,
            scale: 2,
            oriPrecision: 30,
            oriScale: 2,
            default_value: null,
            columnSize: 30,
            autoincrement: 'NO',
            original_field_name: 'SETTLED_AMOUNT',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5cea',
            tapType: 'Number'
          },
          {
            field_name: 'CLAIM_REASON',
            data_type: 'VARCHAR',
            data_code: 12,
            java_type: 'String',
            primary_key_position: 0,
            foreign_key_position: 0,
            is_nullable: true,
            parent: null,
            precision: 30,
            scale: null,
            oriPrecision: 30,
            oriScale: null,
            default_value: null,
            columnSize: 30,
            autoincrement: 'NO',
            original_field_name: 'CLAIM_REASON',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5ceb',
            tapType: 'String'
          },
          {
            field_name: 'LAST_CHANGE',
            data_type: 'DATETIME',
            data_code: 93,
            java_type: 'Date',
            primary_key_position: 0,
            foreign_key_position: 0,
            is_nullable: true,
            parent: null,
            precision: 0,
            scale: null,
            oriPrecision: 0,
            oriScale: null,
            default_value: null,
            columnSize: 19,
            autoincrement: 'NO',
            original_field_name: 'LAST_CHANGE',
            is_auto_allowed: true,
            source: 'auto',
            is_deleted: false,
            id: '6130a1f51b3c6200548d5cec',
            tapType: 'Datetime'
          }
        ],
        indices: [],
        schemaVersion: '9355c4f6-246f-4fc4-87e1-1f6ff6e0ea82',
        partitionSet: null,
        databaseId: '6130a1f21b3c6200548d5c4f',
        createTime: '2021-09-02T10:05:39.924Z',
        version: 2,
        create_source: 'auto',
        histories: [
          {
            meta_type: 'table',
            qualified_name: 'T_mysql_source_CAR_CLAIM_6130a1f21b3c6200548d5c45',
            is_deleted: false,
            original_name: 'CAR_CLAIM',
            source: {
              name: 'auto_mysql',
              connection_type: 'source_and_target',
              database_type: 'mysql',
              database_host: '47.115.163.10',
              database_username: 'root',
              database_port: 3306,
              database_name: 'source',
              database_password: 'f93b5e4141d32918fc09e20ef3a0fb4d',
              retry: 0,
              submit: true,
              supportUpdatePk: false,
              isUrl: false,
              ssl: false,
              schemaAutoUpdate: false,
              multiTenant: false,
              sslValidate: false,
              increamentalTps: 100,
              initialReadSize: 100000,
              status: 'ready',
              transformed: true,
              user_id: '61306d94725cec27ed3401e3',
              last_updated: '2021-09-10T02:25:28.897Z',
              createTime: '2021-09-02T10:05:38.665Z',
              testTime: 1631240728894,
              loadFieldsStatus: 'loading',
              loadCount: 0,
              loadSchemaField: false,
              schemaVersion: '794382b6-1dd8-4bca-a3c3-de9dd718ac65',
              tableCount: 10,
              everLoadSchema: true,
              loadFieldErrMsg:
                'java.lang.RuntimeException: Load schema fields error, connection name: auto_mysql, message: Communications link failure\n\nThe last packet sent successfully to the server was 0 milliseconds ago. The driver has not received any packets from the server.\n  io.tapdata.Runnable.LoadSchemaRunner.run(LoadSchemaRunner.java:121)\nio.tapdata.websocket.handler.TestConnectionHandler.lambda$handle$3(TestConnectionHandler.java:288)\njava.lang.Thread.run(Thread.java:748)\n',
              id: '6130a1f21b3c6200548d5c45',
              _id: '6130a1f21b3c6200548d5c45'
            },
            dev_version: 1,
            last_user_id: '61306d94725cec27ed3401e3',
            last_user_name: 'admin@admin.com',
            relation: [],
            fields: [
              {
                field_name: 'CLAIM_ID',
                data_type: 'VARCHAR',
                data_code: 12,
                java_type: 'String',
                primary_key_position: 1,
                foreign_key_position: 0,
                is_nullable: false,
                parent: null,
                precision: 12,
                scale: null,
                oriPrecision: 12,
                oriScale: null,
                default_value: null,
                unique: true,
                columnSize: 12,
                autoincrement: 'NO',
                key: 'PRI',
                original_field_name: 'CLAIM_ID',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5ce5'
              },
              {
                field_name: 'POLICY_ID',
                data_type: 'VARCHAR',
                data_code: 12,
                java_type: 'String',
                primary_key_position: 0,
                foreign_key_position: 0,
                is_nullable: true,
                parent: null,
                precision: 12,
                scale: null,
                oriPrecision: 12,
                oriScale: null,
                default_value: null,
                columnSize: 12,
                autoincrement: 'NO',
                original_field_name: 'POLICY_ID',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5ce6'
              },
              {
                field_name: 'CLAIM_DATE',
                data_type: 'DATETIME',
                data_code: 93,
                java_type: 'Date',
                primary_key_position: 0,
                foreign_key_position: 0,
                is_nullable: true,
                parent: null,
                precision: 0,
                scale: null,
                oriPrecision: 0,
                oriScale: null,
                default_value: null,
                columnSize: 19,
                autoincrement: 'NO',
                original_field_name: 'CLAIM_DATE',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5ce7'
              },
              {
                field_name: 'SETTLED_DATE',
                data_type: 'DATETIME',
                data_code: 93,
                java_type: 'Date',
                primary_key_position: 0,
                foreign_key_position: 0,
                is_nullable: true,
                parent: null,
                precision: 0,
                scale: null,
                oriPrecision: 0,
                oriScale: null,
                default_value: null,
                columnSize: 19,
                autoincrement: 'NO',
                original_field_name: 'SETTLED_DATE',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5ce8'
              },
              {
                field_name: 'CLAIM_AMOUNT',
                data_type: 'DECIMAL',
                data_code: 3,
                java_type: 'BigDecimal',
                primary_key_position: 0,
                foreign_key_position: 0,
                is_nullable: true,
                parent: null,
                precision: 30,
                scale: 2,
                oriPrecision: 30,
                oriScale: 2,
                default_value: null,
                columnSize: 30,
                autoincrement: 'NO',
                original_field_name: 'CLAIM_AMOUNT',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5ce9'
              },
              {
                field_name: 'SETTLED_AMOUNT',
                data_type: 'DECIMAL',
                data_code: 3,
                java_type: 'BigDecimal',
                primary_key_position: 0,
                foreign_key_position: 0,
                is_nullable: true,
                parent: null,
                precision: 30,
                scale: 2,
                oriPrecision: 30,
                oriScale: 2,
                default_value: null,
                columnSize: 30,
                autoincrement: 'NO',
                original_field_name: 'SETTLED_AMOUNT',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5cea'
              },
              {
                field_name: 'CLAIM_REASON',
                data_type: 'VARCHAR',
                data_code: 12,
                java_type: 'String',
                primary_key_position: 0,
                foreign_key_position: 0,
                is_nullable: true,
                parent: null,
                precision: 30,
                scale: null,
                oriPrecision: 30,
                oriScale: null,
                default_value: null,
                columnSize: 30,
                autoincrement: 'NO',
                original_field_name: 'CLAIM_REASON',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5ceb'
              },
              {
                field_name: 'LAST_CHANGE',
                data_type: 'DATETIME',
                data_code: 93,
                java_type: 'Date',
                primary_key_position: 0,
                foreign_key_position: 0,
                is_nullable: true,
                parent: null,
                precision: 0,
                scale: null,
                oriPrecision: 0,
                oriScale: null,
                default_value: null,
                columnSize: 19,
                autoincrement: 'NO',
                original_field_name: 'LAST_CHANGE',
                is_auto_allowed: true,
                source: 'auto',
                is_deleted: true,
                id: '6130a1f51b3c6200548d5cec'
              }
            ],
            indices: [],
            schemaVersion: '1529f73c-6c85-4944-89e2-ea927e5fd447',
            partitionSet: null,
            databaseId: '6130a1f21b3c6200548d5c4f',
            last_updated: '2021-09-10T02:27:04.705Z',
            createTime: '2021-09-02T10:05:39.924Z',
            __properties: {
              name: 'CAR_CLAIM',
              comment: ''
            },
            comment: '',
            name: 'CAR_CLAIM',
            __initVersion: 10804,
            version: 1,
            create_source: 'auto',
            version_user_id: '61306d94725cec27ed3401e3',
            version_user_name: 'admin@admin.com',
            version_description: 'Add.new.field'
          }
        ]
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/DataFlows/:id': {
    data: {
      isFinished: true,
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
  '/tm/api/TypeMappings/dataType': {
    data: [{ dbType: 'mysql', rules: [] }],
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/DataFlows/:id/copy': {
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
        fieldNameTransform: '',
        tableNameTransform: '',
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
  '/tm/api/DataFlows/removeAll': {
    data: {
      success: [{ id: '6098e7a2c66ab70010981c53', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/UserLogs': {
    code: 'ok',
    msg: 'ok',
    data: {
      size: 20,
      total: '@integer(0, 100)',
      totalPage: 1,
      'items|10-100': [
        {
          createTime: '2021-06-18T07:25:46.688Z',
          id: '@guid',
          last_updated: '2021-06-18T07:25:46.688Z',
          'modular|1': [
            'connection',
            'migration',
            'agent',
            'inspect',
            'differenceInspect',
            'message',
            'userNotification'
          ],
          'operation|1': [
            'create',
            'update',
            'copy',
            'delete',
            'start',
            'reset',
            'stop',
            'forceStop',
            'rename',
            'read',
            'readAll',
            'deleteAll'
          ],
          parameter1: '@name',
          parameter2: '@name',
          parameter3: '',
          'rename|1': [true, false],
          oldName: '@name', //原名称
          type: 'userOperation',
          user_id: '60cc0c5887e32100106b6a17',
          username: '@name'
        }
      ]
    }
  },
  '/tm/api/DataFlows/tranModelVersionControl': {
    reqId: '5e7a40a3-da6d-4940-aace-54c471e4f6b4',
    ts: 1641364647570,
    code: 'ok',
    data: { '0b173e70-82b5-46b7-bb48-7a99e2fb4e44': true }
  },
  '/tm/api/DataFlowInsights/runtimeMonitor': req => {
    const query = req.req?.query || {}
    const { statsType } = query
    console.log('statsType', query, statsType)
    // console.log('是我', req.req.query)
    let result = {}
    let currentTime = new Date().getTime()
    switch (statsType) {
      case 'data_overview':
        result = {
          reqId: '26987e75-e7bb-4637-8a8a-a07fe244a9a9',
          ts: 1641364647945,
          code: 'ok',
          data: {
            statsType: 'data_overview',
            createTime: '2022-01-05T06:37:27.945+00:00',
            dataFlowId: '61d50dd8e6800c3f3d04a527',
            granularity: 'flow',
            statsData: {
              outputCount: Random.integer(0, 100),
              deleteCount: Random.integer(0, 100),
              deleteSize: Random.integer(0, 100),
              updateCount: Random.integer(0, 100),
              t: '2022-01-05 11:21:04',
              inputSize: Random.integer(0, 100),
              updateSize: Random.integer(0, 100),
              insertCount: Random.integer(0, 100),
              insertSize: Random.integer(0, 100),
              inputCount: Random.integer(0, 100)
            }
          }
        }
        break
      case 'throughput':
        result = {
          reqId: '2e6416aa-df89-421d-bcef-d86a6660a8a2',
          ts: 1641364647945,
          code: 'ok',
          data: {
            statsType: 'throughput',
            createTime: '2022-01-05T06:37:27.945+00:00',
            dataFlowId: '61d50dd8e6800c3f3d04a527',
            granularity: 'flow_second',
            statsData: [
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:19:36', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:19:42', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:19:47', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:19:53', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:20:24', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:20:30', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:20:36', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:20:42', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:20:47', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:20:53', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:20:59', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:21:04', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:21:10', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:21:16', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:21:21', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:21:27', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:21:29', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:22:04', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:22:09', inputSize: 0.0, inputCount: 0.0 },
              // { outputSize: 0.0, outputCount: 0.0, t: '2022-01-05 11:22:15', inputSize: 0.0, inputCount: 0.0 }
            ]
          }
        }
        result.data.statsData = new Array(20).fill().map((t, i) => {
          let obj = {
            outputSize: Random.integer(0, 100),
            outputCount: Random.integer(0, 100),
            t: moment(currentTime + i * 5000).format('YYYY-MM-DD HH:mm:ss'),
            inputSize: Random.integer(0, 100),
            inputCount: Random.integer(0, 100)
          }
          return obj
        })
        break
    }
    return result
  },
  '/tm/api/DataFlowInsights': {
    reqId: '48a21a07-839a-4a0f-ae9d-48a7caeb0847',
    ts: 1641386586465,
    code: 'ok',
    data: {
      total: 1,
      items: [
        {
          id: '61d56473b8c8ca70349586e7',
          customId: '60cc0c304e190a579cbe306c',
          createUser: 'jason@tapdata.io',
          statsType: 'dataFlowDetailsStats',
          dataFlowId: '61d56450b8c8ca70349583d9',
          statsData: {
            sourceConnectionId: '61cd58523481e164d001c496',
            sourceConnectionName: 'auto_test_MySQL_ 2TZ',
            targetConnectionId: '61cd58d13481e164d001e9b0',
            targetConnectionName: 'auto_test_Oracle _-2TZ',
            sourceTableName: 'CLAIM',
            sourceRowNum: 1062,
            targetTableName: 'MYSQL_CLAIM_2TO02',
            targetRowNum: 1062,
            status: 'done',
            startTime: 1641374837450,
            sourceDbName: 'INSURANCE',
            targetDbName: 'tap122c',
            sourceDatabaseType: 'mysql',
            targetDatabaseType: 'oracle'
          },
          createTime: '2022-01-05T09:27:15.838+00:00',
          user_id: '61408608c4e5c40012663090'
        }
      ]
    }
  },
  '/tm/api/DataFlowInsights/statistics': {
    reqId: '77b5587a-fe9c-4ccc-b970-81b45f6f865f',
    ts: 1644486895566,
    code: 'ok',
    data: {
      granularity: 'week',
      inputDataStatistics: [
        { time: '2022-02-01', count: '@integer(0, 10))' },
        { time: '2022-02-02', count: '@integer(0, 10)' },
        { time: '2022-02-03', count: '@integer(0, 10)' },
        { time: '2022-02-04', count: '@integer(0, 10)' },
        { time: '2022-02-05', count: '@integer(0, 10)' },
        { time: '2022-02-06', count: '@integer(0, 10)' },
        { time: '2022-02-07', count: '@integer(0, 10)' },
        { time: '2022-02-08', count: '@integer(0, 10)' },
        { time: '2022-02-09', count: '@integer(0, 10)' },
        { time: '2022-02-10', count: '@integer(0, 10)' },
        { time: '2022-02-11', count: '@integer(0, 10)' },
        { time: '2022-02-12', count: '@integer(0, 10)' },
        { time: '2022-02-13', count: '@integer(0, 10)' },
        { time: '2022-02-14', count: '@integer(0, 10)' },
        { time: '2022-02-15', count: '@integer(0, 10)' },
        { time: '2022-02-16', count: '@integer(0, 10)' },
        { time: '2022-02-17', count: '@integer(0, 10)' },
        { time: '2022-02-18', count: '@integer(0, 10)' },
        { time: '2022-02-19', count: '@integer(0, 10)' },
        { time: '2022-02-20', count: '@integer(0, 10)' },
        { time: '2022-02-21', count: '@integer(0, 10)' },
        { time: '2022-02-22', count: '@integer(0, 10)' },
        { time: '2022-02-23', count: '@integer(0, 10)' },
        { time: '2022-02-24', count: '@integer(0, 10)' },
        { time: '2022-02-25', count: '@integer(0, 10)' },
        { time: '2022-02-26', count: '@integer(0, 10)' },
        { time: '2022-02-27', count: '@integer(0, 10)' },
        { time: '2022-02-28', count: '@integer(0, 10)' },
        { time: '2022-02-29', count: '@integer(0, 10)' },
        { time: '2022-02-30', count: '@integer(0, 10)' }
      ],
      totalInputDataCount: '@integer(0, 100)'
    }
  },
  '/tm/api/DataFlowRecord': {
    reqId: 'd8c5f1bb-e617-4e2e-93ab-24c248eccef1',
    ts: 1646476290267,
    code: 'ok',
    data: {
      total: 1,
      'items|1-50': [
        {
          id: '@id',
          customId: '60cc0c304e190a579cbe306c',
          createUser: 'jason@tapdata.io',
          dataFlowId: '62233405b3e2d40f364b48f3',
          dataFlowStartTime: '2022-03-05T09:57:28.503+00:00',
          dataFlowEndTime: '2022-03-05T09:59:05.171+00:00',
          'startType|1': ['manual', 'auto'],
          'dataFlowStatus|1': ['running', 'completed', 'paused', 'error'],
          createTime: '2022-03-05T10:31:25.787+00:00',
          user_id: '60cc0c5887e32100106b6a17'
        }
      ]
    }
  },
  '/tm/api/DataFlows/cron/isValidExpression': {
    reqId: '2d2ef280-ca64-443a-9d74-51c1d89de1a4',
    ts: 1646646169872,
    code: 'ok',
    data: { isValid: false }
  },
  'tm/api/Logs': {
    reqId: 'ce13dd7b-9522-422a-9fb6-f9660f3c5d24',
    ts: 1651134550642,
    code: 'ok',
    data: {
      total: 2,
      items: [
        {
          id: '626a0bb2b0b60b22b7bc89a7',
          customId: '610a3d43d7f65cfcd80837b5',
          lastUpdBy: '611618fe86fa6c0011e999d6',
          createUser: '610a3d43d7f65cfcd80837b5',
          level: 'ERROR',
          loggerName: 'com.tapdata.transformer.DefaultTransformer',
          message:
            "Bulk operation to target failed, message:  Apply event MessageEntity{op='i', before=null, after={SETTLED_DATE=0000-00-00 00:00:00, CLAIM_ID=CL_100000002, SETTLED_AMOUNT=null, CLAIM_REASON=null, CLAIM_TYPE=P000000009, POLICY_ID=P000000002, CLAIM_DATE=2022-01-31 10:28:03.0, LAST_CHANGE=null, CLAIM_AMOUNT=90.00}, tableName='CLAIM', opExpression=null, offset={tapdataCdcOffset=com.tapdata.entity.MySqlBinlogPosition@406eb616, CLAIM={CLAIM_ID=CL_100000002}, snapshotOffset=true}, subMap=null, ns='null', isJdbc=true, dataQualityTag=null, fileTask=null} to table TEST_INVALIOD_CLAIM failed: Execute insert failed, sql: SQLServerPreparedStatement:1912, target table name: TEST_INVALIOD_CLAIM, err(S0003:242): The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.; stack: \njava.lang.RuntimeException: Execute insert failed, sql: SQLServerPreparedStatement:1912, target table name: TEST_INVALIOD_CLAIM, err(S0003:242): The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.\n\tat io.tapdata.JdbcTarget.doInsertOne(JdbcTarget.java:1520)\n\tat io.tapdata.JdbcTarget.messageMappingProcess(JdbcTarget.java:1298)\n\tat io.tapdata.JdbcTarget.processMessage(JdbcTarget.java:1222)\n\tat io.tapdata.JdbcTarget.oneByOneProcessEvent(JdbcTarget.java:1148)\n\tat io.tapdata.JdbcTarget.lambda$onData$1(JdbcTarget.java:697)\n\tat com.tapdata.constant.MessageUtil.dispatcherMessage(MessageUtil.java:96)\n\tat io.tapdata.JdbcTarget.onData(JdbcTarget.java:695)\n\tat com.tapdata.transformer.DefaultTransformer.lambda$initialSyncProcess$3(DefaultTransformer.java:585)\n\tat java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)\n\tat java.util.concurrent.FutureTask.run(FutureTask.java:266)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\n\tat java.lang.Thread.run(Thread.java:745)\nCaused by: com.microsoft.sqlserver.jdbc.SQLServerException: The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.\n\tat com.microsoft.sqlserver.jdbc.SQLServerException.makeFromDatabaseError(SQLServerException.java:265)\n\tat com.microsoft.sqlserver.jdbc.SQLServerStatement.getNextResult(SQLServerStatement.java:1662)\n\tat com.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.doExecutePreparedStatement(SQLServerPreparedStatement.java:615)\n\tat com.microsoft.sqlserver.jdbc.SQLServerPreparedStatement$PrepStmtExecCmd.doExecute(SQLServerPreparedStatement.java:537)\n\tat com.microsoft.sqlserver.jdbc.TDSCommand.execute(IOBuffer.java:7417)\n\tat com.microsoft.sqlserver.jdbc.SQLServerConnection.executeCommand(SQLServerConnection.java:3488)\n\tat com.microsoft.sqlserver.jdbc.SQLServerStatement.executeCommand(SQLServerStatement.java:262)\n\tat com.microsoft.sqlserver.jdbc.SQLServerStatement.executeStatement(SQLServerStatement.java:237)\n\tat com.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.executeUpdate(SQLServerPreparedStatement.java:483)\n\tat io.tapdata.JdbcTarget.doInsertOne(JdbcTarget.java:1497)\n\t... 12 more\n.; Will stop job",
          date: 1651116978568,
          thrown: {
            type: 'com.microsoft.sqlserver.jdbc.SQLServerException',
            message:
              'The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.\ncom.microsoft.sqlserver.jdbc.SQLServerException.makeFromDatabaseError(SQLServerException.java:265)\ncom.microsoft.sqlserver.jdbc.SQLServerStatement.getNextResult(SQLServerStatement.java:1662)\ncom.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.doExecutePreparedStatement(SQLServerPreparedStatement.java:615)\ncom.microsoft.sqlserver.jdbc.SQLServerPreparedStatement$PrepStmtExecCmd.doExecute(SQLServerPreparedStatement.java:537)\ncom.microsoft.sqlserver.jdbc.TDSCommand.execute(IOBuffer.java:7417)\ncom.microsoft.sqlserver.jdbc.SQLServerConnection.executeCommand(SQLServerConnection.java:3488)\ncom.microsoft.sqlserver.jdbc.SQLServerStatement.executeCommand(SQLServerStatement.java:262)\ncom.microsoft.sqlserver.jdbc.SQLServerStatement.executeStatement(SQLServerStatement.java:237)\ncom.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.executeUpdate(SQLServerPreparedStatement.java:483)\nio.tapdata.JdbcTarget.doInsertOne(JdbcTarget.java:1497)\nio.tapdata.JdbcTarget.messageMappingProcess(JdbcTarget.java:1298)\nio.tapdata.JdbcTarget.processMessage(JdbcTarget.java:1222)\nio.tapdata.JdbcTarget.oneByOneProcessEvent(JdbcTarget.java:1148)\nio.tapdata.JdbcTarget.lambda$onData$1(JdbcTarget.java:697)\ncom.tapdata.constant.MessageUtil.dispatcherMessage(MessageUtil.java:96)\nio.tapdata.JdbcTarget.onData(JdbcTarget.java:695)\ncom.tapdata.transformer.DefaultTransformer.lambda$initialSyncProcess$3(DefaultTransformer.java:585)\njava.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)\njava.util.concurrent.FutureTask.run(FutureTask.java:266)\njava.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\njava.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\njava.lang.Thread.run(Thread.java:745)\n'
          },
          threadName: 'pool-2684-thread-3',
          contextMap: {
            app: 'transformer',
            dataFlowId: '626a0ba8b0b60b22b7bc8939',
            jobId: '626a0bab5d7d220bcedc6a85',
            jobName: '无效日期验证_1',
            threadName: 'pool-2684-thread-3',
            userId: '611618fe86fa6c0011e999d6'
          },
          contextStack: [],
          threadId: 14611,
          threadPriority: 5,
          millis: 1651116978568,
          createTime: '2022-04-28T03:36:18.572+00:00',
          last_updated: '2022-04-28T03:36:18.572+00:00',
          user_id: '611618fe86fa6c0011e999d6'
        },
        {
          id: '626a0bb29247b74dbe466a9d',
          customId: '610a3d43d7f65cfcd80837b5',
          lastUpdBy: '611618fe86fa6c0011e999d6',
          createUser: '610a3d43d7f65cfcd80837b5',
          level: 'ERROR',
          loggerName: 'io.tapdata.JdbcTarget',
          message:
            "Apply event MessageEntity{op='i', before=null, after={SETTLED_DATE=0000-00-00 00:00:00, CLAIM_ID=CL_100000002, SETTLED_AMOUNT=null, CLAIM_REASON=null, CLAIM_TYPE=P000000009, POLICY_ID=P000000002, CLAIM_DATE=2022-01-31 10:28:03.0, LAST_CHANGE=null, CLAIM_AMOUNT=90.00}, tableName='CLAIM', opExpression=null, offset={tapdataCdcOffset=com.tapdata.entity.MySqlBinlogPosition@406eb616, CLAIM={CLAIM_ID=CL_100000002}, snapshotOffset=true}, subMap=null, ns='null', isJdbc=true, dataQualityTag=null, fileTask=null} to table TEST_INVALIOD_CLAIM failed: Execute insert failed, sql: SQLServerPreparedStatement:1912, target table name: TEST_INVALIOD_CLAIM, err(S0003:242): The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.; stack: \njava.lang.RuntimeException: Execute insert failed, sql: SQLServerPreparedStatement:1912, target table name: TEST_INVALIOD_CLAIM, err(S0003:242): The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.\n\tat io.tapdata.JdbcTarget.doInsertOne(JdbcTarget.java:1520)\n\tat io.tapdata.JdbcTarget.messageMappingProcess(JdbcTarget.java:1298)\n\tat io.tapdata.JdbcTarget.processMessage(JdbcTarget.java:1222)\n\tat io.tapdata.JdbcTarget.oneByOneProcessEvent(JdbcTarget.java:1148)\n\tat io.tapdata.JdbcTarget.lambda$onData$1(JdbcTarget.java:697)\n\tat com.tapdata.constant.MessageUtil.dispatcherMessage(MessageUtil.java:96)\n\tat io.tapdata.JdbcTarget.onData(JdbcTarget.java:695)\n\tat com.tapdata.transformer.DefaultTransformer.lambda$initialSyncProcess$3(DefaultTransformer.java:585)\n\tat java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)\n\tat java.util.concurrent.FutureTask.run(FutureTask.java:266)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\n\tat java.lang.Thread.run(Thread.java:745)\nCaused by: com.microsoft.sqlserver.jdbc.SQLServerException: The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.\n\tat com.microsoft.sqlserver.jdbc.SQLServerException.makeFromDatabaseError(SQLServerException.java:265)\n\tat com.microsoft.sqlserver.jdbc.SQLServerStatement.getNextResult(SQLServerStatement.java:1662)\n\tat com.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.doExecutePreparedStatement(SQLServerPreparedStatement.java:615)\n\tat com.microsoft.sqlserver.jdbc.SQLServerPreparedStatement$PrepStmtExecCmd.doExecute(SQLServerPreparedStatement.java:537)\n\tat com.microsoft.sqlserver.jdbc.TDSCommand.execute(IOBuffer.java:7417)\n\tat com.microsoft.sqlserver.jdbc.SQLServerConnection.executeCommand(SQLServerConnection.java:3488)\n\tat com.microsoft.sqlserver.jdbc.SQLServerStatement.executeCommand(SQLServerStatement.java:262)\n\tat com.microsoft.sqlserver.jdbc.SQLServerStatement.executeStatement(SQLServerStatement.java:237)\n\tat com.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.executeUpdate(SQLServerPreparedStatement.java:483)\n\tat io.tapdata.JdbcTarget.doInsertOne(JdbcTarget.java:1497)\n\t... 12 more\n; Will stop job",
          date: 1651116978518,
          thrown: {
            type: 'com.microsoft.sqlserver.jdbc.SQLServerException',
            message:
              'The conversion of a nvarchar data type to a datetime data type resulted in an out-of-range value.\ncom.microsoft.sqlserver.jdbc.SQLServerException.makeFromDatabaseError(SQLServerException.java:265)\ncom.microsoft.sqlserver.jdbc.SQLServerStatement.getNextResult(SQLServerStatement.java:1662)\ncom.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.doExecutePreparedStatement(SQLServerPreparedStatement.java:615)\ncom.microsoft.sqlserver.jdbc.SQLServerPreparedStatement$PrepStmtExecCmd.doExecute(SQLServerPreparedStatement.java:537)\ncom.microsoft.sqlserver.jdbc.TDSCommand.execute(IOBuffer.java:7417)\ncom.microsoft.sqlserver.jdbc.SQLServerConnection.executeCommand(SQLServerConnection.java:3488)\ncom.microsoft.sqlserver.jdbc.SQLServerStatement.executeCommand(SQLServerStatement.java:262)\ncom.microsoft.sqlserver.jdbc.SQLServerStatement.executeStatement(SQLServerStatement.java:237)\ncom.microsoft.sqlserver.jdbc.SQLServerPreparedStatement.executeUpdate(SQLServerPreparedStatement.java:483)\nio.tapdata.JdbcTarget.doInsertOne(JdbcTarget.java:1497)\nio.tapdata.JdbcTarget.messageMappingProcess(JdbcTarget.java:1298)\nio.tapdata.JdbcTarget.processMessage(JdbcTarget.java:1222)\nio.tapdata.JdbcTarget.oneByOneProcessEvent(JdbcTarget.java:1148)\nio.tapdata.JdbcTarget.lambda$onData$1(JdbcTarget.java:697)\ncom.tapdata.constant.MessageUtil.dispatcherMessage(MessageUtil.java:96)\nio.tapdata.JdbcTarget.onData(JdbcTarget.java:695)\ncom.tapdata.transformer.DefaultTransformer.lambda$initialSyncProcess$3(DefaultTransformer.java:585)\njava.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)\njava.util.concurrent.FutureTask.run(FutureTask.java:266)\njava.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)\njava.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)\njava.lang.Thread.run(Thread.java:745)\n'
          },
          threadName: 'pool-2684-thread-3',
          contextMap: {
            app: 'transformer',
            dataFlowId: '626a0ba8b0b60b22b7bc8939',
            jobId: '626a0bab5d7d220bcedc6a85',
            jobName: '无效日期验证_1',
            threadName: 'pool-2684-thread-3',
            userId: '611618fe86fa6c0011e999d6'
          },
          contextStack: [],
          threadId: 14611,
          threadPriority: 5,
          millis: 1651116978518,
          createTime: '2022-04-28T03:36:18.521+00:00',
          last_updated: '2022-04-28T03:36:18.521+00:00',
          user_id: '611618fe86fa6c0011e999d6'
        }
      ]
    }
  }
}
