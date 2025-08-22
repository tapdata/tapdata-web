import Layout from '@/layouts/Layout.vue'
import NotifyLayout from '@/layouts/NotifyLayout.vue'
import SettingLayout from '@/layouts/SettingLayout.vue'

const FunctionForm = () => import('@/views/function/Form.vue')

const DagEditor = () => import('@tap/dag/src/Editor.vue')
const MigrationEditor = () => import('@tap/dag/src/MigrationEditor.vue')
const MigrationMonitor = () => import('@tap/dag/src/MigrationMonitor.vue')
const MigrationMonitorViewer = () =>
  import('@tap/dag/src/MigrationMonitorViewer.vue')
const DataCapture = () => import('@tap/dag/src/data-capture/DataCapture.vue')
const CustomNodeList = () =>
  import('@tap/business/src/views/custom-node/List.vue')
const NodeEditor = () => import('@tap/node-design/src/Editor.vue')
const ConnectionForm = () =>
  import('@tap/business/src/views/connections/DatabaseForm.vue')
const TaskList = () => import('@tap/business/src/views/task/TaskList.vue')
const ConnectionList = () =>
  import('@tap/business/src/views/connections/List.vue')
const MigrateList = () => import('@tap/business/src/views/task/MigrateList.vue')

const VerifyDetails = () => import('@tap/business/src/views/verify/Details.vue')

// 数据校验
const VerificationList = () =>
  import('@tap/business/src/views/verification/List.vue')

const VerificationDetails = () =>
  import('@tap/business/src/views/verification/Details.vue')
const VerificationForm = () =>
  import('@tap/business/src/views/verification/Form.vue')

const VerificationHistory = () =>
  import('@tap/business/src/views/verification/History.vue')

const VerificationResult = () =>
  import('@tap/business/src/views/verification/Result.vue')

//告警设置
const AlarmSetting = () =>
  import('@tap/business/src/views/setting/AlarmSetting.vue')

const SharedMiningList = () =>
  import('@tap/business/src/views/shared-mining/List.vue')

const DataServerList = () =>
  import('@tap/business/src/views/data-server/List.vue')

// 心跳任务
const HeartbeatTableList = () =>
  import('@tap/business/src/views/heartbeat-table/List.vue')

// 共享缓存
const SharedCacheList = () =>
  import('@tap/business/src/views/shared-cache/List.vue')

const SharedCacheForm = () =>
  import('@tap/business/src/views/shared-cache/Form.vue')

// 应用管理
const ApiApplicationList = () =>
  import('@tap/business/src/views/api-application/List.vue')

// 外存管理
const ExternalStorageList = () =>
  import('@tap/business/src/views/external-storage/List.vue')

// 告警通知
const AlarmNotification = () =>
  import('@tap/business/src/views/setting/AlarmNotification.vue')

// 数据加密
const DataEncryptionList = () =>
  import('@tap/business/src/views/data-encryption/List.vue')

