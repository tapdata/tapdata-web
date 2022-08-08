import Parent from './Parent'
const MigrateDetails = () =>
  import(/* webpackChunkName: "task-details" */ '@tap/business/src/views/task/migrate/details/Index.vue')
const ConnectionForm = () =>
  import(/* webpackChunkName: "connection-form" */ '@tap/business/src/views/connections/DatabaseForm')
const VerificationForm = () => import(/* webpackChunkName: "verification-form" */ '@/views/verification/Form')
const VerificationHistory = () => import(/* webpackChunkName: "verification-history" */ '@/views/verification/History')
const VerificationResult = () => import(/* webpackChunkName: "verification-result" */ '@/views/verification/Result')
const FunctionForm = () => import(/* webpackChunkName: "function-form" */ '@/views/function/Form')
const SharedCacheForm = () => import(/* webpackChunkName: "shared-cache-form" */ '@/views/shared-cache/Form')
const ApiPublishForm = () => import(/* webpackChunkName: "api-publish-form" */ '@/views/api-page/api-publish/Form')
// const RoleDetails = () => import(/* webpackChunkName: "role-details" */ '@/views/role/Role')
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
const NodeEditor = async () => {
  const { Editor } = await import(/* webpackChunkName: "node-design" */ '@tap/node-design')
  return Editor
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
    // component: Parent,
    // children: [
    //   {
    //     path: '',
    //     name: 'migrateList',
    //     component: MigrationMonitor,
    //     meta: {
    //       title: 'page_title_run_monitor',
    //       code: 'Data_SYNC_menu'
    //     }
    //   },
    //   {
    //     path: 'verifyDetails',
    //     name: 'VerifyDetails',
    //     component: () => import(/* webpackChunkName: "etl-list" */ '@/views/verification/VerifyDetails'),
    //     meta: {
    //       title: 'page_title_data_verification',
    //       code: 'Data_verify_menu'
    //     }
    //   }
    // ],
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
            component: () => import(/* webpackChunkName: "connection-list" */ '@/views/connection/List.tsx'),
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
      /* ---------- 数据发现  ----------*/
      {
        path: '/dataDiscovery',
        name: 'dataDiscovery',
        component: Parent,
        redirect: 'dataDiscovery',
        meta: {
          title: '数据对象'
        },
        children: [
          {
            path: '',
            name: 'dataDiscovery',
            component: () => import(/* webpackChunkName: "connection-list" */ '@/views/dataDiscovery/List'),
            meta: {
              title: '数据对象',
              code: 'datasource_menu'
            }
          },
          {
            path: '/catalogue',
            name: 'catalogue',
            component: () => import(/* webpackChunkName: "connection-list" */ '@/views/dataDiscovery/Catalogue.tsx'),
            meta: {
              title: '数据目录',
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
            component: () => import(/* webpackChunkName: "migrate-list" */ '@/views/task/MigrationList.tsx'),
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
            component: () => import(/* webpackChunkName: "etl-list" */ '@tap/business/src/views/task/etl/List'),
            meta: {
              title: 'page_title_data_develop',
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
                component: () =>
                  import(/* webpackChunkName: "etl-details" */ '@tap/business/src/views/task/etl/Details'),
                meta: {
                  title: 'page_title_run_monitor',
                  code: 'Data_SYNC_menu'
                }
              },
              {
                path: 'statistics/:subId',
                name: 'dataflowStatistics',
                component: () =>
                  import(/* webpackChunkName: "etl-statistics" */ '@tap/business/src/views/task/etl/statistics/Index'),
                meta: {
                  title: 'page_title_task_stat',
                  code: 'Data_SYNC_menu'
                }
              }
            ]
          }
        ]
      },
      /* ---------- 数据校验  ----------*/
      {
        path: '/dataVerification',
        name: 'dataVerification',
        component: Parent,
        redirect: 'dataVerification/',
        meta: {
          title: 'page_title_data_verification'
        },
        children: [
          {
            path: '',
            name: 'dataVerificationList',
            component: () => import(/* webpackChunkName: "verification-list" */ '@/views/verification/List'),
            meta: {
              title: 'page_title_data_verification',
              code: 'Data_verify_menu'
            }
          },
          {
            path: 'create',
            name: 'dataVerificationCreate',
            component: VerificationForm,
            meta: {
              title: 'page_title_task_create',
              code: 'verify_job_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'dataVerificationEdit',
            component: VerificationForm,
            meta: {
              title: 'page_title_task_edit',
              code: 'verify_job_edition'
            }
          },
          {
            path: ':id/details',
            name: 'dataVerifyDetails',
            component: () => import(/* webpackChunkName: "verification-details" */ '@/views/verification/Details'),
            meta: {
              title: 'page_title_task_details',
              code: 'Data_verify'
            }
          },
          {
            path: ':id/history',
            name: 'dataVerifyHistory',
            component: VerificationHistory,
            meta: {
              title: 'page_title_data_verification_history',
              code: 'Data_verify'
            }
          },
          {
            path: '/dataVerifyResult/:id/history',
            name: 'VerifyDiffHistory',
            component: VerificationHistory,
            meta: {
              title: 'page_title_diff_verification_history',
              code: 'Data_verify'
            }
          },
          {
            path: '/dataVerifyResult/:id/details',
            name: 'VerifyDiffDetails',
            component: VerificationResult,
            meta: {
              title: 'page_title_diff_verification_details',
              code: 'Data_verify'
            }
          },
          {
            path: '/dataVerifyResult/:id',
            name: 'dataVerifyResult',
            component: VerificationResult,
            meta: {
              title: 'page_title_data_verification_result',
              code: 'Data_verify'
            }
          },
          {
            path: ':id/verifyDetails',
            name: 'VerifyDetails',
            component: () => import(/* webpackChunkName: "etl-list" */ '@/views/verification/VerifyDetails'),
            meta: {
              title: 'page_title_data_verify_details',
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
      /* ---------- 数据目录  ----------*/
      {
        path: '/catalogue',
        name: 'metadata',
        component: Parent,
        redirect: 'catalogue/',
        meta: {
          title: 'page_title_data_catalogue'
        },
        children: [
          {
            path: '',
            name: 'metadataList',
            component: () => import(/* webpackChunkName: "metadata" */ '@/views/metadata/List'),
            meta: {
              title: 'page_title_data_catalogue',
              code: 'data_catalog_menu',
              types: ['table', 'view', 'collection']
              // 'mongo_view'
            }
          },
          {
            path: ':id/details',
            name: 'metadataDetails',
            component: () => import(/* webpackChunkName: "metadata-details" */ '@/views/metadata/Info'),
            meta: {
              code: 'data_catalog_menu',
              title: 'page_title_data_catalogue_info'
            }
          }
        ]
      },
      /* ---------- 数据搜索  ----------*/
      {
        path: '/search',
        name: 'search',
        component: () => import(/* webpackChunkName: "metadata-search" */ '@/views/metadata/Search'),
        meta: {
          title: 'page_title_data_search',
          code: 'data_search_menu'
        }
      },
      /* ---------- API发布  ----------*/
      {
        path: '/api-publish',
        name: 'apiPublish',
        component: Parent,
        redirect: 'api-publish/',
        meta: {
          title: 'page_title_api_publish'
        },
        children: [
          {
            path: '',
            name: 'apiPublishList',
            component: () => import(/* webpackChunkName: "api-publish" */ '@/views/api-page/api-publish/List'),
            meta: {
              title: 'page_title_api_publish',
              code: 'API_management_menu'
            }
          },
          {
            path: 'create',
            name: 'apiPublishCreate',
            component: ApiPublishForm,
            meta: {
              title: 'page_title_api_publish_create',
              code: 'API_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'apiPublishEdit',
            component: ApiPublishForm,
            meta: {
              title: 'page_title_api_publish_edit',
              code: 'API_edition'
            }
          }
        ]
      },
      /* ---------- API浏览  ----------*/
      {
        path: '/api-browse',
        name: 'apiExplorer',
        component: () => import(/* webpackChunkName: "api-explorer" */ '@/views/api-page/ApiExplorer'),
        meta: {
          title: 'page_title_api_browse',
          code: 'API_data_explorer_menu'
        }
      },
      /* ---------- API测试  ----------*/
      {
        path: '/api-test',
        name: 'apiDocAndTest',
        component: () => import(/* webpackChunkName: "api-doc-and-test" */ '@/views/api-page/ApiDocAndTest'),
        meta: {
          title: 'page_title_api_test',
          code: 'API_doc_&_test_menu'
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
      /* ---------- API审计  ----------*/
      {
        path: '/api-audit',
        name: 'apiAudit',
        component: Parent,
        redirect: 'api-audit/',
        meta: {
          title: 'page_title_api_audit',
          code: 'API_clients_menu'
        },
        children: [
          {
            path: '',
            name: 'apiAuditList',
            component: () => import(/* webpackChunkName: "api-audit" */ '@/views/api-page/ApiAudit'),
            meta: {
              title: 'page_title_api_audit',
              code: 'API_clients_menu'
            }
          },
          {
            path: ':id/details',
            name: 'apiAuditDetails',
            component: () => import(/* webpackChunkName: "api-audit-details" */ '@/views/api-page/ApiAuditInfo'),
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
      }
    ]
  }
]
