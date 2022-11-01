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
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/dataflow/editor/:id',
    name: 'DataflowEditor',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/dataflow/viewer/:id',
    name: 'DataflowViewer',
    component: DagEditor,
    meta: {
      title: 'page_title_data_develop',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/dataflow/monitor/:id',
    name: 'TaskMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'Data_SYNC_menu'
    }
  },

  {
    path: '/migrate/editor',
    name: 'MigrateCreate',
    component: MigrationEditor,
    meta: {
      title: 'page_title_task_edit',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/migrate/editor/:id',
    name: 'MigrateEditor',
    component: MigrationEditor,
    meta: {
      title: 'page_title_task_edit',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/migrate/viewer/:id',
    name: 'MigrateViewer',
    component: MigrationEditor,
    meta: {
      title: 'page_title_task_edit',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/migrate/monitor/:id',
    name: 'MigrationMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/migrate/monitor-record/:id',
    name: 'MigrationMonitorViewer',
    component: MigrationMonitorViewer,
    meta: {
      title: 'page_title_run_monitor',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/',
    name: 'layout',
    redirect: 'dashboard',
    component: () => import('@/views/Layout'),
    children: [
      /* ---------- 控制台  ----------*/
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard'),
        meta: { title: 'page_title_overview' }
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
              code: 'datasource_menu'
            }
          },
          {
            path: 'create',
            name: 'connectionCreate',
            component: ConnectionForm,
            meta: {
              title: 'page_title_connections_create',
              code: 'datasource_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'connectionsEdit',
            component: ConnectionForm,
            meta: {
              title: 'page_title_connections_edit',
              code: 'datasource_edition'
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
              code: 'datasource_menu'
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
              code: ''
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
              code: 'Data_SYNC_menu'
            }
          },
          {
            path: 'details/:id',
            name: 'MigrateDetails',
            component: MigrateDetails,
            meta: {
              title: 'page_title_task_details',
              code: 'Data_SYNC_menu'
            }
          },
          {
            path: 'Statistics',
            name: 'MigrateStatistics',
            component: MigrateDetails,
            meta: {
              title: 'page_title_run_monitor',
              code: 'Data_SYNC_menu'
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
              code: 'Data_SYNC_menu'
            }
          },
          {
            path: 'statistics/:id',
            name: 'dataflowStatistics',
            component: EtlStatistics,
            meta: {
              title: 'page_title_task_stat',
              code: 'Data_SYNC_menu'
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
              code: 'log_collector_menu'
            }
          },
          {
            path: 'details/:id',
            name: 'SharedMiningDetails',
            component: () => import(/* webpackChunkName: "shared-mining-details" */ '@/views/shared-mining/Detail'),
            meta: {
              title: 'page_title_shared_mining_details',
              code: 'log_collector_menu'
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
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'create',
            name: 'FunctionCreate',
            component: FunctionForm,
            meta: {
              title: 'page_title_function_create',
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'import',
            name: 'FunctionImport',
            component: () => import(/* webpackChunkName: "function-import" */ '@/views/function/ImportForm'),
            meta: {
              title: 'page_title_function_import',
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'edit/:id',
            name: 'FunctionEdit',
            component: FunctionForm,
            meta: {
              title: 'page_title_function_edit',
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'details/:id',
            name: 'FunctionDetails',
            component: () => import(/* webpackChunkName: "function-details" */ '@/views/function/Details'),
            meta: {
              title: 'page_title_function_details',
              code: 'SYNC_Function_management'
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
            component: () =>
              import(/* webpackChunkName: "custom-proccessor-node" */ '@/views/custom-proccessor-node/List'),
            meta: {
              title: 'page_title_custom_node',
              code: 'custom_node_menu'
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
              code: 'shared_cache_menu'
            }
          },
          {
            path: 'create',
            name: 'sharedCacheCreate',
            component: SharedCacheForm,
            meta: {
              title: 'page_title_shared_cache_create',
              code: 'shared_cache_menu'
            }
          },
          {
            path: ':id/edit',
            name: 'sharedCacheEdit',
            component: SharedCacheForm,
            meta: {
              title: 'page_title_shared_cache_edit',
              code: 'shared_cache_menu'
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
          code: 'API_data_explorer_menu'
        }
      },
      /* ---------- API客户端  ----------*/
      {
        path: '/api-client',
        name: 'apiClient',
        component: () => import(/* webpackChunkName: "api-client" */ '@/views/api-page/Applications'),
        meta: {
          title: 'page_title_api_client',
          code: 'API_clients_menu'
        }
      },
      /* ---------- API服务端  ----------*/
      {
        path: '/api-servers',
        name: 'apiServer',
        component: () => import(/* webpackChunkName: "api-server" */ '@/views/api-page/ApiServer'),
        meta: {
          title: 'page_title_api_servers',
          code: 'API_server_menu'
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
          code: 'API_clients_menu'
        },
        children: [
          {
            path: '',
            name: 'dataServerAuditList',
            component: () => import(/* webpackChunkName: "data-server-audit" */ '@/views/data-server-audit/List'),
            meta: {
              title: 'page_title_api_audit',
              code: 'API_clients_menu'
            }
          },
          {
            path: ':id/details',
            name: 'dataServerAuditDetails',
            component: () =>
              import(/* webpackChunkName: "data-server-audit-details" */ '@/views/data-server-audit/Info'),
            meta: {
              title: 'page_title_api_audit_details',
              code: 'API_clients_menu'
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
          code: 'Cluster_management_menu'
        }
      },
      {
        path: '/external-storage',
        name: 'externalStorage',
        component: () => import(/* webpackChunkName: "external-storage" */ '@/views/external-storage/List'),
        meta: {
          title: 'page_title_external_storage',
          code: ''
        }
      },
      /* ---------- 用户管理  ----------*/
      // {
      //   path: '/user',
      //   name: 'users',
      //   component: () => import(/* webpackChunkName: "user" */ '@/views/user/List'),
      //   meta: {
      //     title: 'page_title_user',
      //     code: 'user_management_menu'
      //   }
      // },
      /* ---------- 角色管理  ----------*/
      // {
      //   path: '/role',
      //   name: 'roles',
      //   component: Parent,
      //   redirect: 'role/',
      //   meta: {
      //     title: 'page_title_role'
      //   },
      //   children: [
      //     {
      //       path: '',
      //       name: 'roleList',
      //       component: () => import(/* webpackChunkName: "role-list" */ '@/views/role/Roles'),
      //       meta: {
      //         title: 'page_title_role',
      //         code: 'role_management_menu'
      //       }
      //     },
      //     {
      //       path: 'create',
      //       name: 'role',
      //       component: RoleDetails,
      //       meta: {
      //         title: 'page_title_role',
      //         code: 'role_creation'
      //       }
      //     },
      //     {
      //       path: ':id/edit',
      //       name: 'editRole',
      //       component: RoleDetails,
      //       meta: {
      //         title: 'page_title_role',
      //         code: 'role_edition'
      //       }
      //     }
      //   ]
      // },
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
            component: () => import(/* webpackChunkName: "account-setting" */ '@/views/setting/AccountSetting'),
            meta: { title: 'page_title_account', isNotAside: true }
          },
          {
            path: 'notificationSetting',
            name: 'notificationSetting',
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
              code: 'system_settings_menu',
              isNotAside: true
            }
          },
          /* ---------- 告警设置  ----------*/
          {
            path: 'alarmSetting',
            name: 'alarmSetting',
            component: () => import(/* webpackChunkName: "system-setting" */ '@/views/setting/AlarmNotification'),
            meta: {
              title: 'page_title_setting',
              code: 'system_settings_menu',
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
      }
    ]
  }
]
