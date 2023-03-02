import Parent from './Parent'

const FunctionForm = () => import(/* webpackChunkName: "function-form" */ '@/views/function/Form')
const SharedCacheForm = () => import(/* webpackChunkName: "shared-cache-form" */ '@/views/shared-cache/Form')
const DagEditor = async () => {
  const { Editor } = await import(/* webpackChunkName: "dag" */ '@tap/dag')
  return Editor
}
const MigrationEditor = async () => {
  const { MigrationEditor } = await import('@tap/dag')
  return MigrationEditor
}
const MigrationMonitor = async () => {
  const { MigrationMonitor } = await import('@tap/dag')
  return MigrationMonitor
}
const MigrationMonitorViewer = async () => {
  const { MigrationMonitorViewer } = await import('@tap/dag')
  return MigrationMonitorViewer
}
const CustomNodeList = async () => {
  const { CustomNodeList } = await import('@tap/business')
  return CustomNodeList
}
const NodeEditor = async () => {
  const { Editor } = await import(/* webpackChunkName: "node-design" */ '@tap/node-design')
  return Editor
}
const ConnectionForm = async () => {
  const { ConnectionForm } = await import('@tap/business')
  return ConnectionForm
}
const EtlList = async () => {
  const { EtlList } = await import('@tap/business')
  return EtlList
}
const EtlDetails = async () => {
  const { EtlDetails } = await import('@tap/business')
  return EtlDetails
}
const EtlStatistics = async () => {
  const { EtlStatistics } = await import('@tap/business')
  return EtlStatistics
}
const ConnectionList = async () => {
  const { ConnectionList } = await import('@tap/business')
  return ConnectionList
}
const MigrateList = async () => {
  const { MigrateList } = await import('@tap/business')
  return MigrateList
}
const MigrateDetails = async () => {
  const { MigrateDetails } = await import('@tap/business')
  return MigrateDetails
}

const VerifyDetails = async () => {
  const { VerifyDetails } = await import('@tap/business')
  return VerifyDetails
}

const RelationTaskDetails = async () => {
  const { RelationTaskDetails } = await import('@tap/business')
  return RelationTaskDetails
}

const RoleDetails = () => import(/* webpackChunkName: "role-details" */ '@/views/role/Role')

// 数据校验
const VerificationList = async () => {
  const { VerificationList } = await import('@tap/business')
  return VerificationList
}

const VerificationDetails = async () => {
  const { VerificationDetails } = await import('@tap/business')
  return VerificationDetails
}

const VerificationForm = async () => {
  const { VerificationForm } = await import('@tap/business')
  return VerificationForm
}

const VerificationHistory = async () => {
  const { VerificationHistory } = await import('@tap/business')
  return VerificationHistory
}

const VerificationResult = async () => {
  const { VerificationResult } = await import('@tap/business')
  return VerificationResult
}