export const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/Login'),
    title: 'tap.login',
  },
  {
    path: '/verificationEmail',
    name: 'verificationEmail',
    component: () => import('@/views/login/VerificationEmail'),
    meta: {
      title: 'tap.verificationEmail',
    },
  },
  {
    path: '/passwordReset',
    name: 'passwordReset',
    component: () => import('@/views/login/PasswordReset'),
    meta: {
      title: 'tap.passwordReset',
    },
  },
  {
    path: '/node/editor',
    name: 'NodeNew',
    component: NodeEditor,
  },
  {
    path: '/node/editor/:id',
    name: 'NodeEditor',
    component: NodeEditor,
  },
  {
    path: '/dataflow/editor',
    name: 'DataflowNew',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'v2_data_flow_dag_edit',
    },
  },
  {
    path: '/dataflow/editor/:id',
    name: 'DataflowEditor',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'v2_data_flow_edit',
    },
  },
  {
    path: '/dataflow/viewer/:id',
    name: 'DataflowViewer',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'v2_data_flow_details',
    },
  },
  {
    path: '/dataflow/monitor/:id',
    name: 'TaskMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_flow_monitor',
    },
  },

  {
    path: '/migrate/editor',
    name: 'MigrateCreate',
    component: MigrationEditor,
    meta: {
      title: 'page_title_data_copy',
      code: 'v2_data_replication_dag_edit',
    },
  },
  {
    path: '/migrate/editor/:id',
    name: 'MigrateEditor',
    component: MigrationEditor,
    meta: {
      title: 'page_title_data_copy',
      code: 'v2_data_replication_dag_edit',
    },
  },
  {
    path: '/migrate/viewer/:id',
    name: 'MigrateViewer',
    component: MigrationEditor,
    meta: {
      title: 'page_title_data_copy',
      code: 'v2_data_replication_details',
    },
  },
  {
    path: '/migrate/monitor/:id',
    name: 'MigrationMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor',
    },
  },
  {
    path: '/migrate/monitor-record/:id',
    name: 'MigrationMonitorViewer',
    component: MigrationMonitorViewer,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_record_monitor',
    },
  },
  {
    path: '/data-capture/:id',
    name: 'DataCapture',
    component: DataCapture,
  },
  {
    path: '/data-capture/:id',
    name: 'DataCapture',
    component: DataCapture,
  },
  {
    path: '/shared-mining/monitor/:id',
    name: 'SharedMiningMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor',
    },
  },
  {
    path: '/heartbeat/monitor/:id',
    name: 'HeartbeatMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor',
    },
  },
  {
    path: '/shared-cache/monitor/:id',
    name: 'SharedCacheMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor',
    },
  },

  /* ---------- 连接管理  ----------*/
  {
    path: '/connections',
    name: 'connections',
    component: Layout,
    redirect: {
      name: 'connectionsList',
    },
    meta: {
      title: 'page_title_connections',
    },
    children: [
      {
        path: '',
        name: 'connectionsList',
        component: ConnectionList,
        meta: {
          hideTitle: true,
          title: 'page_title_connections',
          code: 'v2_datasource_menu',
        },
      },
      {
        path: 'create',
        name: 'connectionCreate',
        component: ConnectionForm,
        meta: {
          title: 'page_title_connections_create',
          code: 'v2_datasource_creation',
        },
      },
      {
        path: ':id/edit',
        name: 'connectionsEdit',
        component: ConnectionForm,
        meta: {
          title: 'page_title_connections_edit',
          code: 'v2_datasource_edition',
        },
      },
    ],
  },

  /* ---------- 数据复制  ----------*/
  {
    path: '/migrate',
    name: 'migrate',
    component: Layout,
    redirect: {
      name: 'migrateList',
    },
    meta: {
      title: 'page_title_data_copy',
    },
    children: [
      {
        path: '',
        name: 'migrateList',
        component: MigrateList,
        meta: {
          hideTitle: true,
          title: 'page_title_data_copy',
          code: 'v2_data_replication',
        },
      },
    ],
  },

  /* ---------- 数据开发  ----------*/
  {
    path: '/dataflow',
    name: 'dataflow',
    component: Layout,
    redirect: {
      name: 'dataflowList',
    },
    meta: {
      title: 'page_title_data_develop',
    },
    children: [
      {
        path: '',
        name: 'dataflowList',
        component: TaskList,
        meta: {
          hideTitle: true,
          title: 'page_title_data_develop',
          code: 'v2_data_flow',
        },
      },
    ],
  },
  /* ---------- 数据校验  ----------*/
  {
    path: '/verify',
    name: 'verify',
    component: Layout,
    redirect: '/verify',
    meta: {
      title: 'page_title_data_verify',
      doNotJump: true,
    },
    children: [
      {
        path: ':id/details',
        name: 'VerifyDetails',
        component: VerifyDetails,
        meta: {
          title: 'page_title_data_difference_details',
          code: 'Data_verify',
          isNotAside: true,
        },
      },
    ],
  },

  {
    path: '/dataVerification',
    name: 'dataVerification',
    component: Layout,
    redirect: {
      name: 'dataVerificationList',
    },
    meta: {
      title: 'page_title_data_verify',
    },
    children: [
      {
        path: '',
        name: 'dataVerificationList',
        component: VerificationList,
        meta: {
          hideTitle: true,
          title: 'page_title_data_verify',
          code: 'v2_data_check',
        },
      },
      {
        path: 'create',
        name: 'dataVerificationCreate',
        component: VerificationForm,
        meta: {
          title: 'page_title_verification_create',
          code: 'v2_data_check_create',
        },
      },
      {
        path: ':id/edit',
        name: 'dataVerificationEdit',
        component: VerificationForm,
        meta: {
          title: 'page_title_task_edit',
          code: 'v2_data_check_edit',
        },
      },
      {
        path: ':id/details',
        name: 'dataVerifyDetails',
        component: VerificationDetails,
        meta: {
          title: 'page_title_task_details',
          code: 'v2_data_check_details',
        },
      },
      {
        path: ':id/history',
        name: 'dataVerifyHistory',
        component: VerificationHistory,
        meta: {
          title: 'page_title_verification_history',
          code: 'v2_data_check_history',
        },
      },
      {
        path: '/dataVerifyResult/:inspectId/:id/history',
        name: 'VerifyDiffHistory',
        component: VerificationHistory,
        meta: {
          title: 'page_title_diff_verification_history',
          code: 'v2_data_check_result_history',
        },
      },
      {
        path: '/dataVerifyResult/:id/details',
        name: 'VerifyDiffDetails',
        component: VerificationResult,
        meta: {
          title: 'page_title_diff_verification_details',
          code: 'v2_data_check_result_details',
        },
      },
      {
        path: '/dataVerifyResult/:id',
        name: 'dataVerifyResult',
        component: VerificationResult,
        meta: {
          title: 'page_title_data_verification_result',
          code: 'v2_data_check_result',
        },
      },
    ],
  },
  /* ---------- 共享挖掘  ----------*/
  {
    path: '/shared-mining',
    name: 'sharedMining',
    component: Layout,
    redirect: '/shared-mining',
    meta: {
      title: 'page_title_shared_mining',
    },
    children: [
      {
        path: '',
        name: 'sharedMiningList',
        component: SharedMiningList,
        meta: {
          hideTitle: true,
          title: 'page_title_shared_mining',
          code: 'v2_log_collector',
        },
      },
    ],
  },
  /* ---------- 心跳任务  ----------*/
  {
    path: '/heartbeat-table',
    name: 'heartbeatTable',
    component: Layout,
    redirect: {
      name: 'HeartbeatTableList',
    },
    meta: {
      title: 'page_title_heartbeat_table',
    },
    children: [
      {
        path: '',
        name: 'HeartbeatTableList',
        component: HeartbeatTableList,
        meta: {
          hideTitle: true,
          title: 'page_title_heartbeat_table',
          code: 'v2_log_collector',
        },
      },
    ],
  },
  /* ---------- 函数管理  ----------*/
  {
    path: '/function',
    name: 'function',
    component: Layout,
    redirect: {
      name: 'functionList',
    },
    meta: {
      title: 'page_title_function',
    },
    children: [
      {
        path: '',
        name: 'functionList',
        component: () => import('@/views/function/List'),
        meta: {
          hideTitle: true,
          title: 'page_title_function',
          code: 'v2_function_management',
        },
      },
      {
        path: 'create',
        name: 'FunctionCreate',
        component: FunctionForm,
        meta: {
          title: 'page_title_function_create',
          code: 'v2_function_management_create',
        },
      },
      {
        path: 'import',
        name: 'FunctionImport',
        component: () => import('@/views/function/ImportForm'),
        meta: {
          title: 'page_title_function_import',
          code: 'v2_function_management_import',
        },
      },
      {
        path: 'edit/:id',
        name: 'FunctionEdit',
        component: FunctionForm,
        meta: {
          title: 'page_title_function_edit',
          code: 'v2_function_management_edit',
        },
      },
      {
        path: 'details/:id',
        name: 'FunctionDetails',
        component: () => import('@/views/function/Details'),
        meta: {
          title: 'page_title_function_details',
          code: 'v2_function_management_details',
        },
      },
    ],
  },
  /* ---------- 自定义节点  ----------*/
  {
    path: '/custom-node',
    name: 'customNode',
    component: Layout,
    redirect: '/custom-node',
    meta: {
      title: 'page_title_custom_node',
    },
    children: [
      {
        path: '',
        name: 'customNodeList',
        component: CustomNodeList,
        meta: {
          hideTitle: true,
          title: 'page_title_custom_node',
          code: 'v2_custom_node',
        },
      },
    ],
  },
  /* ---------- 共享缓存  ----------*/
  {
    path: '/shared-cache',
    name: 'sharedCache',
    component: Layout,
    redirect: {
      name: 'sharedCacheList',
    },
    meta: {
      title: 'page_title_shared_cache',
    },
    children: [
      {
        path: '',
        name: 'sharedCacheList',
        component: SharedCacheList,
        meta: {
          hideTitle: true,
          title: 'page_title_shared_cache',
          code: 'v2_shared_cache',
        },
      },
      {
        path: 'create',
        name: 'sharedCacheCreate',
        component: SharedCacheForm,
        meta: {
          title: 'page_title_shared_cache_create',
          code: 'v2_shared_cache_create',
        },
      },
      {
        path: ':id/edit',
        name: 'sharedCacheEdit',
        component: SharedCacheForm,
        meta: {
          title: 'page_title_shared_cache_edit',
          code: 'v2_shared_cache_edit',
        },
      },
    ],
  },

  /* ---------- 服务审计  ----------*/
  {
    path: '/data-server-audit',
    name: 'dataServerAudit',
    component: Layout,
    redirect: {
      name: 'dataServerAuditList',
    },
    meta: {
      title: 'page_title_api_audit',
      code: 'v2_data_server_audit',
      hideTitle: true,
    },
    children: [
      {
        path: '',
        name: 'dataServerAuditList',
        component: () => import('@/views/data-server-audit/List.vue'),
        meta: {
          hideTitle: true,
          title: 'page_title_api_audit',
          code: 'v2_data_server_audit',
        },
      },
      {
        path: ':id/details',
        name: 'dataServerAuditDetails',
        component: () => import('@/views/data-server-audit/Info.vue'),
        meta: {
          title: 'page_title_api_audit_details',
          code: 'v2_data_server_audit-details',
        },
      },
    ],
  },
  /* ---------- 角色管理  ----------*/
  {
    path: '/role',
    name: 'roles',
    component: Layout,
    redirect: {
      name: 'roleList',
    },
    meta: {
      title: 'page_title_role',
    },
    children: [
      {
        path: '',
        name: 'roleList',
        component: () => import('@/views/role/Roles'),
        meta: {
          hideTitle: true,
          title: 'page_title_role',
          code: 'v2_role_management',
        },
      },
      {
        path: 'create',
        name: 'role',
        component: () => import('@/views/role/Role'),
        meta: {
          title: 'role_list_setting_permissions',
          code: 'v2_role_creation',
        },
      },
      {
        path: ':id/edit',
        name: 'editRole',
        component: () => import('@/views/role/Role'),
        meta: {
          title: 'role_list_setting_permissions',
          code: 'v2_role_edition',
        },
      },
    ],
  },

  {
    path: '/api-sdk',
    name: 'apiSdk',
    component: Layout,
    redirect: {
      name: 'apiSdkList',
    },
    meta: {
      title: 'page_title_role',
    },
    children: [
      {
        path: '',
        name: 'apiSdkList',
        component: () => import('@tap/business/src/views/api-sdk/SdkList.vue'),
        meta: {
          title: 'page_title_api_sdk',
          code: 'v2_data-server-list',
        },
      },
      {
        path: ':id',
        name: 'apiSdkDetails',
        component: () =>
          import('@tap/business/src/views/api-sdk/SdkDetails.vue'),
        meta: {
          title: 'page_title_api_sdk_details',
          code: 'v2_role_creation',
        },
      },
    ],
  },

  {
    path: '/',
    name: 'layout',
    redirect: '/dashboard',
    code: 'v2_dashboard',
    component: Layout,
    children: [
      /* ---------- 控制台  ----------*/
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: {
          title: 'page_title_overview',
        },
      },

      /* ---------- 数据服务管理  ----------*/
      {
        path: '/data-server',
        name: 'dataServer',
        component: DataServerList,
        meta: {
          title: 'page_title_data_server_list',
          code: 'v2_data-server-list',
          hideTitle: true,
        },
      },
      /* ---------- 应用管理  ----------*/
      {
        path: '/api-application',
        name: 'apiApplication',
        component: ApiApplicationList,
        meta: {
          title: 'page_title_api_application',
          code: 'v2_api-application',
          hideTitle: true,
        },
      },
      /* ---------- API客户端  ----------*/
      {
        path: '/api-client',
        name: 'apiClient',
        component: () => import('@/views/api-page/Applications.vue'),
        meta: {
          title: 'page_title_api_client',
          code: 'v2_api-client',
          hideTitle: true,
        },
      },
      /* ---------- API服务端  ----------*/
      {
        path: '/api-servers',
        name: 'apiServer',
        component: () => import('@/views/api-page/ApiServer.vue'),
        meta: {
          title: 'page_title_api_servers',
          code: 'v2_api-servers',
          hideTitle: true,
        },
      },

      /* ---------- API监控  ----------*/
      {
        path: '/api-monitor',
        name: 'apiMonitor',
        component: () => import('@/views/api-page/api-monitor/ApiMonitor.vue'),
        meta: {
          title: 'page_title_api_monitor',
          code: 'v2_api_monitor',
        },
      },
      /* ---------- 集群管理  ----------*/
      {
        path: '/cluster',
        name: 'clusterManagement',
        component: () => import('@/views/cluster/Cluster.vue'),
        meta: {
          title: 'page_title_cluster',
          code: 'v2_cluster-management_menu',
        },
      },
      {
        path: '/external-storage',
        name: 'externalStorage',
        component: ExternalStorageList,
        meta: {
          title: 'page_title_external_storage',
          code: 'v2_external-storage_menu',
          hideTitle: true,
        },
      },
      /* ---------- 用户管理  ----------*/
      {
        path: '/user',
        name: 'users',
        component: () => import('@/views/user/List.vue'),
        meta: {
          title: 'page_title_user',
          code: 'v2_user_management_menu',
          hideTitle: true,
        },
      },
      {
        path: 'license',
        name: 'License',
        component: () => import('@/views/License.vue'),
        meta: {
          title: 'page_title_license',
          hideTitle: true,
        },
      },
      {
        path: '/data-console',
        name: 'dataConsole',
        component: () => import('@tap/ldp/src/Dashboard.vue'),
        meta: {
          title: 'page_title_data_hub',
          hideTitle: true,
          icon: 'data-server',
          code: 'v2_data-console',
        },
      },
      {
        path: '/data-encryption',
        name: 'dataEncryption',
        component: DataEncryptionList,
        meta: {
          title: 'public_data_encryption',
          // code: 'v2_data-encryption',
        },
      },
    ],
  },

  /* ---------- 设置  ----------*/
  {
    path: '/settingCenter',
    name: 'settingCenter',
    redirect: '/settingCenter/accountSetting',
    component: SettingLayout,
    meta: {
      title: 'page_title_back_menu',
      isNotAside: true,
    },
    children: [
      {
        path: 'accountSetting',
        name: 'accountSetting',
        code: 'v2_account-setting-setting',
        component: () => import('@/views/setting/AccountSetting.vue'),
        meta: { title: 'page_title_account' },
      },
      {
        path: 'notificationSetting',
        name: 'notificationSetting',
        code: 'v2_notification-setting',
        component: () => import('@/views/setting/NotificationSetting.vue'),
        meta: { title: 'notify_setting', isNotAside: true },
      },
      /* ---------- 系统设置  ----------*/
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/setting/Setting.vue'),
        meta: {
          title: 'page_title_setting',
          code: 'v2_system_settings_menu',
          isNotAside: true,
        },
      },
      /* ---------- 告警设置  ----------*/
      {
        path: 'alarmSetting',
        name: 'alarmSetting',
        component: AlarmSetting,
        meta: {
          title: 'packages_business_setting_alarmnotification_renwugaojingshe',
          code: 'v2_alarm_settings_menu',
          isNotAside: true,
        },
      },
      /* ---------- Webhook 告警设置  ----------*/
      {
        path: 'webhook-alerts',
        name: 'webhookAlerts',
        component: () => import('@/views/setting/WebhookAlerts.vue'),
        meta: {
          title: 'page_title_webhook_alerts',
          isNotAside: true,
        },
      },
    ],
  },
  /* ---------- 通知模块  ----------*/
  {
    path: '/notification',
    name: 'notification',
    redirect: '/notification/systemNotification',
    component: NotifyLayout,
    meta: {
      title: 'page_title_back_menu',
    },
    children: [
      {
        path: 'systemNotification',
        name: 'systemNotification',
        component: () => import('@/views/notification/SystemNotification.vue'),
        meta: { title: 'notify_system_notice' },
      },
      {
        path: 'userNotification',
        name: 'userNotification',
        component: () => import('@/views/notification/UserNotification.vue'),
        meta: { title: 'notify_user_notice' },
      },
      {
        path: 'alarmNotification',
        name: 'alarmNotification',
        component: AlarmNotification,
        meta: { title: 'notify_system_notice' },
      },
      {
        path: 'systemAlarm',
        name: 'systemAlarm',
        component: () => import('@/views/notification/SystemAlarm.vue'),
        meta: { title: 'notify_user_notice' },
      },
    ],
  },
]
