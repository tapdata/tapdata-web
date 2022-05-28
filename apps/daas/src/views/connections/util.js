import Cookie from '@tap/shared/src/cookie'
import { getConnectionTypeDialogImg } from 'web-core/util'

/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/12/9
 * @description
 */
import i18n from '@/i18n'
export const getImgByType = function (type) {
  if (!type || type === 'jira') {
    type = 'default'
  }
  return require(`@/assets/images/databaseType/${type.toLowerCase()}.png`)
}

export const verify = function (value) {
  var arr = ['\\', '$', '(', ')', '*', '+', '.', '[', ']', '?', '^', '{', '}', '|', '-']
  for (var i = 0; i < arr.length; i++) {
    var str = '\\' + arr[i]
    value = value.replace(new RegExp(str, 'g'), '\\' + arr[i])
  }
  return value
}
//列表脱敏
export const desensitization = function (url) {
  let matchResult = url.match(/^mongodb(\+srv)?:\/\/(.+):(.+)@/)
  if (matchResult && matchResult[3]) {
    return url.replace(`:${matchResult[3]}@`, ':*********@')
  }
  return url
}

export const handleProgress = function (data) {
  let count = 0
  data.forEach(log => {
    if (log.status === 'passed') {
      count++
    }
  })
  let len = (100 / data.length) * count
  return Math.round(len) ? Math.round(len) : 0
}

//支持的数据源
export const TYPEMAP = {
  mysql: 'MySQL',
  oracle: 'Oracle',
  mongodb: 'MongoDB',
  elasticsearch: 'Elasticsearch',
  redis: 'Redis',
  postgres: 'PostgreSQL',
  sqlserver: 'SQL Server',
  'gbase-8s': 'GBase 8s',
  'sybase ase': 'Sybase ASE',
  gaussdb200: 'GaussDB200',
  db2: 'IBM Db2',
  mem_cache: 'Memory Cache',
  file: 'File(s)',
  custom_connection: 'Custom connection',
  'rest api': 'REST API',
  'dummy db': 'Dummy DB',
  gridfs: 'GridFS',
  kafka: 'Kafka',
  mariadb: 'MariaDB',
  'mysql pxc': 'MySQL PXC',
  jira: 'jira',
  dameng: 'DM DB',
  hive: 'Hive',
  tcp_udp: 'TCP/IP',
  mq: 'MQ',
  hbase: 'HBase',
  kudu: 'KUDU',
  greenplum: 'Greenplum',
  tidb: 'TiDB',
  hana: 'SAP HANA',
  clickhouse: 'ClickHouse',
  kundb: 'KunDB',
  adb_mysql: 'ADB MySQL',
  adb_postgres: 'ADB PostgreSQL',
  hazelcast_cloud_cluster: 'Hazelcast Cloud'
}
//特殊数据源
export const TYPEMAPCONFIG = {
  'gbase-8s': 'gbase8s',
  'sybase ase': 'sybasease',
  'dummy db': 'dummydb',
  'mysql pxc': 'mysqlpxc',
  'rest api': 'restapi'
}

