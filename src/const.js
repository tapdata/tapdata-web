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
    Creating: { text: '待部署', color: '#FFB318' },
    Running: { text: '运行中', color: '#52C41A' },
    Stopping: { text: '停止中', color: '#F5222D' },
    Stopped: { text: '离线', color: 'rgba(0, 0, 0, 0.18)' }
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
    ready: { text: '有效', color: '#52C41A' },
    invalid: { text: '失效', color: '#F5222D' },
    testing: { text: '测试中', color: '#FFB318' }
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
