import DataPermission from './DataPermission'

import Discovery from './Discovery'

import ExternalStorage from './ExternalStorage'

import File from './File'

import Function from './Function'

import Http, { CancelToken, isCancel } from './Http'

import InspectDetails from './InspectDetails'

import InspectResults from './InspectResults'

import Inspect from './Inspects'

import JavascriptFunctions from './JavascriptFunctions'

import LDP from './LDP'

import Licenses from './Licenses'

import Lineage from './Lineage'

import LiveDataPlatform from './LiveDataPlatform'

import Logcollector from './Logcollector'

import Logs from './Logs'

import Measurement from './Measurement'

import MetadataDefinitions from './MetadataDefinitions'

import MetadataInstances from './MetadataInstances'

import MonitoringLogs from './MonitoringLogs'

import PDK from './PDK'

import Permissions from './Permissions'

import PreviewData from './PreviewData'

import Proxy from './Proxy'

import PythonFunctions from './PythonFunctions'

import Role from './Role'

import RoleMappings from './RoleMapping'

import SharedCache from './SharedCache'

import Task from './Task'

import TypeMapping from './TypeMapping'

import UserGroups from './UserGroup'

import Users from './Users'

import Webhook from './Webhook'

import Worker from './Workers'

const logcollectorApi = new Logcollector()

const pdkApi = new PDK()

const taskApi = new Task()

const measurementApi = new Measurement()

const javascriptFunctionsApi = new JavascriptFunctions()

const pythonFunctionsApi = new PythonFunctions()

const metadataInstancesApi = new MetadataInstances()

const metadataDefinitionsApi = new MetadataDefinitions()

const userGroupsApi = new UserGroups()

const fileApi = new File()

const previewDataApi = new PreviewData()

const usersApi = new Users()

const roleApi = new Role()

const workerApi = new Worker()

const sharedCacheApi = new SharedCache()

const licensesApi = new Licenses()

const inspectApi = new Inspect()

const inspectDetailsApi = new InspectDetails()

const inspectResultsApi = new InspectResults()

const roleMappingsApi = new RoleMappings()

const permissionsApi = new Permissions()

const typeMappingApi = new TypeMapping()

const logsApi = new Logs()

const functionApi = new Function()

const monitoringLogsApi = new MonitoringLogs()

const discoveryApi = new Discovery()

const externalStorageApi = new ExternalStorage()

const proxyApi = new Proxy()

const liveDataPlatformApi = new LiveDataPlatform()

const ldpApi = new LDP()

const lineageApi = new Lineage()

const dataPermissionApi = new DataPermission()

const webhookApi = new Webhook()

export {
  dataPermissionApi,
  discoveryApi,
  externalStorageApi,
  fileApi,
  functionApi,
  inspectApi,
  inspectDetailsApi,
  inspectResultsApi,
  javascriptFunctionsApi,
  ldpApi,
  licensesApi,
  lineageApi,
  liveDataPlatformApi,
  logcollectorApi,
  logsApi,
  measurementApi,
  metadataDefinitionsApi,
  metadataInstancesApi,
  monitoringLogsApi,
  pdkApi,
  permissionsApi,
  previewDataApi,
  proxyApi,
  pythonFunctionsApi,
  roleApi,
  roleMappingsApi,
  sharedCacheApi,
  taskApi,
  typeMappingApi,
  userGroupsApi,
  usersApi,
  webhookApi,
  workerApi,
}

export { CancelToken, isCancel }

export default Http

export * from './request'
export * from './core'

export { useRequest } from 'vue-request'
