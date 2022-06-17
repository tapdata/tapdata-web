import Http, { CancelToken } from './http'

import Connections from './connections'
const ConnectionsApi = new Connections()

import DatabaseTypes from './databaseTypes'
const DatabaseTypesApi = new DatabaseTypes()

import Logcollector from './logcollector'
const LogcollectorApi = new Logcollector()

import pdk from './pdk'
const pdkApi = new pdk()

import Task from './task'
const TaskApi = new Task()

import SubTask from './subTask'
const SubTaskApi = new SubTask()

import UserLogs from './userLogs'
const UserLogsApi = new UserLogs()

import Measurement from './measurement'
const MeasurementApi = new Measurement()

import DataFlowInsights from './dataFlowInsights'
const DataFlowInsightsApi = new DataFlowInsights()

import DataFlows from './dataFlows'
const DataFlowsApi = new DataFlows()

import JavascriptFunctions from './javascriptFunctions'
const JavascriptFunctionsApi = new JavascriptFunctions()

import MetadataInstances from './metadataInstances'
const MetadataInstancesApi = new MetadataInstances()

import MetadataDefinitions from './metadataDefinitions'
const MetadataDefinitionsApi = new MetadataDefinitions()

import UserGroups from './userGroup'
const UserGroupsApi = new UserGroups()

import file from './file'
const fileApi = new file()

import ScheduleTasks from './scheduleTasks'
const ScheduleTasksApi = new ScheduleTasks()

import PreviewData from './previewData'
const PreviewDataApi = new PreviewData()

import DataRule from './dataRule'
const DataRuleApi = new DataRule()

import Notification from './notification'
const NotificationApi = new Notification()

import Users from './users'
const UsersApi = new Users()

import ApiMonitor from './apiMonitor'
const ApiMonitorApi = new ApiMonitor()

import Modules from './modules'
const ModulesApi = new Modules()

import ApiServers from './apiServer'
const ApiServersApi = new ApiServers()

import Role from './role'
const RoleApi = new Role()

import Worker from './workers'
const WorkerApi = new Worker()

import Settings from './settings'
const settingsApi = new Settings()

export {
  ConnectionsApi,
  DatabaseTypesApi,
  LogcollectorApi,
  pdkApi,
  TaskApi,
  SubTaskApi,
  UserLogsApi,
  MeasurementApi,
  DataFlowInsightsApi,
  DataFlowsApi,
  JavascriptFunctionsApi,
  fileApi,
  MetadataInstancesApi,
  MetadataDefinitionsApi,
  UserGroupsApi,
  ScheduleTasksApi,
  PreviewDataApi,
  DataRuleApi,
  NotificationApi,
  UsersApi,
  ApiMonitorApi,
  ModulesApi,
  ApiServersApi,
  RoleApi,
  WorkerApi,
  settingsApi
}
export * from './databaseTypes'
export * from './dataFlows'
export * from './metadataInstances'
export * from './task'
export * from './Tcm'
export * from './TypeMapping'
export * from './CustomNode'
export * from './Cluster'
export * from './Function'
export * from './MetadataTransformer'
export * from './metadataDefinitions'
export * from './users'
export * from './settings'
export * from './apiMonitor'
export * from './ApiCalls'
export * from './ApiClient'
export * from './apiServer'
export * from './Application'
export * from './ConnectionFormSchemas'
export * from './CustomerJobLogs'
export * from './DataFlowFormSchemas'
export * from './dataFlowInsights'
export * from './DataQuality'
export * from './dataRule'
export * from './DataRules'
export * from './Dictionary'
export * from './insights'
export * from './InspectDetails'
export * from './InspectResults'
export * from './Inspects'
export * from './javascriptFunctions'
export * from './Licenses'
export * from './LineageGraphs'
export * from './logcollector'
export * from './logs'
export * from './dataRule'
export * from './measurement'
export * from './Metrics'
export * from './modules'
export * from './nodeConfigs'
export * from './notification'
export * from './pdk'
export * from './Permissions'
export * from './previewData'
export * from './role'
export * from './roleMapping'
export * from './scheduleTasks'
export * from './shareCache'
export * from './subTask'
export * from './TaskHistories'
export * from './TimeStamp'
export * from './userGroup'
export * from './userLogs'
export * from './validationResults'

export { CancelToken }

export default Http
