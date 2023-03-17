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
  INSTANCE_STATUS_MAP = {
    Creating: { text: i18n.t('public_agent_status_to_be_deployed'), type: 'warning' },
    Running: { text: i18n.t('public_status_running'), type: 'success' },
    Stopping: { text: i18n.t('public_status_stopping'), type: 'danger' },
    Stopped: { text: i18n.t('public_agent_status_offline'), type: 'disable' }
  },
  TASK_STATUS_MAP = {
    running: { text: i18n.t('public_status_running'), icon: 'yunxingzhong', type: 'success' },
    paused: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong', type: 'warning' },
    error: { text: i18n.t('public_status_error'), icon: 'cuowu', type: 'danger' },
    draft: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong', type: 'warning' },
    scheduled: { text: i18n.t('public_status_starting'), icon: 'qidongzhong' },
    stopping: { text: i18n.t('public_status_stopping'), icon: 'tingzhizhong', type: 'info' },
    'force stopping': { text: i18n.t('public_status_force_stopping'), icon: 'qiangzhitingzhi', type: 'danger' },
    finished: { text: i18n.t('public_status_finished'), icon: 'yiwancheng', type: 'success' }
  },
  CONNECTION_STATUS_MAP = {
    ready: { text: i18n.t('public_status_ready'), type: 'success' },
    invalid: { text: i18n.t('public_status_invalid'), type: 'danger' },
    testing: { text: i18n.t('public_status_testing'), type: 'warning' }
  },
  CONNECTION_STATUS_MAP_EN = {
    ready: { text: 'Ready', type: 'success' },
    invalid: { text: 'Invalid', type: 'danger' },
    testing: { text: 'Testing', type: 'warning' }
  },
  AGENT_STATUS_MAP_EN = {
    0: { text: i18n.t('dfs_instance_details_shangchuanzhong'), type: 'warning' }, //上传中
    1: { text: i18n.t('dfs_instance_instance_status_success'), type: 'success' }, //上传成功
    2: { text: i18n.t('dfs_instance_instance_status_false'), type: 'danger' }, //上传失败
    3: { text: i18n.t('dfs_instance_details_status_invalid'), type: 'danger' } //失效
  },
  MILESTONE_STATUS_MAP = {
    waiting: { text: i18n.t('task_milestone_waiting'), icon: 'daizhixing', type: 'warning' },
    running: { text: i18n.t('task_milestone_running'), icon: 'jinxingzhong', type: 'success' },
    error: { text: i18n.t('public_status_error'), icon: 'cuowu', type: 'danger' },
    finish: { text: i18n.t('public_status_finished'), icon: 'yiwancheng', type: 'success' },
    paused: { text: i18n.t('task_milestone_paused'), icon: 'yizanting', type: 'info' }
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