//告警设置
const AlarmSetting = async () => {
  const { AlarmSetting } = await import('@tap/business')
  return AlarmSetting
}
const SwimlaneDashboard = async () => {
  const { SwimlaneDashboard } = await import('@tap/business')
  return SwimlaneDashboard
}
export default [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/Login'),
    title: 'tap.login'
  },
  {
    path: '/registry',
    name: 'registry',
    component: () => import(/* webpackChunkName: "registry" */ '@/views/login/Registration'),
    meta: {
      title: 'tap.registry'
    }
  },
  {
    path: '/verificationEmail',
    name: 'verificationEmail',
    component: () => import(/* webpackChunkName: "email" */ '@/views/login/VerificationEmail'),
    meta: {
      title: 'tap.verificationEmail'
    }
  },
  {
    path: '/registyResult',
    name: 'registyResult',
    component: () => import(/* webpackChunkName: "registy-result" */ '@/views/login/RegistyResult'),
    meta: {
      title: 'tap.registry'
    }
  },
  {
    path: '/passwordReset',
    name: 'passwordReset',
    component: () => import(/* webpackChunkName: "password" */ '@/views/login/PasswordReset'),
    meta: {
      title: 'tap.passwordReset'
    }
  },
  {
    path: '/node/editor',
    name: 'NodeNew',
    component: NodeEditor
  },
  {
    path: '/node/editor/:id',
    name: 'NodeEditor',
    component: NodeEditor
  },
  {
    path: '/dataflow/editor',
    name: 'DataflowNew',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'v2_data_flow_dag_edit'
    }
  },
  {
    path: '/dataflow/editor/:id',
    name: 'DataflowEditor',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'v2_data_flow_edit'
    }
  },
  {
    path: '/dataflow/viewer/:id',
    name: 'DataflowViewer',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'v2_data_flow_details'
    }
  },
  {
    path: '/dataflow/monitor/:id',
    name: 'TaskMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_flow_monitor'
    }
  },

  {
    path: '/migrate/editor',
    name: 'MigrateCreate',
    component: MigrationEditor,
    meta: {
      title: 'page_title_data_copy',
      code: 'v2_data_replication_dag_edit'
    }
  },
  {
    path: '/migrate/editor/:id',
    name: 'MigrateEditor',
    component: MigrationEditor,
    meta: {
      title: 'page_title_data_copy',
      code: 'v2_data_replication_dag_edit'
    }
  },
  {
    path: '/migrate/viewer/:id',
    name: 'MigrateViewer',
    component: MigrationEditor,
    meta: {
      title: 'page_title_data_copy',
      code: 'v2_data_replication_details'
    }
  },
  {
    path: '/migrate/monitor/:id',
    name: 'MigrationMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor'
    }
  },
  {
    path: '/migrate/monitor-record/:id',
    name: 'MigrationMonitorViewer',
    component: MigrationMonitorViewer,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_record_monitor'
    }
  },
  {
    path: '/',
    name: 'layout',
    redirect: 'dashboard',
    code: 'v2_dashboard',
    component: () => import('@/views/Layout'),
    children: [
      /* ---------- 控制台  ----------*/
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard'),
        meta: {
          title: 'page_title_overview'
        }
      },
      /* ---------- 连接管理  ----------*/
      {
        path: '/connections',
        name: 'connections',
        component: Parent,
        redirect: 'connections/',
        meta: {
          title: 'page_title_connections'
        },
        children: [
          {
            path: '',
            name: 'connectionsList',
            component: ConnectionList,
            meta: {
              title: 'page_title_connections',
              code: 'v2_datasource_menu'
            }
          },
          {
            path: 'create',
            name: 'connectionCreate',
            component: ConnectionForm,
            meta: {
              title: 'page_title_connections_create',
              code: 'v2_datasource_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'connectionsEdit',
            component: ConnectionForm,
            meta: {
              title: 'page_title_connections_edit',
              code: 'v2_datasource_edition'
            }
          }
        ]
      },
      /* ---------- 数据发现-数据对象  ----------*/
      {
        path: '/object',
        name: 'object',
        component: Parent,
        redirect: 'object/',
        meta: {
          title: 'page_title_data_object'
        },
        children: [
          {
            path: '',
            name: 'objectList',
            component: () => import(/* webpackChunkName: "connection-list" */ '@/views/data-discovery/ObjectList.tsx'),
            meta: {
              title: 'page_title_data_object',
              code: 'v2_data_object'
            }
          }
        ]
      },
      /* ---------- 数据发现-数据目录  ----------*/
      {
        path: '/catalogue',
        name: 'catalogue',
        component: Parent,
        redirect: 'catalogue',
        meta: {
          title: 'page_title_data_catalogue'
        },
        children: [
          {
            path: '',
            name: 'catalogueList',
            component: () => import(/* webpackChunkName: "connection-list" */ '@/views/data-discovery/Catalogue.tsx'),
            meta: {
              title: 'page_title_data_catalogue',
              code: 'v2_data_catalogue'
            }
          }
        ]
      },
      /* ---------- 数据复制  ----------*/
      {
        path: '/migrate',
        name: 'migrate',
        component: Parent,
        redirect: 'migrate/',
        meta: {
          title: 'page_title_data_copy'
        },
        children: [
          {
            path: '',
            name: 'migrateList',
            component: MigrateList,
            meta: {
              title: 'page_title_data_copy',
              code: 'v2_data_replication'
            }
          },
          {
            path: 'details/:id',
            name: 'MigrateDetails',
            component: MigrateDetails,
            meta: {
              title: 'page_title_task_details',
              code: 'v2_data_replication'
            }
          },
          {
            path: 'Statistics',
            name: 'MigrateStatistics',
            component: MigrateDetails,
            meta: {
              title: 'page_title_run_monitor',
              code: 'v2_data_replication'
            }
          }
        ]
      },
      /* ---------- 数据开发  ----------*/
      {
        path: '/dataflow',
        name: 'dataflow',
        component: Parent,
        redirect: 'dataflow/',
        meta: {
          title: 'page_title_data_develop'
        },
        children: [
          {
            path: '',
            name: 'dataflowList',
            component: EtlList,
            meta: {
              title: 'page_title_data_develop',
              code: 'v2_data_flow'
            }
          },
          {
            path: 'statistics/:id',
            name: 'dataflowStatistics',
            component: EtlStatistics,
            meta: {
              title: 'page_title_task_stat',
              code: 'v2_data_flow'
            }
          },
          /* ---------- 数据开发任务详情  ----------*/
          {
            path: 'details/:id',
            name: 'dataflowDetailsContainer',
            component: Parent,
            redirect: 'details/:id/',
            meta: {
              title: 'page_title_run_monitor'
            },
            children: [
              {
                path: '',
                name: 'dataflowDetails',
                component: EtlDetails,
                meta: {
                  title: 'page_title_run_monitor',
                  code: 'Data_SYNC_menu'
                }
              }
            ]
          }
        ]
      },
      /* ---------- 数据校验  ----------*/
      {
        path: '/verify',
        name: 'verify',
        component: Parent,
        redirect: 'verify/',
        meta: {
          title: 'page_title_data_verify',
          doNotJump: true
        },
        children: [
          {
            path: ':id/details',
            name: 'VerifyDetails',
            component: VerifyDetails,
            meta: {
              title: 'page_title_data_difference_details',
              code: 'Data_verify',
              isNotAside: true
            }
          }
        ]
      },
      /* ---------- 数据校验1.x  ----------*/
      {
        path: '/dataVerification',
        name: 'dataVerification',
        component: Parent,
        redirect: 'dataVerification/',
        meta: {
          title: 'page_title_data_verify'
        },
        children: [
          {
            path: '',
            name: 'dataVerificationList',
            component: VerificationList,
            meta: {
              title: 'page_title_data_verify',
              code: 'v2_data_check_list'
            }
          },
          {
            path: 'create',
            name: 'dataVerificationCreate',
            component: VerificationForm,
            meta: {
              title: 'page_title_verification_create',
              code: 'v2_data_check_create'
            }
          },
          {
            path: ':id/edit',
            name: 'dataVerificationEdit',
            component: VerificationForm,
            meta: {
              title: 'page_title_task_edit',
              code: 'v2_data_check_edit'
            }
          },
          {
            path: ':id/details',
            name: 'dataVerifyDetails',
            component: VerificationDetails,
            meta: {
              title: 'page_title_task_details',
              code: 'v2_data_check_details'
            }
          },
          {
            path: ':id/history',
            name: 'dataVerifyHistory',
            component: VerificationHistory,
            meta: {
              title: 'page_title_verification_history',
              code: 'v2_data_check_history'
            }
          },
          {
            path: '/dataVerifyResult/:id/history',
            name: 'VerifyDiffHistory',
            component: VerificationHistory,
            meta: {
              title: 'page_title_diff_verification_history',
              code: 'v2_data_check_result_history'
            }
          },
          {
            path: '/dataVerifyResult/:id/details',
            name: 'VerifyDiffDetails',
            component: VerificationResult,
            meta: {
              title: 'page_title_diff_verification_details',
              code: 'v2_data_check_result_details'
            }
          },
          {
            path: '/dataVerifyResult/:id',
            name: 'dataVerifyResult',
            component: VerificationResult,
            meta: {
              title: 'page_title_data_verification_result',
              code: 'v2_data_check_result'
            }
          }
          // {
          //   path: ':id/verifyDetails',
          //   name: 'VerifyDetails',
          //   component: VerificationDetails,
          //   meta: {
          //     title: 'page_title_data_verify_details',
          //     code: 'Data_verify',
          //     isNotAside: true
          //   }
          // }
        ]
      },
      /* ---------- 共享挖掘  ----------*/
      {
        path: '/sharedMining',
        name: 'sharedMining',
        component: Parent,
        redirect: 'sharedMining/',
        meta: {
          title: 'page_title_shared_mining'
        },
        children: [
          {
            path: '',
            name: 'sharedMiningList',
            component: () => import(/* webpackChunkName: "shared-mining" */ '@/views/shared-mining/List'),
            meta: {
              title: 'page_title_shared_mining',
              code: 'v2_log_collector_menu'
            }
          },
          {
            path: 'details/:id',
            name: 'SharedMiningDetails',
            component: () => import(/* webpackChunkName: "shared-mining-details" */ '@/views/shared-mining/Detail'),
            meta: {
              title: 'page_title_shared_mining_details',
              code: 'v2_log_collector_detail'
            }
          }
        ]
      },
      /* ---------- 函数管理  ----------*/
      {
        path: '/function',
        name: 'function',
        component: Parent,
        redirect: 'function/',
        meta: {
          title: 'page_title_function'
        },
        children: [
          {
            path: '',
            name: 'functionList',
            component: () => import(/* webpackChunkName: "function-list" */ '@/views/function/List'),
            meta: {
              title: 'page_title_function',
              code: 'v2_function_management_list'
            }
          },
          {
            path: 'create',
            name: 'FunctionCreate',
            component: FunctionForm,
            meta: {
              title: 'page_title_function_create',
              code: 'v2_function_management_create'
            }
          },
          {
            path: 'import',
            name: 'FunctionImport',
            component: () => import(/* webpackChunkName: "function-import" */ '@/views/function/ImportForm'),
            meta: {
              title: 'page_title_function_import',
              code: 'v2_function_management_import'
            }
          },
          {
            path: 'edit/:id',
            name: 'FunctionEdit',
            component: FunctionForm,
            meta: {
              title: 'page_title_function_edit',
              code: 'v2_function_management_edit'
            }
          },
          {
            path: 'details/:id',
            name: 'FunctionDetails',
            component: () => import(/* webpackChunkName: "function-details" */ '@/views/function/Details'),
            meta: {
              title: 'page_title_function_details',
              code: 'v2_function_management_details'
            }
          }
        ]
      },
      /* ---------- 自定义节点  ----------*/
      {
        path: '/custom-node',
        name: 'customNode',
        component: Parent,
        redirect: 'custom-node/',
        meta: {
          title: 'page_title_custom_node'
        },
        children: [
          {
            path: '',
            name: 'customNodeList',
            component: CustomNodeList,
            meta: {
              title: 'page_title_custom_node',
              code: 'v2_custom_node_menu'
            }
          }
        ]
      },
      /* ---------- 共享缓存  ----------*/
      {
        path: '/shared-cache',
        name: 'sharedCache',
        component: Parent,
        redirect: 'shared-cache/',
        meta: {
          title: 'page_title_shared_cache'
        },
        children: [
          {
            path: '',
            name: 'sharedCacheList',
            component: () => import(/* webpackChunkName: "shared-cache" */ '@/views/shared-cache/List'),
            meta: {
              title: 'page_title_shared_cache',
              code: 'v2_shared_cache_menu'
            }
          },
          {
            path: 'create',
            name: 'sharedCacheCreate',
            component: SharedCacheForm,
            meta: {
              title: 'page_title_shared_cache_create',
              code: 'v2_shared_cache_create'
            }
          },
          {
            path: ':id/edit',
            name: 'sharedCacheEdit',
            component: SharedCacheForm,
            meta: {
              title: 'page_title_shared_cache_edit',
              code: 'v2_shared_cache_edit'
            }
          }
        ]
      },
      /* ---------- 数据服务管理  ----------*/
      {
        path: '/data-server',
        name: 'dataServer',
        component: () => import(/* webpackChunkName: "data-server" */ '@/views/data-server/List.vue'),
        meta: {
          title: 'page_title_data_server_list',
          code: 'v2_data-server-list'
        }
      },
      /* ---------- API客户端  ----------*/
      {
        path: '/api-client',
        name: 'apiClient',
        component: () => import(/* webpackChunkName: "api-client" */ '@/views/api-page/Applications'),
        meta: {
          title: 'page_title_api_client',
          code: 'v2_api-client'
        }
      },
      /* ---------- API服务端  ----------*/
      {
        path: '/api-servers',
        name: 'apiServer',
        component: () => import(/* webpackChunkName: "api-server" */ '@/views/api-page/ApiServer'),
        meta: {
          title: 'page_title_api_servers',
          code: 'v2_api-servers'
        }
      },
      /* ---------- 服务审计  ----------*/
      {
        path: '/data-server-audit',
        name: 'dataServerAudit',
        component: Parent,
        redirect: 'data-server-audit/',
        meta: {
          title: 'page_title_api_audit',
          code: 'v2_data_server_audit-list'
        },
        children: [
          {
            path: '',
            name: 'dataServerAuditList',
            component: () => import(/* webpackChunkName: "data-server-audit" */ '@/views/data-server-audit/List'),
            meta: {
              title: 'page_title_api_audit',
              code: 'v2_data_server_audit-list'
            }
          },
          {
            path: ':id/details',
            name: 'dataServerAuditDetails',
            component: () =>
              import(/* webpackChunkName: "data-server-audit-details" */ '@/views/data-server-audit/Info'),
            meta: {
              title: 'page_title_api_audit_details',
              code: 'v2_data_server_audit-details'
            }
          }
        ]
      },
      /* ---------- API监控  ----------*/
      {
        path: '/api-monitor',
        name: 'apiMonitor',
        component: () => import(/* webpackChunkName: "api-monitor" */ '@/views/api-page/api-monitor/ApiMonitor'),
        meta: {
          title: 'page_title_api_monitor',
          code: 'API_server_menu'
        }
      },
      /* ---------- 元数据管理  ----------*/
      // {
      //   path: '/metadata',
      //   name: 'metadataDefinition',
      //   component: () => import(/* webpackChunkName: "metadata-definition" */ '@/views/metadata/List'),
      //   meta: {
      //     title: 'page_title_data_metadata',
      //     code: 'data_catalog_menu',
      //     types: [
      //       'table',
      //       'view',
      //       'collection',
      //       'mongo_view',
      //       'database',
      //       'job',
      //       'dataflow',
      //       'api',
      //       'directory',
      //       'ftp',
      //       'apiendpoint'
      //     ]
      //   }
      // },
      /* ---------- 集群管理  ----------*/
      {
        path: '/cluster',
        name: 'clusterManagement',
        component: () => import(/* webpackChunkName: "cluster" */ '@/views/cluster/Cluster'),
        meta: {
          title: 'page_title_cluster',
          code: 'v2_cluster-management_menu'
        }
      },
      {
        path: '/external-storage',
        name: 'externalStorage',
        component: () => import(/* webpackChunkName: "external-storage" */ '@/views/external-storage/List'),
        meta: {
          title: 'page_title_external_storage',
          code: 'v2_external-storage_menu'
        }
      },
      /* ---------- 用户管理  ----------*/
      {
        path: '/user',
        name: 'users',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/List'),
        meta: {
          title: 'page_title_user',
          code: 'v2_user_management_menu'
        }
      },
      /* ---------- 角色管理  ----------*/
      {
        path: '/role',
        name: 'roles',
        component: Parent,
        redirect: 'role/',
        meta: {
          title: 'page_title_role'
        },
        children: [
          {
            path: '',
            name: 'roleList',
            component: () => import(/* webpackChunkName: "role-list" */ '@/views/role/Roles'),
            meta: {
              title: 'page_title_role',
              code: 'v2_role_management_menu'
            }
          },
          {
            path: 'create',
            name: 'role',
            component: RoleDetails,
            meta: {
              title: 'role_list_setting_permissions',
              code: 'v2_role_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'editRole',
            component: RoleDetails,
            meta: {
              title: 'role_list_setting_permissions',
              code: 'v2_role_edition'
            }
          }
        ]
      },
      /* ---------- 设置  ----------*/
      {
        path: '/settingCenter',
        name: 'settingCenter',
        redirect: 'settingCenter/accountSetting',
        component: () => import(/* webpackChunkName: "setting-center" */ '@/views/setting/SettingCenter'),
        meta: {
          title: 'page_title_back_menu',
          isNotAside: true
        },
        children: [
          {
            path: 'accountSetting',
            name: 'accountSetting',
            code: 'v2_account-setting-setting',
            component: () => import(/* webpackChunkName: "account-setting" */ '@/views/setting/AccountSetting'),
            meta: { title: 'page_title_account', isNotAside: true }
          },
          {
            path: 'notificationSetting',
            name: 'notificationSetting',
            code: 'v2_notification-setting',
            component: () =>
              import(/* webpackChunkName: "notification-setting" */ '@/views/setting/NotificationSetting'),
            meta: { title: 'notify_setting', isNotAside: true }
          },
          /* ---------- 系统设置  ----------*/
          {
            path: 'settings',
            name: 'settings',
            component: () => import(/* webpackChunkName: "system-setting" */ '@/views/setting/Setting'),
            meta: {
              title: 'page_title_setting',
              code: 'v2_system_settings_menu',
              isNotAside: true
            }
          },
          /* ---------- 告警设置  ----------*/
          {
            path: 'alarmSetting',
            name: 'alarmSetting',
            component: AlarmSetting,
            meta: {
              title: 'page_title_setting',
              code: 'v2_alarm_settings_menu',
              isNotAside: true
            }
          }
        ]
      },

      /* ---------- 不确定路由  ----------*/
      {
        path: '/dailyRecord',
        name: 'dailyRecord',
        component: () => import('@/views/cluster/DailyRecord')
      },
      {
        path: '/notification',
        name: 'notification',
        redirect: 'notification/systemNotification',
        component: () => import('@/views/notification/Center'),
        meta: {
          title: 'page_title_back_menu',
          isNotAside: true
        },
        children: [
          {
            path: 'systemNotification',
            name: 'systemNotification',
            component: () => import('@/views/notification/SystemNotification'),
            meta: { title: 'notify_system_notice', isNotAside: true }
          },
          {
            path: 'userNotification',
            name: 'userNotification',
            component: () => import('@/views/notification/UserNotification'),
            meta: { title: 'notify_user_notice', isNotAside: true }
          },
          {
            path: 'alarmNotification',
            name: 'alarmNotification',
            component: () => import('@/views/notification/AlarmNotification'),
            meta: { title: 'notify_system_notice', isNotAside: true }
          },
          {
            path: 'systemAlarm',
            name: 'systemAlarm',
            component: () => import('@/views/notification/SystemAlarm'),
            meta: { title: 'notify_user_notice', isNotAside: true }
          }
        ]
      },
      {
        path: 'license',
        name: 'License',
        component: () => import('@/views/License'),
        meta: {
          title: 'page_title_license'
        }
      },
      {
        path: 'solutions',
        name: 'Solutions',
        component: () => import('@/views/solutions/Index'),
        meta: {
          title: 'solution_name'
        }
      },
      {
        path: 'relationTask/detail/:id',
        name: 'relationTaskDetail',
        component: RelationTaskDetails,
        meta: {
          title: 'daas_router_routes_guanlianrenwuxiang',
          hideTitle: true
        }
      },
      {
        path: '/data-console',
        name: 'dataConsole',
        component: SwimlaneDashboard,
        meta: {
          title: 'dfs_data_server',
          hideTitle: true,
          icon: 'data-server'
        }
      }
    ]
  }
]
