const MigrateForm = () => import(/* webpackChunkName: "task-form" */ '../views/task/migrate/form/Form.vue')
const MigrateDetails = () => import(/* webpackChunkName: "task-form" */ '../views/task/migrate/details/Index.vue')
const DagEditor = async () => {
  const { Editor } = await import('@daas/dag')
  return Editor
}
const NodeEditor = async () => {
  const { Editor } = await import('@daas/node-design')
  return Editor
}
export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login/Login'),
    title: 'tap.login'
  },
  {
    path: '/registry',
    name: 'registry',
    component: () => import('@/views/Login/Registration'),
    meta: {
      title: 'tap.registry'
    }
  },
  {
    path: '/verificationEmail',
    name: 'verificationEmail',
    component: () => import('@/views/Login/VerificationEmail'),
    meta: {
      title: 'tap.verificationEmail'
    }
  },
  {
    path: '/registyResult',
    name: 'registyResult',
    component: () => import('@/views/Login/RegistyResult'),
    meta: {
      title: 'tap.registry'
    }
  },
  {
    path: '/passwordReset',
    name: 'passwordReset',
    component: () => import('@/views/Login/PasswordReset'),
    meta: {
      title: 'tap.passwordReset'
    }
  },
  {
    path: '/job',
    name: 'job',
    component: () => import('@/views/job/Job'),
    meta: {
      title: 'tap.jobFlow',
      code: 'Data_SYNC'
    }
  },
  {
    path: '/createTask/create',
    name: 'createTask',
    component: () => import('@/views/createTask/createTask')
  },
  {
    path: '/createTask/:id/edit',
    name: 'editTask',
    component: () => import('@/views/createTask/createTask')
  },
  {
    path: '/guide',
    name: 'guide',
    component: () => import('@/views/Guide')
  },
  {
    path: '/dataflow/editor',
    name: 'DataflowNew',
    component: DagEditor
  },
  {
    path: '/dataflow/editor/:id',
    name: 'DataflowEditor',
    component: DagEditor
  },
  {
    path: '/node/editor',
    name: 'NodeEditor',
    component: NodeEditor
  },
  {
    path: '/',
    name: 'layout',
    redirect: 'dashboard',
    component: () => import('@/views/Layout'),
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard'),
        meta: { title: 'tap.home', isCollapse: false }
      },
      {
        path: '/connections',
        name: 'connections',
        component: () => import('@/views/connections/List'),
        meta: {
          code: 'datasource_menu',
          title: 'connection_title',
          isCollapse: false,
          showTitle: true,
          desc: 'connection_list_desc'
        }
      },
      {
        path: '/connections/create',
        name: 'connectionsCreate',
        component: () => import('@/views/connections/DatabaseForm'),
        meta: {
          title: 'menu_title_connections_create',
          isCollapse: true,
          code: 'datasource_creation',
          showTitle: true
        }
      },
      {
        path: '/connections/:id/edit',
        name: 'connectionsEdit',
        component: () => import('@/views/connections/DatabaseForm'),
        meta: {
          title: 'menu_title_connections_edit',
          isCollapse: true,
          code: 'datasource_edition',
          showTitle: true
        }
      },
      {
        path: '/metadataSearch',
        name: 'metadataSearch',
        component: () => import('@/views/metadata/Search'),
        meta: {
          title: 'tap.metadataSearch',
          isCollapse: true,
          showTitle: true
        }
      },
      {
        path: '/metadataDefinition',
        name: 'metadataDefinition',
        component: () => import('@/views/metadata/List'),
        meta: {
          code: 'data_catalog_menu',
          title: 'tap.dataCatalog',
          isCollapse: true,
          showTitle: true,
          types: [
            'table',
            'view',
            'collection',
            'mongo_view',
            'database',
            'job',
            'dataflow',
            'api',
            'directory',
            'ftp',
            'apiendpoint'
          ]
        }
      },
      {
        path: '/metadataDetails',
        name: 'metadataDetails',
        component: () => import('@/views/metadata/Info'),
        meta: {
          code: 'data_catalog_menu',
          title: 'tap.dataCatalog',
          showTitle: true,
          isCollapse: true
        }
      },
      {
        path: '/dataQuality/:id',
        name: 'dataQualityDetail',
        component: () => import('@/views/dataQuality/DataQualityDetail'),
        meta: {
          code: 'data_quality_edition',
          title: 'tap.dataQuality',
          showTitle: true,
          isCollapse: true
        }
      },
      {
        path: '/dataQuality',
        name: 'dataQuality',
        component: () => import('@/views/dataQuality/DataQuality'),
        meta: {
          code: 'data_quality_menu',
          title: 'tap.dataQuality',
          isCollapse: true,
          showTitle: true,
          types: ['collection']
        }
      },
      {
        path: '/ttl',
        name: 'timeToLive',
        component: () => import('@/views/TimeToLive/List'),
        meta: {
          code: 'time_to_live_menu',
          title: 'tap.TimeToLive',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/dataRules',
        name: 'dataRules',
        component: () => import('@/views/dataRules/List'),
        meta: {
          code: 'data_rules_menu',
          title: 'tap.dataRules',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/dictionary',
        name: 'dictionary',
        component: () => import('@/views/dictionary/List'),
        meta: {
          code: 'dictionary_menu',
          title: 'tap.dictionary',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/modules',
        name: 'modules',
        component: () => import('@/views/apiPage/Modules'),
        meta: {
          code: 'API_management_menu',
          title: 'tap.apiManagement',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/module',
        name: 'module',
        component: () => import('@/views/apiPage/ModuleForm'),
        meta: {
          code: 'API_creation',
          showTitle: true
        }
      },
      {
        path: '/module/:id',
        name: 'editModule',
        component: () => import('@/views/apiPage/ModuleForm'),
        meta: {
          code: 'API_edition',
          showTitle: true
        }
      },
      {
        path: '/dataExplorer',
        name: 'dataExplorer',
        component: () => import('@/views/apiPage/DataExplorer'),
        meta: {
          code: 'API_data_explorer_menu',
          title: 'tap.dataExplor',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/apiDocAndTest',
        name: 'apiDocAndTest',
        component: () => import('@/views/apiPage/ApiDocAndTest'),
        meta: {
          code: 'API_doc_&_test_menu',
          title: 'tap.docTest',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/apiAnalysis',
        name: 'apiAnalysis',
        component: () => import('@/views/apiPage/ApiAnalysis'),
        meta: {
          code: 'API_stats_menu',
          title: 'tap.apiStats',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/applications',
        name: 'applications',
        component: () => import('@/views/apiPage/Applications'),
        meta: {
          code: 'API_clients_menu',
          title: 'tap.apiClients',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/apiServers',
        name: 'apiServers',
        component: () => import('@/views/apiPage/ApiServers'),
        meta: {
          code: 'API_server_menu',
          title: 'tap.apiSever',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/tasks',
        name: 'tasks',
        component: () => import('@/views/scheduleTasks/List'),
        meta: {
          code: 'schedule_jobs_menu',
          title: 'tap.jobSchedule',
          showTitle: true,
          isCollapse: false
        }
      },

      {
        path: '/taskHistories',
        name: 'taskHistories',
        component: () => import('@/views/scheduleTasks/Histories'),
        meta: {
          code: 'schedule_jobs_menu',
          title: 'tap.taskHistories',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/agents',
        name: 'agents',
        component: () => import('@/views/process/List'),
        meta: {
          code: 'agents_menu',
          title: 'tap.agentManagement',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('@/views/Users/List'),
        meta: {
          code: 'user_management_menu',
          title: 'tap.userManagement',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/roles',
        name: 'roles',
        component: () => import('@/views/Role/Roles'),
        meta: {
          code: 'role_management_menu',
          title: 'tap.roleManagement',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/role',
        name: 'role',
        component: () => import('@/views/Role/Role'),
        meta: {
          code: 'role_creation',
          showTitle: true
        }
      },
      {
        path: '/role/:id',
        name: 'editRole',
        component: () => import('@/views/Role/Role'),
        meta: {
          code: 'role_edition',
          showTitle: true
        }
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/setting/Setting'),
        meta: {
          code: 'system_settings_menu',
          title: 'tap.systemSettings',
          showTitle: true,
          isCollapse: false
        }
      },
      /*-----------------------------------------------------------------*/
      {
        path: '/clusterManagement',
        name: 'clusterManagement',
        component: () => import('@/views/clusterManagement/clusterManagement'),
        meta: {
          code: 'Cluster_management_menu',
          title: 'tap.clusterManagement',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/dailyRecord',
        name: 'dailyRecord',
        component: () => import('@/views/clusterManagement/dailyRecord')
      },
      {
        path: '/migrate',
        name: 'migrate',
        component: () => import('@/views/task/migrate/List'),
        meta: {
          code: 'Data_SYNC_menu',
          title: 'tap.jobFlow',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/migrate/editor',
        name: 'MigrateNew',
        component: MigrateForm,
        meta: {
          title: '创建任务',
          showTitle: true,
          listRoute: {
            name: 'migrate'
          }
        }
      },
      {
        path: '/migrate/editor/:id',
        name: 'MigrateEditor',
        component: MigrateForm,
        meta: {
          title: '编辑任务',
          showTitle: true,
          listRoute: {
            name: 'migrate'
          }
        }
      },
      {
        path: '/migrate/details/:id',
        name: 'MigrateDetails',
        component: MigrateDetails,
        meta: {
          title: '任务详情',
          showTitle: true,
          listRoute: {
            name: 'migrate'
          }
        }
      },
      {
        path: '/sharedMining',
        name: 'sharedMining',
        component: () => import('@/views/task/sharedMining/List'),
        meta: {
          code: 'Data_SYNC_menu',
          title: 'menu_title_sharedMining',
          isCollapse: false,
          showTitle: true
        }
      },
      {
        path: '/sharedMining/details/:id',
        name: 'SharedMiningDetails',
        component: () => import('@/views/task/sharedMining/Detail'),
        meta: {
          title: '挖掘详情',
          showTitle: true
        }
      },
      {
        path: '/dataflow',
        name: 'dataflow',
        component: () => import('@/views/task/etl/List'),
        meta: {
          code: 'Data_SYNC_menu',
          title: 'tap.jobFlow',
          isCollapse: false,
          showTitle: true
        }
      },
      {
        path: '/dataflow/details/:id',
        name: 'dataflowDetails',
        component: () => import('@/views/task/etl/Details'),
        meta: {
          title: '同步任务详情',
          showTitle: true,
          listRoute: {
            name: 'dataflow'
          }
        }
      },
      {
        path: '/dataflow/details/:id/statistics/:subId',
        name: 'dataflowStatistics',
        component: () => import('@/views/task/etl/statistics/Index'),
        meta: {
          title: '同步任务统计',
          showTitle: true,
          listRoute: {
            name: 'dataflowDetails'
          }
        }
      },
      {
        path: '/relations',
        name: 'relations',
        component: () => import('@/views/relations/relations'),
        meta: {
          showTitle: true
        }
      },
      {
        path: '/dataMap',
        name: 'dataMap',
        component: () => import('@/views/dataMap/DataMap'),
        meta: {
          code: 'data_lineage_menu',
          title: 'tap.dataLineage',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/upload',
        name: 'upload',
        component: () => import('@/views/Upload'),
        meta: {
          title: 'tap.upload',
          code: 'SYNC_job_import',
          showTitle: true,
          isCollapse: false
        }
      },
      {
        path: '/apiInfo',
        name: 'apiInfo',
        component: () => import('@/views/job/apiInfo'),
        meta: { title: 'tap.apiInfo', showTitle: true, isCollapse: false }
      },
      {
        path: '/function',
        name: 'function',
        component: () => import('@/views/function/List'),
        meta: {
          isCollapse: false,
          showTitle: true,
          code: 'SYNC_Function_management'
        }
      },
      {
        path: '/function/create',
        name: 'FunctionCreate',
        component: () => import('@/views/function/Form'),
        meta: {
          isCollapse: false,
          showTitle: true,
          code: 'SYNC_Function_management'
        }
      },
      {
        path: '/function/import',
        name: 'FunctionImport',
        component: () => import('@/views/function/ImportForm'),
        meta: {
          isCollapse: false,
          showTitle: true,
          code: 'SYNC_Function_management'
        }
      },
      {
        path: '/function/edit/:id',
        name: 'FunctionEdit',
        component: () => import('@/views/function/Form'),
        meta: {
          isCollapse: false,
          showTitle: true,
          code: 'SYNC_Function_management'
        }
      },
      {
        path: '/function/details/:id',
        name: 'FunctionDetails',
        component: () => import('@/views/function/Details'),
        meta: {
          isCollapse: false,
          showTitle: true,
          code: 'SYNC_Function_management'
        }
      },
      {
        path: '/tableFlows',
        name: 'tableFlows',
        component: () => import('@/views/task/TableFlows'),
        meta: { isCollapse: true, showTitle: true }
      },

      {
        path: '/dataVerification/:id/edit',
        name: 'dataVerificationEdit',
        component: () => import('@/views/dataVerification/Form'),
        meta: {
          title: 'app.menu.dataVerification',
          isCollapse: true,
          showTitle: true,
          code: 'verify_job_edition'
        }
      },
      {
        path: '/dataVerification/:id/details',
        name: 'dataVerifyDetails',
        component: () => import('@/views/dataVerification/Details'),
        meta: {
          title: 'verify_details_title',
          isCollapse: true,
          showTitle: true,
          code: 'Data_verify'
        }
      },
      {
        path: '/dataVerification/create',
        name: 'dataVerificationCreate',
        component: () => import('@/views/dataVerification/Form'),
        meta: {
          title: 'app.menu.dataVerification',
          isCollapse: true,
          showTitle: true,
          code: 'verify_job_creation'
        }
      },
      {
        path: '/dataVerification',
        name: 'dataVerification',
        component: () => import('@/views/dataVerification/List'),
        meta: {
          title: 'app.menu.dataVerification',
          isCollapse: true,
          showTitle: true,
          code: 'Data_verify_menu'
        }
      },
      {
        path: '/dataVerification/:id/history',
        name: 'dataVerifyHistory',
        component: () => import('@/views/dataVerification/History'),
        meta: {
          title: 'verify_history_title',
          isCollapse: true,
          showTitle: true,
          code: 'Data_verify'
        }
      },
      {
        path: '/dataVerifyResult/:id/history',
        name: 'VerifyDiffHistory',
        component: () => import('@/views/dataVerification/History'),
        meta: {
          title: 'verify_diff_history_title',
          isCollapse: true,
          showTitle: true,
          code: 'Data_verify'
        }
      },
      {
        path: '/dataVerifyResult/:id/details',
        name: 'VerifyDiffDetails',
        component: () => import('@/views/dataVerification/Result'),
        meta: {
          title: 'verify_diff_details_title',
          isCollapse: true,
          showTitle: true,
          code: 'Data_verify'
        }
      },
      {
        path: '/dataVerifyResult/:id',
        name: 'dataVerifyResult',
        component: () => import('@/views/dataVerification/Result'),
        meta: {
          title: 'verify_result_title',
          isCollapse: true,
          showTitle: true,
          code: 'Data_verify'
        }
      },
      {
        path: '/agentDown',
        name: 'agentDown',
        component: () => import('@/views/downAgent/agentDown')
      },
      {
        path: '/notification',
        name: 'notification',
        component: () => import('@/views/notification/Center'),
        meta: {
          title: 'notification.systemNotice',
          showTitle: true,
          isCollapse: true
        }
      },
      {
        path: '/settingCenter',
        name: 'settingCenter',
        redirect: 'settingCenter/accountSetting',
        component: () => import('@/views/setting/SettingCenter'),
        meta: {
          title: 'tap.settingCenter',
          showTitle: true,
          isCollapse: true
        },
        children: [
          {
            path: 'accountSetting',
            name: 'accountSetting',
            component: () => import('@/views/setting/AccountSetting'),
            meta: { title: 'tap.account', showTitle: true, isCollapse: true }
          },
          {
            path: 'notificationSetting',
            name: 'notificationSetting',
            component: () => import('@/views/setting/NotificationSetting'),
            meta: { title: 'notification.setting', showTitle: true, isCollapse: true }
          }
        ]
      },
      {
        path: '/metadata',
        name: 'metadata',
        component: () => import('@/views/metadata/List'),
        meta: {
          code: 'data_catalog_menu',
          title: 'tap.dataCatalog',
          isCollapse: true,
          showTitle: true,
          types: ['table', 'view', 'collection', 'mongo_view']
        }
      },
      {
        path: '/taskProgressInfo',
        name: 'taskProgressInfo',
        component: () => import('@/views/job/TaskProgressInfo')
      },
      {
        path: 'license',
        name: 'License',
        component: () => import('@/views/License')
      },
      {
        path: 'solutions',
        name: 'Solutions',
        component: () => import('@/views/solutions/Index'),
        meta: {
          title: 'solution_name',
          showTitle: true
        }
      }
    ]
  }
]
