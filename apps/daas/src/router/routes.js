import Parent from './Parent.vue'
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
    path: '/node/editor',
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
    path: '/',
    name: 'layout',
    redirect: 'dashboard',
    component: () => import('@/views/Layout'),
    children: [
      /* ---------- 控制台  ----------*/
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard'),
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
            component: () => import('@/views/connections/List'),
            meta: {
              title: 'page_title_connections',
              code: 'datasource_menu',
              desc: (h, t) => {
                return [
                  t('connection_list_desc'),
                  h(
                    'ElLink',
                    { props: { type: 'primary', href: 'https://docs.tapdata.net/data-source' }, class: 'ml-1' },
                    [t('connection_list_help_doc')]
                  )
                ]
              }
            }
          },
          {
            path: 'create',
            name: 'connectionsCreate',
            component: () => import('@/views/connections/DatabaseForm'),
            meta: {
              title: 'page_title_connections_create',
              code: 'datasource_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'connectionsEdit',
            component: () => import('@/views/connections/DatabaseForm'),
            meta: {
              title: 'page_title_connections_edit',
              code: 'datasource_edition'
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
            component: () => import('@/views/task/migrate/List'),
            meta: {
              title: 'page_title_data_copy',
              code: 'Data_SYNC_menu'
            }
          },
          {
            path: 'editor',
            name: 'MigrateNew',
            component: MigrateForm,
            meta: {
              title: 'page_title_task_create',
              code: 'Data_SYNC_menu'
            }
          },
          {
            path: 'editor/:id',
            name: 'MigrateEditor',
            component: MigrateForm,
            meta: {
              title: 'page_title_task_edit',
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
            component: () => import('@/views/task/etl/List'),
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
              title: 'page_title_task_details'
            },
            children: [
              {
                path: '',
                name: 'dataflowDetails',
                component: () => import('@/views/task/etl/Details'),
                meta: {
                  title: 'page_title_task_details',
                  code: 'Data_SYNC_menu'
                }
              },
              {
                path: 'statistics/:subId',
                name: 'dataflowStatistics',
                component: () => import('@/views/task/etl/statistics/Index'),
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
            component: () => import('@/views/dataVerification/List'),
            meta: {
              title: 'page_title_data_verification',
              code: 'Data_verify_menu'
            }
          },
          {
            path: 'create',
            name: 'dataVerificationCreate',
            component: () => import('@/views/dataVerification/Form'),
            meta: {
              title: 'page_title_task_create',
              code: 'verify_job_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'dataVerificationEdit',
            component: () => import('@/views/dataVerification/Form'),
            meta: {
              title: 'page_title_task_edit',
              code: 'verify_job_edition'
            }
          },
          {
            path: ':id/details',
            name: 'dataVerifyDetails',
            component: () => import('@/views/dataVerification/Details'),
            meta: {
              title: 'page_title_task_details',
              code: 'Data_verify'
            }
          },
          {
            path: ':id/history',
            name: 'dataVerifyHistory',
            component: () => import('@/views/dataVerification/History'),
            meta: {
              title: 'page_title_data_verification_history',
              code: 'Data_verify'
            }
          },
          {
            path: '/dataVerifyResult/:id/history',
            name: 'VerifyDiffHistory',
            component: () => import('@/views/dataVerification/History'),
            meta: {
              title: 'page_title_diff_verification_history',
              code: 'Data_verify'
            }
          },
          {
            path: '/dataVerifyResult/:id/details',
            name: 'VerifyDiffDetails',
            component: () => import('@/views/dataVerification/Result'),
            meta: {
              title: 'page_title_diff_verification_details',
              code: 'Data_verify'
            }
          },
          {
            path: '/dataVerifyResult/:id',
            name: 'dataVerifyResult',
            component: () => import('@/views/dataVerification/Result'),
            meta: {
              title: 'page_title_data_verification_result',
              code: 'Data_verify'
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
          title: 'page_title_sharedMining'
        },
        children: [
          {
            path: '',
            name: 'sharedMiningList',
            component: () => import('@/views/task/sharedMining/List'),
            meta: {
              title: 'page_title_shared_mining',
              code: 'Data_SYNC_menu'
            }
          },
          {
            path: 'details/:id',
            name: 'SharedMiningDetails',
            component: () => import('@/views/task/sharedMining/Detail'),
            meta: {
              title: 'page_title_shared_mining_details',
              code: 'Data_SYNC_menu'
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
            component: () => import('@/views/function/List'),
            meta: {
              title: 'page_title_function',
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'create',
            name: 'FunctionCreate',
            component: () => import('@/views/function/Form'),
            meta: {
              title: 'page_title_function_create',
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'import',
            name: 'FunctionImport',
            component: () => import('@/views/function/ImportForm'),
            meta: {
              title: 'page_title_function_import',
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'edit/:id',
            name: 'FunctionEdit',
            component: () => import('@/views/function/Form'),
            meta: {
              title: 'page_title_function_edit',
              code: 'SYNC_Function_management'
            }
          },
          {
            path: 'details/:id',
            name: 'FunctionDetails',
            component: () => import('@/views/function/Details'),
            meta: {
              title: 'page_title_function_details',
              code: 'SYNC_Function_management'
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
            component: () => import('@/views/shared-cache/List'),
            meta: {
              title: 'page_title_shared_cache'
            }
          },
          {
            path: 'create',
            name: 'sharedCacheCreate',
            component: () => import('@/views/shared-cache/Form'),
            meta: {
              title: 'page_title_shared_cache_create'
            }
          },
          {
            path: ':id/edit',
            name: 'sharedCacheEdit',
            component: () => import('@/views/shared-cache/Form'),
            meta: {
              title: 'page_title_shared_cache_edit'
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
            component: () => import('@/views/metadata/List'),
            meta: {
              title: 'page_title_data_catalogue',
              code: 'data_catalog_menu',
              types: ['table', 'view', 'collection', 'mongo_view']
            }
          },
          {
            path: ':id/details',
            name: 'metadataDetails',
            component: () => import('@/views/metadata/Info'),
            meta: {
              code: 'data_catalog_menu',
              title: 'tap.dataCatalog'
            }
          }
        ]
      },
      /* ---------- 数据搜索  ----------*/
      {
        path: '/search',
        name: 'search',
        component: () => import('@/views/metadata/Search'),
        meta: {
          title: 'page_title_data_search',
          code: 'data_catalog_menu'
        }
      },
      /* ---------- API发布  ----------*/
      {
        path: '/api-publish',
        name: 'publish',
        component: Parent,
        redirect: 'api-publish/',
        meta: {
          title: 'page_title_api_publish'
        },
        children: [
          {
            path: '',
            name: 'modules',
            component: () => import('@/views/apiPage/Modules'),
            meta: {
              title: 'page_title_api_publish',
              code: 'API_management_menu'
            }
          },
          {
            path: 'create',
            name: 'module',
            component: () => import('@/views/apiPage/ModuleForm'),
            meta: {
              title: 'page_title_api_publish',
              code: 'API_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'editModule',
            component: () => import('@/views/apiPage/ModuleForm'),
            meta: {
              title: 'page_title_api_publish',
              code: 'API_edition'
            }
          }
        ]
      },
      /* ---------- API浏览  ----------*/
      {
        path: '/api-browse',
        name: 'dataExplorer',
        component: () => import('@/views/apiPage/DataExplorer'),
        meta: {
          title: 'page_title_api_browse',
          code: 'API_data_explorer_menu'
        }
      },
      /* ---------- API测试  ----------*/
      {
        path: '/api-test',
        name: 'apiDocAndTest',
        component: () => import('@/views/apiPage/ApiDocAndTest'),
        meta: {
          title: 'page_title_api_test',
          code: 'API_doc_&_test_menu'
        }
      },
      /* ---------- API统计  ----------*/
      {
        path: '/api-statistics',
        name: 'apiAnalysis',
        component: () => import('@/views/apiPage/ApiAnalysis'),
        meta: {
          title: 'page_title_api_stat',
          code: 'API_stats_menu'
        }
      },
      /* ---------- API审计  ----------*/
      {
        path: '/api-audit',
        name: 'applications',
        component: () => import('@/views/apiPage/Applications'),
        meta: {
          title: 'page_title_api_audit',
          code: 'API_clients_menu'
        }
      },
      /* ---------- API监控  ----------*/
      {
        path: '/api-monitor',
        name: 'apiServers',
        component: () => import('@/views/apiPage/ApiServers'),
        meta: {
          title: 'page_title_api_monitor',
          code: 'API_server_menu'
        }
      },
      /* ---------- 元数据管理  ----------*/
      {
        path: '/metadata',
        name: 'metadataDefinition',
        component: () => import('@/views/metadata/List'),
        meta: {
          title: 'page_title_data_metadata',
          code: 'data_catalog_menu',
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
      /* ---------- 调度任务  ----------*/
      {
        path: '/schedule-task',
        name: 'tasks',
        component: () => import('@/views/scheduleTasks/List'),
        meta: {
          title: 'page_title_schedule',
          code: 'schedule_jobs_menu'
        }
      },
      /* ---------- 集群管理  ----------*/
      {
        path: '/cluster',
        name: 'clusterManagement',
        component: () => import('@/views/clusterManagement/clusterManagement'),
        meta: {
          title: 'page_title_cluster',
          code: 'Cluster_management_menu'
        }
      },
      /* ---------- 进程管理  ----------*/
      {
        path: '/process',
        name: 'agents',
        component: () => import('@/views/process/List'),
        meta: {
          title: 'page_title_process',
          code: 'agents_menu'
        }
      },
      /* ---------- 用户管理  ----------*/
      {
        path: '/user',
        name: 'users',
        component: () => import('@/views/Users/List'),
        meta: {
          title: 'page_title_user',
          code: 'user_management_menu'
        }
      },
      /* ---------- 角色管理  ----------*/
      {
        path: '/role',
        name: 'role',
        component: Parent,
        redirect: 'role/',
        meta: {
          title: 'page_title_role'
        },
        children: [
          {
            path: '',
            name: 'roleList',
            component: () => import('@/views/Role/Roles'),
            meta: {
              title: 'page_title_role',
              code: 'role_management_menu'
            }
          },
          {
            path: 'create',
            name: 'role',
            component: () => import('@/views/Role/Role'),
            meta: {
              title: 'page_title_role',
              code: 'role_creation'
            }
          },
          {
            path: ':id/edit',
            name: 'editRole',
            component: () => import('@/views/Role/Role'),
            meta: {
              title: 'page_title_role',
              code: 'role_edition'
            }
          }
        ]
      },
      /* ---------- 系统设置  ----------*/
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/setting/Setting'),
        meta: {
          title: 'page_title_setting',
          code: 'system_settings_menu'
        }
      },
      /* ---------- 不确定路由  ----------*/
      {
        path: '/relations',
        name: 'relations',
        component: () => import('@/views/relations/relations')
      },
      {
        path: '/taskHistories',
        name: 'taskHistories',
        component: () => import('@/views/scheduleTasks/Histories'),
        meta: {
          code: 'schedule_jobs_menu',
          title: 'tap.taskHistories'
        }
      },
      {
        path: '/dailyRecord',
        name: 'dailyRecord',
        component: () => import('@/views/clusterManagement/dailyRecord')
      },
      {
        path: '/upload',
        name: 'upload',
        component: () => import('@/views/Upload'),
        meta: {
          title: 'tap.upload',
          code: 'SYNC_job_import'
        }
      },
      {
        path: '/dataQuality/:id',
        name: 'dataQualityDetail',
        component: () => import('@/views/dataQuality/DataQualityDetail'),
        meta: {
          code: 'data_quality_edition',
          title: 'tap.dataQuality'
        }
      },
      {
        path: '/dataQuality',
        name: 'dataQuality',
        component: () => import('@/views/dataQuality/DataQuality'),
        meta: {
          code: 'data_quality_menu',
          title: 'tap.dataQuality',
          types: ['collection']
        }
      },
      {
        path: '/ttl',
        name: 'timeToLive',
        component: () => import('@/views/TimeToLive/List'),
        meta: {
          code: 'time_to_live_menu',
          title: 'tap.TimeToLive'
        }
      },
      {
        path: '/dataRules',
        name: 'dataRules',
        component: () => import('@/views/dataRules/List'),
        meta: {
          code: 'data_rules_menu',
          title: 'tap.dataRules'
        }
      },
      {
        path: '/dictionary',
        name: 'dictionary',
        component: () => import('@/views/dictionary/List'),
        meta: {
          code: 'dictionary_menu',
          title: 'tap.dictionary'
        }
      },
      {
        path: '/dataMap',
        name: 'dataMap',
        component: () => import('@/views/dataMap/DataMap'),
        meta: {
          code: 'data_lineage_menu',
          title: 'tap.dataLineage'
        }
      },
      {
        path: '/apiInfo',
        name: 'apiInfo',
        component: () => import('@/views/job/apiInfo'),
        meta: { title: 'tap.apiInfo' }
      },

      {
        path: '/tableFlows',
        name: 'tableFlows',
        component: () => import('@/views/task/TableFlows')
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
          title: 'notification.systemNotice'
        }
      },
      {
        path: '/settingCenter',
        name: 'settingCenter',
        redirect: 'settingCenter/accountSetting',
        component: () => import('@/views/setting/SettingCenter'),
        meta: {
          title: 'tap.settingCenter'
        },
        children: [
          {
            path: 'accountSetting',
            name: 'accountSetting',
            component: () => import('@/views/setting/AccountSetting'),
            meta: { title: 'tap.account' }
          },
          {
            path: 'notificationSetting',
            name: 'notificationSetting',
            component: () => import('@/views/setting/NotificationSetting'),
            meta: { title: 'notification.setting' }
          }
        ]
      },
      {
        path: '/taskProgressInfo',
        name: 'taskProgressInfo',
        component: () => import('@/views/job/TaskProgressInfo')
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
