const mutations = {
  // 任务调度
  tasks(state, payload) {
    state.tasks = payload
  },
  // 数据采集（旧版）
  dataCollect(state, payload) {
    state.dataCollect = payload
  },
  // 数据规则
  dataRules(state, payload) {
    state.dataRules = payload
  },
  // 生命周期
  ttl(state, payload) {
    state.ttl = payload
  },
  // 数据质量
  dataQuality(state, payload) {
    state.dataQuality = payload
  },
  // 数据目录
  metadataDefinition(state, payload) {
    state.metadataDefinition = payload
  },
  // 数据源
  connections(state, payload) {
    state.connections = payload
  },
  // 创建数据源
  createConnection(state, payload) {
    state.createConnection = payload
  },
  // api服务器
  apiServer(state, payload) {
    state.apiServer = payload
  },
  // api客户端
  application(state, payload) {
    state.application = payload
  },
  // api统计分析
  apiAnalysis(state, payload) {
    state.apiAnalysis = payload
  },
  // api数据浏览
  apiDataExplorer(state, payload) {
    state.apiDataExplorer = payload
  },
  // api发布
  apiModules(state, payload) {
    state.apiModules = payload
  },
  dataFlows(state, payload) {
    state.dataFlows = payload
  },
  delDataFlows(state, payload) {
    state.dataFlows = payload
  },
  tableSelector(state, payload) {
    state.tableSelectorSearch = payload
  },
  tableFlows(state, payload) {
    state.tableFlows = payload
  },
  notification(state, payload) {
    state.notification = payload
  },
  catalogueKey(state, key) {
    state.catalogueKey = key
  },
}
export default mutations
