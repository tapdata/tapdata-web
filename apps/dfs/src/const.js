import i18n from '@/i18n'
let directionMap = {
  unidirectional: i18n.t('dfs_src_const_danxiangtongbu'),
  bidirectional: i18n.t('dfs_src_const_shuangxiangtongbu')
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
    micro: i18n.t('dfs_src_const_xiaoguige'),
    small: i18n.t('dfs_src_const_biaozhunguige'),
    medium: i18n.t('dfs_src_const_zhongguige'),
    large: i18n.t('dfs_src_const_daguige')
  },
  CHARGE_MAP = {
    '1,month': i18n.t('dfs_src_const_baoyuejifei'),
    '2,1': i18n.t('dfs_src_const_anliangjifei')
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
