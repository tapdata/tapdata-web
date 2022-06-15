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

//数据源基础字段
export const defaultModel = {
  default: {
    id: '',
    name: '',
    connection_type: '',
    table_filter: ''
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
  ]
}
// 数据源图标
export const getConnectionIcon = pdkHash => {
  const token = Cookie.get('token')
  return `/api/pdk/icon?access_token=${token}&pdkHash=${pdkHash}`
}
