const isCommunity = process.env.VUE_APP_MODE === 'community'

export const MENU = [
  { name: 'dashboard', icon: 'gongzuotai', alias: 'page_title_dashboard' },
  {
    name: 'dataConsole',
    icon: 'process-platform',
    code: 'v2_data-console',
    hidden: isCommunity
  },
  { name: 'connectionsList', icon: 'agent', code: 'v2_datasource_menu', parent: 'connections' },
  {
    name: 'dataPipeline',
    label: 'page_title_data_pipeline',
    icon: 'task',
    code: 'v2_data_pipeline',
    children: [
      { name: 'migrateList', code: 'v2_data_replication', parent: 'migrate' },
      { name: 'dataflowList', code: 'v2_data_flow', parent: 'dataflow' },
      { name: 'dataVerificationList', code: 'v2_data_check', parent: 'dataVerification' }
    ]
  },
  {
    name: 'advancedFeatures',
    label: 'page_title_advanced_features',
    icon: 'vip-one',
    code: 'v2_advanced_features',
    children: [
      { name: 'sharedCacheList', code: 'v2_shared_cache', parent: 'sharedCache' }, // PDK暂时不支持共享缓存，暂时屏蔽
      { name: 'functionList', code: 'v2_function_management', parent: 'function' },
      { name: 'customNodeList', code: 'v2_custom_node', parent: 'customNode' },
      { name: 'sharedMiningList', code: 'v2_log_collector', parent: 'sharedMining' },
      { name: 'HeartbeatTableList', code: '', parent: 'heartbeatTable' }
    ]
  },
  {
    name: 'discovery',
    label: 'page_title_data_discovery',
    icon: 'dataDiscovery_navbar',
    code: 'v2_data_discovery',
    hidden: true, // 放开了数据面板，隐藏数据发现
    children: [
      { name: 'catalogueList', code: 'v2_data_catalogue', parent: 'catalogue' }
      // { name: 'objectList', code: 'v2_data_object', parent: 'object' },
    ]
  },
  {
    name: 'dataService',
    label: 'page_title_data_service',
    icon: 'apiServer_navbar',
    code: 'v2_data-server',
    hidden: isCommunity,
    children: [
      { name: 'apiApplication', code: 'v2_api-application', parent: 'apiApplication' },
      { name: 'dataServer', code: 'v2_data-server-list', parent: 'dataServer' },
      { name: 'dataServerAuditList', code: 'v2_data_server_audit', parent: 'dataServerAudit' },
      { name: 'apiMonitor', code: 'v2_api_monitor', parent: 'apiMonitor' },
      { name: 'apiClient', code: 'v2_api-client', parent: 'apiClient' },
      { name: 'apiServer', code: 'v2_api-servers', parent: 'apiServer' }
    ]
  },
  {
    name: 'system',
    label: 'page_title_system',
    icon: 'setting',
    code: 'v2_system-management',
    children: [
      { name: 'roleList', code: 'v2_role_management', parent: 'roleList' },
      { name: 'users', code: 'v2_user_management_menu', parent: 'users' },
      { name: 'clusterManagement', code: 'v2_cluster-management_menu', hidden: isCommunity },
      { name: 'externalStorage', code: 'v2_external-storage_menu' }
    ]
  }
]

//   <ElDropdownItem command="account">{{ $t('app_account') }}</ElDropdownItem>
// <ElDropdownItem command="version">{{ $t('app_version') }}</ElDropdownItem>
// <ElDropdownItem command="license">{{ $t('page_title_license') }}</ElDropdownItem>
// <ElDropdownItem v-if="showHome" command="home">
//   {{ $t('app_home') }}
// </ElDropdownItem>
// <ElDropdownItem command="signOut">{{ $t('app_signOut') }}</ElDropdownItem>

export const DropdownList = [
  { name: 'account', label: 'app_account' },
  { name: 'version', label: 'app_version' },
  { name: 'license', label: 'page_title_license' },
  { name: 'home', label: 'app_home' },
  { name: 'signOut', label: 'app_signOut' }
]
