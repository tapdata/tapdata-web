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
    Creating: { text: '待部署', icon: 'creating', type: 'warning' },
    Running: { text: '运行中', icon: 'right-fill', type: 'success' },
    Stopping: { text: '停止中', icon: 'loading', type: 'success' },
    Stopped: { text: '离线', icon: 'warning', type: 'warning' }
  },
  TASK_STATUS_MAP = {
    running: { text: '运行中', icon: 'right', type: 'success' },
    paused: { text: '待启动', icon: 'wait-fill-color' },
    error: { text: '错误', icon: 'warning', type: 'warning' },
    draft: { text: '待启动', icon: 'wait-fill-color' },
    scheduled: { text: '启动中', icon: 'loading', type: 'success' },
    stopping: { text: '停止中', icon: 'loading', type: 'success' },
    'force stopping': { text: '强制停止中', icon: 'loading', type: 'success' }
  },
  CONNECTION_STATUS_MAP = {
    ready: { text: '有效', icon: 'success-fill-color', type: 'success' },
    invalid: { text: '失效', icon: 'error', type: 'danger' },
    testing: { text: '测试中', icon: 'loading', type: 'success' }
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
