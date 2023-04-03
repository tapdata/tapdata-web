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

import ApiServer from './ApiServer'
const apiServerApi = new ApiServer()

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

import SharedCache from './SharedCache'
const sharedCacheApi = new SharedCache()

import Licenses from './Licenses'
const licensesApi = new Licenses()

import Inspect from './Inspects'
const inspectApi = new Inspect()

import InspectDetails from './InspectDetails'
const inspectDetailsApi = new InspectDetails()

import InspectResults from './InspectResults'
const inspectResultsApi = new InspectResults()

import TimeStamp from './TimeStamp'
const timeStampApi = new TimeStamp()

import RoleMappings from './RoleMapping'
const roleMappingsApi = new RoleMappings()

import CustomNode from './CustomNode'
const customNodeApi = new CustomNode()

import CustomerJobLogs from './CustomerJobLogs'
const customerJobLogsApi = new CustomerJobLogs()

import Permissions from './Permissions'
const permissionsApi = new Permissions()

import TypeMapping from './TypeMapping'
const typeMappingApi = new TypeMapping()

import Logs from './Logs'
const logsApi = new Logs()

import Dictionaries from './Dictionary'
const dictionariesApi = new Dictionaries()

import MetadataTransformer from './MetadataTransformer'
const metadataTransformerApi = new MetadataTransformer()

import Function from './Function'
const functionApi = new Function()

import MonitoringLogs from './MonitoringLogs'
const monitoringLogsApi = new MonitoringLogs()

import Discovery from './Discovery'
const discoveryApi = new Discovery()

import AlarmRule from './AlarmRule'
const alarmRuleApi = new AlarmRule()

import ExternalStorage from './ExternalStorage'
const externalStorageApi = new ExternalStorage()

import Alarm from './Alarm'
const alarmApi = new Alarm()

import Proxy from './Proxy'
const proxyApi = new Proxy()

import Paid from './Paid'
const paidApi = new Paid()

import TCM from './Tcm'
const tcmApi = new TCM()

import LiveDataPlatform from './LiveDataPlatform'
const liveDataPlatformApi = new LiveDataPlatform()

import LDP from './LDP'
const ldpApi = new LDP()

import ShareCdcTableMetrics from './ShareCdcTableMetrics'
const shareCdcTableMetricsApi = new ShareCdcTableMetrics()

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
  apiServerApi,
  roleApi,
  workerApi,
  settingsApi,
  apiCallsApi,
  applicationApi,
  clusterApi,
  sharedCacheApi,
  licensesApi,
  inspectApi,
  inspectDetailsApi,
  inspectResultsApi,
  timeStampApi,
  roleMappingsApi,
  customNodeApi,
  customerJobLogsApi,
  permissionsApi,
  typeMappingApi,
  logsApi,
  dictionariesApi,
  metadataTransformerApi,
  functionApi,
  monitoringLogsApi,
  discoveryApi,
  alarmRuleApi,
  alarmApi,
  externalStorageApi,
  proxyApi,
  paidApi,
  tcmApi,
  shareCdcTableMetricsApi,
  liveDataPlatformApi,
  ldpApi
}
export * from './ApiClient'

export { CancelToken }

export default Http
