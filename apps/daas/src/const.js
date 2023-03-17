import i18n from '@/i18n'

let directionMap = {
  unidirectional: '单向同步',
  bidirectional: '双向同步'
}
let topologyMap = {}
for (const dKey in directionMap) {
  let dValue = directionMap[dKey]
  topologyMap[dKey] = `${dValue}`
}
export const TOPOLOGY_MAP = topologyMap,
  TASK_STATUS_MAP = {
    running: { text: i18n.t('public_status_running'), icon: 'yunxingzhong', type: 'success' },
    paused: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong' },
    error: { text: i18n.t('public_status_error'), icon: 'cuowu', type: 'warning' },
    draft: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong' },
    scheduled: { text: i18n.t('public_status_starting'), icon: 'qidongzhong', type: 'success' },
    stopping: { text: i18n.t('public_status_stopping'), icon: 'tingzhizhong', type: 'success' },
    'force stopping': { text: i18n.t('public_status_force_stopping'), icon: 'qiangzhitingzhi', type: 'success' },
    finished: { text: i18n.t('public_status_finished'), icon: 'yiwancheng', type: 'success' }
  },
  SHARECDC_MAP = {
    running: { text: i18n.t('public_status_running'), icon: 'running', type: 'success' },
    stop: { text: i18n.t('public_status_stop'), icon: 'stop' },
    error: { text: i18n.t('public_status_error'), icon: 'error', type: 'warning' },
    edit: { text: i18n.t('public_status_edit'), icon: 'edit' },
    scheduling: { text: i18n.t('public_status_starting'), icon: 'scheduling', type: 'success' },
    stopping: { text: i18n.t('public_status_stopping'), icon: 'stopping', type: 'warning' }
    // pause: { text: '强制停止中', icon: 'pause', type: 'success' },
    //complete: { text: '已完成', icon: 'complete', type: 'success' }
  },
  CONNECTION_STATUS_MAP = {
    ready: { text: i18n.t('public_status_ready'), type: 'success' },
    invalid: { text: i18n.t('public_status_invalid'), type: 'danger' },
    testing: { text: i18n.t('public_status_testing'), type: 'warning' }
  },
  MILESTONE_STATUS_MAP = {
    waiting: { text: i18n.t('milestone_list_status_waiting'), icon: 'daizhixing' },
    running: { text: i18n.t('task_info_progress'), icon: 'jinxingzhong' },
    error: { text: i18n.t('public_status_error'), icon: 'cuowu' },
    finish: { text: i18n.t('public_status_finished'), icon: 'yiwancheng' },
    paused: { text: i18n.t('public_status_stopping'), icon: 'yizanting' }
  },
  ETL_STATUS_MAP = {
    running: { text: i18n.t('public_status_running'), type: 'success' },
    not_running: { text: i18n.t('task_status_not_running'), type: 'disable' },
    error: { text: i18n.t('public_status_error'), type: 'danger' }
  },
  ETL_SUB_STATUS_MAP = {
    ready: { text: i18n.t('public_status_wait_run'), type: 'ready' },
    edit: { text: i18n.t('public_status_edit'), type: 'edit' },
    scheduling: { text: i18n.t('public_status_starting'), type: 'scheduling' },
    schedule_failed: { text: i18n.t('public_status_error'), type: 'schedule_failed' },
    wait_run: { text: i18n.t('public_status_starting'), type: 'wait_run' },
    running: { text: i18n.t('public_status_running'), type: 'running' },
    stopping: { text: i18n.t('public_status_stopping'), type: 'stopping' },
    stop: { text: i18n.t('public_status_stop'), type: 'stop' },
    complete: { text: i18n.t('public_status_complete'), type: 'complete' },
    error: { text: i18n.t('public_status_error'), type: 'error' }
  },
  MIGRATE_STATUS_MAP = {
    running: {
      text: i18n.t('public_status_running'),
      icon: 'right-fill',
      type: 'success'
    },
    paused: {
      text: i18n.t('dataFlow_status_paused'),
      icon: 'wait-fill',
      type: 'primary'
    },
    error: {
      text: i18n.t('public_status_error'),
      icon: 'warning',
      type: 'warning'
    },
    draft: {
      text: i18n.t('public_status_edit'),
      icon: 'wait-fill',
      type: 'primary'
    },
    scheduled: {
      text: i18n.t('public_status_starting'),
      icon: 'loading',
      type: 'success'
    },
    stopping: {
      text: i18n.t('public_status_stopping'),
      icon: 'loading',
      type: 'success'
    },
    'force stopping': {
      text: i18n.t('public_status_force_stopping'),
      icon: 'loading',
      type: 'success'
    }
  },
  SPEC_MAP = {
    micro: '小规格',
    small: '标准规格',
    medium: '中规格',
    large: '大规格'
  },
  CHARGE_MAP = {
    '1,month': '包月计费',
    '2,1': '按量计费'
  },
  SUPPORT_DB = [
    'mysql',
    'oracle',
    'mongodb',
    'sqlserver',
    'postgres',
    'elasticsearch',
    'redis',
    'file',
    'db2',
    'kafka',
    'mariadb',
    'mysql pxc',
    'jira',
    'dameng'
    // 'gbase-8s',
    // 'sybase ase',
    // 'gaussdb200',
    // 'dummy db',
    // 'rest api',
    // 'custom_connection',
    // 'gridfs'
  ] //目前白名单,
export const DATA_NODE_TYPES = [
  'table',
  'view',
  'collection',
  'mongo_view',
  'hive',
  'kudu',
  'dummy db',
  'gridfs',
  'file',
  'elasticsearch',
  'rest api',
  'redis',
  'field_processor',
  'aggregation_processor',
  'js_processor',
  'row_filter_processor',
  'java_processor',
  'hive',
  'hana',
  'kafka',
  'dameng',
  'clickhouse',
  'kudu',
  'hbase',
  'mq',
  'kafka',
  'adb_mysql',
  'tcp_udp',
  'cache_lookup_processor',
  'custom_connection',
  'mem_cache',
  'logminer',
  'protobuf_convert_processor',
  'hazelcast_cloud_cluster'
]
