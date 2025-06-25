const isCommunity = import.meta.env.VUE_APP_MODE === 'community'

export const MENU = [
  { name: 'dashboard', icon: 'gongzuotai', alias: 'page_title_dashboard' },
  {
    name: 'migrateList',
    icon: 'migrate',
    code: 'v2_data_replication',
    parent: 'migrate',
  },
  {
    name: 'dataflowList',
    icon: 'task',
    code: 'v2_data_flow',
    parent: 'dataflow',
  },
  {
    name: 'dataVerificationList',
    icon: 'data-validation',
    code: 'v2_data_check',
    parent: 'dataVerification',
  },
  {
    name: 'dataConsole',
    icon: 'process-platform',
    code: 'v2_data-console',
    hidden: isCommunity,
  },

  {
    name: 'connectionsList',
    icon: 'agent',
    group: 'bottom',
    code: 'v2_datasource_menu',
    parent: 'connections',
  },
  {
    name: 'dataService',
    label: 'page_title_data_service',
    icon: 'apiServer_navbar',
    group: 'bottom',
    code: 'v2_data-server',
    hidden: isCommunity,
    children: [
      {
        name: 'apiApplication',
        code: 'v2_api-application',
        parent: 'apiApplication',
      },
      { name: 'dataServer', code: 'v2_data-server-list', parent: 'dataServer' },
      {
        name: 'dataServerAuditList',
        code: 'v2_data_server_audit',
        parent: 'dataServerAudit',
      },
      { name: 'apiMonitor', code: 'v2_api_monitor', parent: 'apiMonitor' },
      { name: 'apiClient', code: 'v2_api-client', parent: 'apiClient' },
      { name: 'apiServer', code: 'v2_api-servers', parent: 'apiServer' },
    ],
  },
  {
    name: 'advancedFeatures',
    label: 'page_title_advanced_features',
    icon: 'vip-one',
    group: 'bottom',
    code: 'v2_advanced_features',
    children: [
      {
        name: 'sharedCacheList',
        code: 'v2_shared_cache',
        parent: 'sharedCache',
      }, // PDK暂时不支持共享缓存，暂时屏蔽
      {
        name: 'functionList',
        code: 'v2_function_management',
        parent: 'function',
      },
      { name: 'customNodeList', code: 'v2_custom_node', parent: 'customNode' },
      {
        name: 'sharedMiningList',
        code: 'v2_log_collector',
        parent: 'sharedMining',
      },
      { name: 'HeartbeatTableList', code: '', parent: 'heartbeatTable' },
    ],
  },
  {
    name: 'discovery',
    label: 'page_title_data_discovery',
    icon: 'dataDiscovery_navbar',
    group: 'bottom',
    code: 'v2_data_discovery',
    hidden: true, // 放开了数据面板，隐藏数据发现
    children: [
      { name: 'catalogueList', code: 'v2_data_catalogue', parent: 'catalogue' },
      // { name: 'objectList', code: 'v2_data_object', parent: 'object' },
    ],
  },

  {
    name: 'system',
    label: 'page_title_system',
    icon: 'setting',
    group: 'bottom',
    code: 'v2_system-management',
    children: [
      { name: 'roleList', code: 'v2_role_management', parent: 'roles' },
      { name: 'users', code: 'v2_user_management_menu', parent: 'users' },
      {
        name: 'clusterManagement',
        code: 'v2_cluster-management_menu',
        hidden: isCommunity,
      },
      { name: 'externalStorage', code: 'v2_external-storage_menu' },
    ],
  },
]

export const DropdownList = [
  { name: 'account', label: 'app_account' },
  { name: 'version', label: 'app_version' },
  { name: 'license', label: 'page_title_license' },
  { name: 'home', label: 'app_home' },
  { name: 'signOut', label: 'app_signOut' },
]

export const SettingList = [
  {
    icon: 'bells',
    name: 'notify_setting',
    key: 'notificationSetting',
    size: 20,
  },
  {
    icon: 'alert-filled',
    name: 'daas_setting_settingcenter_gaojingshezhi',
    key: 'alarmSetting',
    size: 20,
  },
  {
    icon: 'webhook',
    name: 'webhook_alerts',
    key: 'webhookAlerts',
    size: 20,
  },
  {
    icon: 'account',
    name: 'account_accountSettings',
    key: 'accountSetting',
    size: 20,
  },
]
