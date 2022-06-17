import Http, { CancelToken } from './Http'

import Connections from './Connections'
const connectionsApi = new Connections()

import DatabaseTypes from './DatabaseTypes'
const databaseTypesApi = new DatabaseTypes()

import Logcollector from './Logcollector'
const logcollectorApi = new Logcollector()

import PDK from './PDK'
const pdkApi = new PDK()

import Task from './Task'
const taskApi = new Task()

import SubTask from './SubTask'
const subtaskApi = new SubTask()

import UserLogs from './UserLogs'
const userLogsApi = new UserLogs()

import Measurement from './Measurement'
const measurementApi = new Measurement()

import DataFlowInsights from './DataFlowInsights'
const dataFlowInsightsApi = new DataFlowInsights()

import DataFlows from './DataFlows'
const dataFlowsApi = new DataFlows()

import JavascriptFunctions from './JavascriptFunctions'
const javascriptFunctionsApi = new JavascriptFunctions()

import MetadataInstances from './MetadataInstances'
const metadataInstancesApi = new MetadataInstances()

import MetadataDefinitions from './MetadataDefinitions'
const metadataDefinitionsApi = new MetadataDefinitions()

import UserGroups from './UserGroup'
const userGroupsApi = new UserGroups()

import File from './File'
const fileApi = new File()

import ScheduleTasks from './ScheduleTasks'
const scheduleTasksApi = new ScheduleTasks()

import PreviewData from './PreviewData'
const previewDataApi = new PreviewData()

import DataRule from './DataRule'
const dataRuleApi = new DataRule()

import Notification from './Notification'
const notificationApi = new Notification()

import Users from './Users'
const usersApi = new Users()

import ApiMonitor from './ApiMonitor'
const apiMonitorApi = new ApiMonitor()

import Modules from './Modules'
const modulesApi = new Modules()

import ApiServers from './ApiServer'
const apiServersApi = new ApiServers()

import Role from './Role'
const roleApi = new Role()

import Worker from './Workers'
const workerApi = new Worker()

import Settings from './Settings'
const settingsApi = new Settings()

import ApiCalls from './ApiCalls'
const apiCallsApi = new ApiCalls()

import Application from './Application'
const applicationApi = new Application()

import Cluster from './Cluster'
const clusterApi = new Cluster()

import SharedCache from './shareCache'
const sharedCacheApi = new SharedCache()

import Licenses from './Licenses'
const licensesApi = new Licenses()

export {
  connectionsApi,
  databaseTypesApi,
  logcollectorApi,
  pdkApi,
  taskApi,
  subtaskApi,
  userLogsApi,
  measurementApi,
  dataFlowInsightsApi,
  dataFlowsApi,
  javascriptFunctionsApi,
  fileApi,
  metadataInstancesApi,
  metadataDefinitionsApi,
  userGroupsApi,
  scheduleTasksApi,
  previewDataApi,
  dataRuleApi,
  notificationApi,
  usersApi,
  apiMonitorApi,
  modulesApi,
  apiServersApi,
  roleApi,
  workerApi,
  settingsApi,
  apiCallsApi,
  applicationApi,
  clusterApi,
  sharedCacheApi,
  licensesApi
}
export * from './DatabaseTypes'
export * from './DataFlows'
export * from './MetadataInstances'
export * from './Task'
export * from './Tcm'
export * from './TypeMapping'
export * from './CustomNode'
export * from './Cluster'
export * from './Function'
export * from './MetadataTransformer'
export * from './MetadataDefinitions'
export * from './Users'
export * from './ApiMonitor'
export * from './Settings'
export * from './ApiCalls'
export * from './ApiClient'
export * from './ApiServer'
export * from './Application'
export * from './ConnectionFormSchemas'
export * from './CustomerJobLogs'
export * from './DataFlowFormSchemas'
export * from './DataFlowInsights'
export * from './DataQuality'
export * from './DataRule'
export * from './DataRules'
export * from './Dictionary'
export * from './insights'
export * from './InspectDetails'
export * from './InspectResults'
export * from './Inspects'
export * from './JavascriptFunctions'
export * from './Licenses'
export * from './LineageGraphs'
export * from './Logcollector'
export * from './logs'
export * from './DataRule'
export * from './Measurement'
export * from './Metrics'
export * from './Modules'
export * from './nodeConfigs'
export * from './Notification'
export * from './PDK'
export * from './Permissions'
export * from './PreviewData'
export * from './Role'
export * from './roleMapping'
export * from './ScheduleTasks'
export * from './shareCache'
export * from './SubTask'
export * from './TaskHistories'
export * from './TimeStamp'
export * from './UserGroup'
export * from './UserLogs'
export * from './validationResults'

export { CancelToken }

export default Http