//数据源基础字段
export const defaultModel = {
  default: {
    id: '',
    name: '',
    database_type: '',
    connection_type: '',
    database_host: '',
    database_port: '',
    database_name: '',
    database_username: '',
    database_password: '',
    plain_password: '',
    table_filter: '',
    additionalString: '',
    thin_type: '',
    database_owner: '',
    node_name: '',
    database_schema: '',
    plugin_name: '',
    pgsql_log_decorder_plugin_name: '',
    database_datetype_without_timezone: '',
    supportUpdatePk: false,
    isUrl: true,
    database_uri: '',
    ssl: false,
    sslKey: '',
    sslPass: '',
    schemaAutoUpdate: false,
    multiTenant: false,
    pdb: '',
    sslValidate: false,
    sslCA: '',
    sslCAFile: null,
    sslKeyFile: null,
    search_databaseType: '',
    increamentalTps: 100, //dummy
    initialReadSize: 100000, //dummy
    hiveConnType: 'Stream', // kafka
    schema: '',
    tidbPdServer: '', // TiDB
    isCheckValid: false,
    shareCdcEnable: false,
    //共享挖掘配置
    persistenceMongodb_uri_db: '',
    persistenceMongodb_collection: '',
    share_cdc_ttl_day: 3,
    showShareConfig: false, //是否隐藏有全局挖掘设置
    redoLogParserEnable: false,
    redoLogParserHost: '',
    redoLogParserPort: '',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  kafka: {
    id: '',
    name: '',
    database_type: '',
    connection_type: '',
    kafkaBootstrapServers: '',
    kafkaPatternTopics: '',
    database_username: '',
    plain_password: '',
    kafkaIgnoreInvalidRecord: false,
    kafkaAcks: '',
    kafkaCompressionType: '',
    kafkaIgnorePushError: false,
    krb5: false,
    krb5Keytab: '',
    krb5Conf: '',
    krb5KeytabName: '',
    krb5ConfName: '',
    krb5Principal: '',
    krb5ServiceName: '',
    kafkaSaslMechanism: 'PLAIN',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  file: {
    name: '',
    database_type: '',
    connection_type: '',
    database_host: '',
    database_port: '21',
    database_name: '',
    database_username: '',
    database_password: '',
    plain_password: '',
    database_uri: '',
    ftp_passive: true, // 连接方式
    connection_timeout_seconds: 60, //连接超时时间
    data_timeout_seconds: 60, //传输超时时间
    fileDefaultCharset: 'UTF8', // 编码格式
    file_upload_chunk_size: 261120, //文件上传文件块大小
    file_upload_mode: '', //文件上传模式
    overwriteSetting: '', //当同名文件存在时
    extendSourcePath: false, // 继承目录结构
    outputPath: '', // 文件输出绝对路径
    file_source_protocol: '', //协议类型
    vc_mode: '', // 版本管理
    file_sources: [
      {
        path: '',
        recursive: false,
        selectFileType: 'include',
        include_filename: '',
        exclude_filename: ''
      }
    ],
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  jira: {
    name: '',
    multiTenant: false,
    pdb: '',
    jiraUrl: '',
    jiraUsername: '',
    jiraPassword: '',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  restApi: {
    name: '',
    auth_type: '',
    request_interval: '',
    collection_name: '',
    unique_keys: '',
    req_pre_process:
      " // Build-in function's MD5/SHA1/SHA256\n" +
      '    // example:\n' +
      "    // request_params.sign = MD5(request_params.id+request_params_name+'secret_key');",
    resp_pre_process: "// result: {'tapdata_offset': offset, 'response':<API RESPONSE>}",
    data_sync_mode: 'INCREMENTAL_SYNC',
    url_info: [
      {
        url: '',
        method: 'GET',
        url_type: 'INCREMENTAL_SYNC',
        headers: {},
        headerArray: [{ name: '', value: '' }],
        parameterArray: [{ name: '', value: '' }],
        request_parameters: {},
        offset_field: '',
        initial_offset: '',
        content_type: ''
      }
    ],
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  custom_connection: {
    name: '',
    connection_type: '',
    custom_type: '',
    collection_name: '',
    unique_keys: '',
    // connectionTimeOut: '10',
    // readTimeOut: '30',
    jsEngineName: 'graal.js',
    custom_ondata_script: '',
    custom_cdc_script: '',
    custom_initial_script: '',
    custom_before_opr: false,
    custom_after_opr: false,
    custom_before_script: '',
    custom_after_script: '',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  gridfs: {
    connection_type: 'source',
    prefix: 'fs',
    database_uri: '',
    _password_for_url: '',
    plain_password: '',
    include_filename: '',
    exclude_filename: '',
    file_schema: '',
    file_type: 'csv',
    seperate: ',',
    gridfs_header_type: 'specified_line',
    gridfs_header_config: '',
    data_content_xpath: '',
    gridfsReadMode: 'data',
    json_type: 'ArrayBegin',
    tags_filter: '',
    gridfs_upload_chunk_size: '',
    file_upload_chunk_size: 261120,
    file_upload_mode: 'stream',
    project: '',
    projects: '',
    sheet_start: 1,
    sheet_end: 1,
    excel_header_type: 'index',
    excel_header_start: 'A1',
    excel_header_end: 'Z1',
    excel_value_start: '',
    excel_value_end: '',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  tcp: {
    name: '',
    database_type: 'tcp_udp',
    connection_type: 'target',
    database_host: '',
    database_port: '',
    tcpUdpType: 'TCP',
    root_name: '',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  mq: {
    name: '',
    database_type: '',
    connection_type: '',
    database_host: '',
    database_port: '',
    mqType: '0', //MQ类型
    brokerURL: '', //MQ连接串
    database_username: '',
    plain_password: '',
    mqQueueSet: '', //队列名集合
    mqTopicSet: '', //主题名称
    routeKeyField: '', //消息路由
    virtualHost: '', //虚拟主机
    productGroup: '',
    consumerGroup: '',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  hana: {
    hanaType: 'sdc',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  },
  vika: {
    name: '',
    database_type: '',
    connection_type: '',
    database_host: '',
    plain_password: '',
    vika_space_name: '',
    vika_space_id: '',
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: ''
  }
}
export const defaultCloudModel = {
  default: {
    name: '',
    database_type: '',
    connection_type: '',
    database_host: '',
    database_port: '',
    database_name: '',
    database_username: '',
    database_password: '',
    plain_password: '',
    database_owner: '',
    database_uri: '',
    isUrl: false,
    ssl: false,
    sslKey: '',
    sslPass: '',
    sslValidate: false,
    sslCA: '',
    sslCAFile: null,
    sslKeyFile: null,
    pgsql_log_decorder_plugin_name: '',
    database_datetype_without_timezone: '',
    additionalString: ''
  },
  drs: {
    s_zone: '',
    s_region: '',
    sourceType: 'rds',
    database_type: 'source_and_target',
    region: '',
    zone: '',
    vpc: '',
    ecs: '',
    checkedVpc: '',
    platformInfo: {
      region: '',
      zone: '',
      sourceType: '',
      DRS_region: '',
      DRS_zone: '',
      DRS_instances: '',
      IP_type: '',
      vpc: '',
      ecs: '',
      checkedVpc: false,
      strategyExistence: false
    }
  }
}
export const CONFIG_MODEL = {
  default: [
    {
      icon: 'time',
      items: [
        {
          label: i18n.t('connection_preview_load_schema'),
          key: 'last_updated'
        }
      ]
    },
    {
      icon: 'database',
      items: [
        {
          label: i18n.t('connection_form_database_address'),
          key: 'database_host'
        }
      ]
    },
    {
      icon: 'port',
      items: [
        {
          label: i18n.t('connection_form_port'),
          key: 'database_port'
        }
      ]
    },
    {
      icon: 'name',
      items: [
        {
          label: i18n.t('connection_form_database_name'),
          key: 'database_name'
        }
      ]
    },
    {
      icon: 'database-user-name',
      items: [
        {
          label: i18n.t('connection_form_database_username'),
          key: 'database_username'
        }
      ]
    },
    {
      icon: 'connect_schema',
      items: [
        {
          label: i18n.t('dataForm.form.databaseOwner'),
          key: 'database_owner'
        }
      ]
    },
    {
      icon: 'additional-string',
      items: [
        {
          label: i18n.t('connection_form_additional_string'),
          key: 'additionalString'
        }
      ]
    },
    {
      icon: 'origin-time',
      items: [
        {
          label: i18n.t('connection_form_timezone'),
          key: 'database_datetype_without_timezone'
        }
      ]
    }
    // {
    //   icon: 'connect_shared_mining',
    //   items: [
    //     {
    //       label: i18n.t('connection_form_shared_mining'),
    //       key: 'shareCdcEnable'
    //     }
    //   ]
    // },
    // {
    //   icon: 'connect_journal',
    //   items: [
    //     {
    //       label: i18n.t('connection_form_oracle_redoLog_parser'),
    //       key: 'redoLogParserEnable'
    //     }
    //   ]
    // }
  ],
  kafka: [
    {
      icon: 'time',
      items: [
        {
          label: i18n.t('connection_preview_load_schema'),
          key: 'last_updated'
        }
      ]
    },
    {
      icon: 'database',
      items: [
        {
          label: i18n.t('connection_form_database_address'),
          key: 'kafkaBootstrapServers'
        },
        {
          label: i18n.t('connection_form_kafka_pattern_topic'),
          key: 'kafkaPatternTopics'
        },
        {
          label: i18n.t('connection_form_kafka_ignore_invalid'),
          key: 'kafkaIgnoreInvalidRecord'
        },
        {
          label: i18n.t('connection_form_kafka_ack'),
          key: 'kafkaAcks'
        },
        {
          label: i18n.t('connection_form_kafka_compression_type'),
          key: 'kafkaCompressionType'
        },
        {
          label: i18n.t('connection_form_kafka_ignore_push'),
          key: 'kafkaIgnorePushError'
        }
      ]
    }
  ],
  mq: [
    {
      icon: 'time',
      items: [
        {
          label: i18n.t('connection_preview_load_schema'),
          key: 'last_updated'
        }
      ]
    },
    {
      icon: 'database',
      items: [
        {
          label: i18n.t('connection_form_database_address'),
          key: 'database_host'
        }
      ]
    },
    {
      icon: 'port',
      items: [
        {
          label: i18n.t('connection_form_port'),
          key: 'database_port'
        },
        {
          label: i18n.t('connection_form_mq_type'),
          key: 'mqType'
        },
        {
          label: i18n.t('connection_form_broker_url'),
          key: 'brokerURL'
        },
        {
          label: i18n.t('connection_form_mq_queue_set'),
          key: 'mqQueueSet'
        },
        {
          label: i18n.t('connection_form_mq_topic_set'),
          key: 'mqTopicSet'
        },
        {
          label: i18n.t('connection_form_route_key_field'),
          key: 'routeKeyField'
        },
        {
          label: i18n.t('connection_form_virtual_host'),
          key: 'virtualHost'
        }
      ]
    },
    {
      icon: 'database-user-name',
      items: [
        {
          label: i18n.t('connection_form_database_username'),
          key: 'mqUserName'
        }
      ]
    },
    {
      icon: 'database-password',
      items: [
        {
          label: i18n.t('connection_form_database_password'),
          key: 'plain_password'
        }
      ]
    }
  ]
}
// 数据源图标
export const getConnectionIcon = row => {
  const token = Cookie.get('token')
  if (row.pdkType) {
    return `/api/pdk/icon?access_token=${token}&pdkHash=${row.pdkHash}`
  }
  return getConnectionTypeDialogImg(row.database_type || row.databaseType)
}
