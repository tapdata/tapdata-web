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
    Creating: { text: i18n.t('agent_status_creating'), type: 'warning' },
    Running: { text: i18n.t('agent_status_running'), type: 'success' },
    Stopping: { text: i18n.t('agent_status_stopping'), type: 'danger' },
    Stopped: { text: i18n.t('agent_status_stopped'), type: 'disable' }
  },
  TASK_STATUS_MAP = {
    running: { text: i18n.t('task_status_running'), icon: 'yunxingzhong', type: 'success' },
    paused: { text: i18n.t('task_status_paused'), icon: 'daiqidong', type: 'warning' },
    error: { text: i18n.t('task_status_error'), icon: 'cuowu', type: 'danger' },
    draft: { text: i18n.t('task_status_draft'), icon: 'daiqidong', type: 'warning' },
    scheduled: { text: i18n.t('task_status_scheduled'), icon: 'qidongzhong' },
    stopping: { text: i18n.t('task_status_stopping'), icon: 'tingzhizhong', type: 'info' },
    'force stopping': { text: i18n.t('task_status_force_stopping'), icon: 'qiangzhitingzhi', type: 'danger' },
    finished: { text: i18n.t('task_status_finished'), icon: 'yiwancheng', type: 'success' }
  },
  CONNECTION_STATUS_MAP = {
    ready: { text: i18n.t('connection_list_efficient'), type: 'success' },
    invalid: { text: i18n.t('connection_list_invalidation'), type: 'danger' },
    testing: { text: i18n.t('connection_list_testing'), type: 'warning' }
  },
  CONNECTION_STATUS_MAP_EN = {
    ready: { text: 'Ready', type: 'success' },
    invalid: { text: 'Invalid', type: 'danger' },
    testing: { text: 'Testing', type: 'warning' }
  },
  MILESTONE_STATUS_MAP = {
    waiting: { text: i18n.t('task_milestone_waiting'), icon: 'daizhixing' },
    running: { text: i18n.t('task_milestone_running'), icon: 'jinxingzhong' },
    error: { text: i18n.t('task_milestone_error'), icon: 'cuowu' },
    finish: { text: i18n.t('task_milestone_finish'), icon: 'yiwancheng' },
    paused: { text: i18n.t('task_milestone_paused'), icon: 'yizanting' }
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
