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
    Creating: { text: '待部署', type: 'warning' },
    Running: { text: '运行中', type: 'success' },
    Stopping: { text: '停止中', type: 'danger' },
    Stopped: { text: '离线', type: 'disable' }
  },
  TASK_STATUS_MAP = {
    running: { text: '运行中', icon: 'yunxingzhong', type: 'success' },
    paused: { text: '待启动', icon: 'daiqidong' },
    error: { text: '错误', icon: 'cuowu', type: 'warning' },
    draft: { text: '待启动', icon: 'daiqidong' },
    scheduled: { text: '启动中', icon: 'qidongzhong', type: 'success' },
    stopping: { text: '停止中', icon: 'tingzhizhong', type: 'success' },
    'force stopping': { text: '强制停止中', icon: 'qiangzhitingzhi', type: 'success' },
    finished: { text: '已完成', icon: 'yiwancheng', type: 'success' }
  },
  CONNECTION_STATUS_MAP = {
    ready: { text: '有效', type: 'success' },
    invalid: { text: '失效', type: 'danger' },
    testing: { text: '测试中', type: 'warning' }
  },
  MILESTONE_STATUS_MAP = {
    waiting: { text: '待执行', icon: 'daizhixing' },
    running: { text: '进行中', icon: 'jinxingzhong' },
    error: { text: '错误', icon: 'cuowu' },
    finish: { text: '已完成', icon: 'yiwancheng' },
    paused: { text: '已暂停', icon: 'yizanting' }
  },
  ETL_STATUS_MAP = {
    edit: { text: '编辑中', type: 'primary' },
    start: { text: '启动中', type: 'success' },
    running: { text: '运行中', type: 'success' },
    stop: { text: '已停止', type: 'danger' },
    paused: { text: '暂停', type: 'warning' }
  },
  ETL_SUB_STATUS_MAP = {
    edit: { text: '编辑中', type: 'primary' },
    scheduling: { text: '启动中', type: 'success' },
    schedule_failed: { text: '错误', type: 'warning' },
    wait_run: { text: '待启动', type: 'success' },
    running: { text: '运行中', type: 'success' },
    pausing: { text: ' 暂停中' },
    stopping: { text: '停止中', type: 'success' },
    paused: { text: '暂停', type: 'warning' },
    stop: { text: '已停止', type: 'danger' },
    complete: { text: '已完成', type: 'primary' },
    error: { text: '错误', type: 'warning' }
  },
  MIGRATE_STATUS_MAP = {
    running: {
      text: i18n.t('dataFlow.status.running'),
      icon: 'right-fill',
      type: 'success'
    },
    paused: {
      text: i18n.t('dataFlow.status.paused'),
      icon: 'wait-fill',
      type: 'primary'
    },
    error: {
      text: i18n.t('dataFlow.status.error'),
      icon: 'warning',
      type: 'warning'
    },
    draft: {
      text: i18n.t('dataFlow.status.draft'),
      icon: 'wait-fill',
      type: 'primary'
    },
    scheduled: {
      text: i18n.t('dataFlow.status.scheduled'),
      icon: 'loading',
      type: 'success'
    },
    stopping: {
      text: i18n.t('dataFlow.status.stopping'),
      icon: 'loading',
      type: 'success'
    },
    'force stopping': {
      text: i18n.t('dataFlow.status.force_stopping'),
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
