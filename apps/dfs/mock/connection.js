const Mock = require('mockjs')
const Random = Mock.Random

module.exports = {
  '/api/tcm/connection/create': {
    code: 'ok',
    msg: 'ok',
    data: {
      'databaseType|1': ['mysql', 'postgres', 'mongodb'], //数据库类型
      host: '192.168.' + Random.integer(0, 500) + '.' + Random.integer(0, 500), //数据库地址
      port: Random.integer(0, 5000), // 数据库端口
      username: '@name', // 数据库账号
      password: '@cuid', // 数据库密码
      db: '@name', // 数据库名称
      schema: '@cuid' // 数据库 schema
    }
  },
  '/tm/api/Connections/:id/customQuery': {
    data: {
      name: 'TLL_MONGO4_2_24212',
      connection_type: 'source_and_target',
      database_type: 'mongodb',
      database_host: '192.168.1.183:24212',
      database_username: 'root',
      database_port: 0,
      database_uri: '',
      database_name: 'test',
      database_owner: 'owner_@name',
      retry: 0,
      nextRetry: null,
      id: '60d557ebd3fdfa20ea143cd8',
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
            required: false
          }
        ],
        retry: 0
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
      multiTenant: false,
      pdb: '',
      sslValidate: false,
      sslCA: '',
      search_databaseType: '',
      increamentalTps: 100,
      initialReadSize: 100000,
      sslCert: '',
      status: 'ready',
      fill: 'uri',
      transformed: true,
      user_id: '60acbe6b323d9d005723ea91',
      last_updated: '2021-06-25T11:14:59.633Z',
      createTime: '2021-06-25T04:13:31.851Z',
      testTime: 1624606160441,
      dbFullVersion: '4.2.12',
      db_version: 4,
      loadCount: 10,
      'loadFieldsStatus|1': ['loading', 'finished'],
      loadSchemaField: false,
      schemaVersion: '40f3ecc8-67a5-44d4-a0eb-479faed9d8a4',
      tableCount: 10,
      everLoadSchema: true,
      schema: {
        'tables|100-500': [
          {
            id: '@id',
            table_name: '@name'
          }
        ]
      }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/Connections/count': { data: { count: 232 }, code: 'ok', msg: 'ok' },
  '/tm/api/Connections': {
    code: 'ok',
    msg: 'ok',
    data: {
      total: '@integer(0, 100)',
      size: 20,
      totalPage: 1,
      'items|0-10': [
        {
          name: '@name',
          connection_type: 'target',
          'database_type|1': ['mysql', 'oracle', 'mongodb'],
          database_host: '192.168.1.' + Random.integer(0, 999),
          database_username: 'root@name',
          database_password: '@cuid',
          database_port: Random.integer(0, 5000),
          database_uri: 'mongodb://192.168.1.191:27017/tapdata_test',
          database_name: 'root@name',
          database_owner: 'owner_@name',
          id: '@id',
          sslCert: '',
          additionalString: '',
          'ssl|1': Boolean,
          sslKey: '',
          sslPass: '',
          'schemaAutoUpdate|1': Boolean,
          sslCA: '',
          search_databaseType: '',
          'status|1': ['ready', 'invalid', 'testing'],
          fill: 'uri',
          user_id: '@id',
          last_updated: Random.datetime(),
          loadCount: Random.integer(0, 100),
          'loadFieldsStatus|1': ['loading', 'finished', 'error'],
          tableCount: 100,
          username: '@name',
          'agentType|1': ['Cloud', ''],
          loadFieldErrMsg: '@paragraph'
        }
      ]
    }
  },
  '/tm/api/Connections/:id': {
    data: {
      name: 'zed_huawei_mysql2',
      'agentType|1': ['Cloud', ''],
      connection_type: 'source_and_target',
      database_type: 'mysql',
      database_host: '119.8.35.121',
      database_username: 'root',
      database_port: 3307,
      database_uri: '',
      database_name: 'test',
      database_owner: 'owner_@name',
      database_password: '259275a9f888a77f2acd8af488755875',
      retry: 0,
      nextRetry: null,
      id: '60d59186b1738d1d9a77c0c1',
      response_body: {
        validate_details: [
          {
            stage_code: 'validate-2000',
            show_msg: 'CHECK_CONNECT',
            status: 'passed',
            sort: 1,
            error_code: null,
            fail_message: null,
            required: true
          },
          {
            stage_code: 'validate-2100',
            show_msg: 'CHECK_AUTH',
            status: 'passed',
            sort: 2,
            error_code: null,
            fail_message: null,
            required: true
          },
          {
            stage_code: 'validate-2300',
            show_msg: 'CHECK_VERSION',
            status: 'passed',
            sort: 4,
            error_code: null,
            fail_message: null,
            required: true
          },
          {
            stage_code: 'validate-2400',
            show_msg: 'LOAD_SCHEMA',
            status: 'passed',
            sort: 5,
            error_code: null,
            fail_message: null,
            required: false
          },
          {
            stage_code: 'validate-2500',
            show_msg: 'CHECK_BIN_LOG',
            status: 'passed',
            sort: 6,
            error_code: null,
            fail_message: null,
            required: false
          },
          {
            stage_code: 'validate-2600',
            show_msg: 'CHECK_CDC_PERMISSION',
            status: 'passed',
            sort: 7,
            error_code: null,
            fail_message: null,
            required: false
          }
        ],
        retry: 0
      },
      project: '',
      submit: true,
      table_filter: '',
      additionalString: '',
      thin_type: '',
      node_name: '',
      database_schema: '',
      plugin_name: '',
      pgsql_log_decorder_plugin_name: '',
      database_datetype_without_timezone: '',
      supportUpdatePk: false,
      isUrl: true,
      ssl: false,
      sslKey: '',
      sslPass: '',
      schemaAutoUpdate: false,
      multiTenant: false,
      pdb: '',
      sslValidate: false,
      sslCA: '',
      search_databaseType: '',
      increamentalTps: 100,
      initialReadSize: 100000,
      sslCert: '',
      status: 'ready',
      transformed: true,
      user_id: '60d58d0ab1738d1d9a77b491',
      last_updated: '2021-06-25T14:40:04.328Z',
      createTime: '2021-06-25T08:19:18.863Z',
      testTime: 1624632004326,
      loadCount: 1,
      'loadFieldsStatus|1': ['loading', 'finished'],
      loadSchemaField: false,
      schemaVersion: '0beb4e67-a89e-4d4c-a8e8-ea4ee0defe8c',
      tableCount: 1,
      everLoadSchema: true,
      username: 'zed',
      schema: {
        tables: [
          {
            table_name: 'user',
            cdc_enabled: true,
            meta_type: 'table',
            tableId: '60d59187b1738d1d9a77c0c8',
            fields: [
              {
                field_name: 'id',
                table_name: 'user',
                data_type: 'INT',
                primary_key_position: 1,
                key: 'PRI',
                dataType: 4,
                is_nullable: false,
                parent: null,
                original_field_name: 'id',
                original_java_type: 'Long',
                precision: 10,
                scale: null,
                oriPrecision: 10,
                oriScale: null,
                default_value: null,
                javaType: 'Long',
                columnSize: 10,
                autoincrement: false,
                id: '60d59187b1738d1d9a77c0cb',
                is_deleted: false
              },
              {
                field_name: 'name',
                table_name: 'user',
                data_type: 'VARCHAR',
                primary_key_position: 0,
                dataType: 12,
                is_nullable: false,
                parent: null,
                original_field_name: 'name',
                original_java_type: 'String',
                precision: 255,
                scale: null,
                oriPrecision: 255,
                oriScale: null,
                default_value: null,
                javaType: 'String',
                columnSize: 255,
                autoincrement: false,
                id: '60d59187b1738d1d9a77c0cc',
                is_deleted: false
              }
            ],
            indices: []
          }
        ]
      }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/DatabaseTypes': {
    reqId: 'fa6593e9-4483-46cf-9a7c-19f202459484',
    ts: 1648781377692,
    code: 'ok',
    data: [
      {
        id: '61b871cd5237fe00136db766',
        name: 'MySQL',
        type: 'mysql',
        createTime: '2021-12-14T10:28:29.850+00:00',
        last_updated: '2021-12-14T10:28:29.850+00:00'
      },
      {
        id: '61b871ce47697e0012c3e7d3',
        name: 'Oracle',
        type: 'oracle',
        createTime: '2021-12-14T10:28:30.142+00:00',
        last_updated: '2021-12-14T10:28:30.142+00:00'
      },
      {
        id: '61b871ce059b0f0019bc467d',
        name: 'MongoDB',
        type: 'mongodb',
        createTime: '2021-12-14T10:28:30.228+00:00',
        last_updated: '2021-12-14T10:28:30.228+00:00'
      },
      {
        id: '61b871ce095ae30011087218',
        name: 'SQL Server',
        type: 'sqlserver',
        createTime: '2021-12-14T10:28:30.427+00:00',
        last_updated: '2021-12-14T10:28:30.427+00:00'
      },
      {
        id: '61b871ced18b230013072895',
        name: 'Dummy DB',
        type: 'dummy db',
        createTime: '2021-12-14T10:28:30.612+00:00',
        last_updated: '2021-12-14T10:28:30.612+00:00'
      },
      {
        id: '61b871ce47697e0012c3e7d4',
        name: 'PostgreSQL',
        type: 'postgres',
        createTime: '2021-12-14T10:28:30.794+00:00',
        last_updated: '2021-12-14T10:28:30.794+00:00'
      },
      {
        id: '61b871ce04616e00193aed4b',
        name: 'Greenplum',
        type: 'greenplum',
        createTime: '2021-12-14T10:28:30.815+00:00',
        last_updated: '2021-12-14T10:28:30.815+00:00'
      },
      {
        id: '61b871cea42c5b00121c9c3b',
        name: 'Elasticsearch',
        type: 'elasticsearch',
        createTime: '2021-12-14T10:28:30.839+00:00',
        last_updated: '2021-12-14T10:28:30.839+00:00'
      },
      {
        id: '61b871cfd18b230013072896',
        name: 'MariaDB',
        type: 'mariadb',
        createTime: '2021-12-14T10:28:31.003+00:00',
        last_updated: '2021-12-14T10:28:31.003+00:00'
      },
      {
        id: '61b871cf9da2630011dfa379',
        name: 'Kafka',
        type: 'kafka',
        createTime: '2021-12-14T10:28:31.033+00:00',
        last_updated: '2021-12-14T10:28:31.033+00:00'
      },
      {
        id: '61b871cf059b0f0019bc4681',
        name: 'MQ',
        type: 'mq',
        createTime: '2021-12-14T10:28:31.054+00:00',
        last_updated: '2021-12-14T10:28:31.054+00:00'
      },
      {
        id: '61b871cf2c82dd00194d946e',
        name: 'DM DB',
        type: 'dameng',
        createTime: '2021-12-14T10:28:31.153+00:00',
        last_updated: '2021-12-14T10:28:31.153+00:00'
      },
      {
        id: '61b871cf059b0f0019bc4682',
        name: 'TiDB',
        type: 'tidb',
        createTime: '2021-12-14T10:28:31.474+00:00',
        last_updated: '2021-12-14T10:28:31.474+00:00'
      },
      {
        id: '61b871cf004b090011b682d8',
        name: 'ClickHouse',
        type: 'clickhouse',
        createTime: '2021-12-14T10:28:31.498+00:00',
        last_updated: '2021-12-14T10:28:31.498+00:00'
      },
      {
        id: '61b871cfd18b230013072898',
        name: 'KunDB',
        type: 'kundb',
        createTime: '2021-12-14T10:28:31.524+00:00',
        last_updated: '2021-12-14T10:28:31.524+00:00'
      },
      {
        id: '61b871cf47697e0012c3e7d7',
        name: 'ADB MySQL',
        type: 'adb_mysql',
        createTime: '2021-12-14T10:28:31.553+00:00',
        last_updated: '2021-12-14T10:28:31.553+00:00'
      },
      {
        id: '61b871cf095ae3001108721a',
        name: 'ADB PostgreSQL',
        type: 'adb_postgres',
        createTime: '2021-12-14T10:28:31.569+00:00',
        last_updated: '2021-12-14T10:28:31.569+00:00'
      },
      {
        id: '61b871cf004b090011b682d9',
        name: 'Hazelcast Cloud',
        type: 'hazelcast_cloud_cluster',
        createTime: '2021-12-14T10:28:31.634+00:00',
        last_updated: '2021-12-14T10:28:31.634+00:00'
      },
      {
        id: '623156c1699420a614cb8bfe',
        name: 'Vika',
        type: 'vika',
        createTime: '2022-03-15T12:03:21.098+00:00',
        last_updated: '2022-03-15T12:03:21.098+00:00'
      },
      { id: '6232d76c0277a7e119470d97', name: 'Aliyun RDS for MariaDB', type: 'aliyun_mariadb' },
      { id: '6232d76c0277a7e119470dab', name: 'Aliyun MongoDB', type: 'aliyun_mongodb' },
      { id: '6232d76c0277a7e119470dcc', name: 'Aliyun RDS for MySQL', type: 'aliyun_mysql' },
      { id: '6232d76c0277a7e119470de4', name: 'Aliyun RDS for PG', type: 'aliyun_postgres' },
      { id: '6232d76c0277a7e119470df2', name: 'Aliyun RDS for SQLServer', type: 'aliyun_sqlserver' },
      { id: '6232d76c0277a7e119470dfe', name: 'TencentDB for MariaDB', type: 'tencent_mariadb' },
      { id: '6232d76c0277a7e119470e2b', name: 'TencentDB MongoDB', type: 'tencent_mongodb' },
      { id: '6232d76c0277a7e119470e66', name: 'TencentDB for MySQL', type: 'tencent_mysql' },
      { id: '6232d76c0277a7e119470e8a', name: 'TencentDB for PG', type: 'tencent_postgres' },
      { id: '6232d76c0277a7e119470ea3', name: 'TencentDB for SQLServer', type: 'tencent_sqlserver' },
      { id: '6246669b699420a614cb8c00', name: 'apache doris', type: 'doris' }
    ]
  }
}
