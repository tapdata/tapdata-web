import Vue from 'vue'
import Router from 'vue-router'
import factor from '@/api/factory'
import i18n from '@/i18n'
import { setPermission } from '@/utils/util'
// signOut
import { Loading, Message } from 'element-ui'

Vue.use(Router)
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

const childRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/Dashboard'),
    meta: { title: i18n.t('tap.home'), isCollapse: false }
  },
  {
    path: '/connections',
    name: 'connections',
    component: () => import('@/views/connections/List'),
    meta: {
      code: 'datasource_menu',
      title: i18n.t('connection_title'),
      isCollapse: false,
      showTitle: true,
      desc: i18n.t('connection_list_desc'),
      href: 'https://docs.tapdata.net/data-source',
      hrefText: i18n.t('connection_list_help_doc')
    }
  },
  {
    path: '/connections/create',
    name: 'connectionsCreate',
    component: () => import('@/views/connections/DatabaseForm'),
    meta: {
      title: i18n.t('menu_title_connections_create'),
      isCollapse: true,
      code: 'datasource_creation',
      showTitle: true
    }
  },
  {
    path: '/connections/:id/edit',
    name: 'connectionsEdit',
    component: () => import('@/views/connections/formbuild'),
    meta: {
      title: i18n.t('menu_title_connections_edit'),
      isCollapse: true,
      code: 'datasource_edition',
      showTitle: true
    }
  },
  {
    path: '/connections/oldCreate',
    name: 'connectionsOldCreate',
    component: () => import('@/views/connections/DatabaseForm'),
    meta: {
      title: i18n.t('menu_title_connections_create'),
      isCollapse: true,
      code: 'datasource_creation',
      showTitle: true
    }
  },
  {
    path: '/connections/:id/oldEdit',
    name: 'connectionsOldEdit',
    component: () => import('@/views/connections/DatabaseForm'),
    meta: {
      title: i18n.t('menu_title_connections_edit'),
      isCollapse: true,
      code: 'datasource_edition',
      showTitle: true
    }
  },
  {
    path: '/connection',
    name: 'connection',
    component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'datasource_creation',
      url: '/old/index.html#/connection',
      title: i18n.t('tap.connectionEdtion'),
      isCollapse: false,
      showTitle: true
    }
  },
  {
    path: '/connection/:id',
    name: 'editConnection',
    component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'datasource_edition',
      url: '/old/index.html#/connection',
      title: i18n.t('tap.connectionEdtion'),
      isCollapse: true,
      showTitle: true
    }
  },
  // {
  //   path: '/metadataDefinition',
  //   name: 'metadataDefinition',
  //   component: () => import('@/views/ExternalLink'),
  //   meta: {
  //     code: 'data_catalog_menu',
  //     url: '/old/index.html#/metadataDefinition',
  //     title: i18n.t('tap.metadata'),
  //     isCollapse: false
  //   }
  // },
  // {
  //   path: '/metadataInstances/:id',
  //   name: 'metadataInstances',
  //   component: () => import('@/views/ExternalLink'),
  //   meta: {
  //     code: 'data_catalog_edition',
  //     title: i18n.t('tap.metadataInstances'),
  //     isCollapse: true
  //   }
  // },
  {
    path: '/metadataSearch',
    name: 'metadataSearch',
    component: () => import('@/views/metadata/Search'),
    meta: {
      title: i18n.t('tap.metadataSearch'),
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
      title: i18n.t('tap.dataCatalog'),
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
      title: i18n.t('tap.dataCatalog'),
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
      url: '/old/index.html#/dataQuality',
      title: i18n.t('tap.dataQuality'),
      isCollapse: true,
      showTitle: true,
      types: ['collection']
    }
  },
  {
    path: '/dataQuality/:id',
    name: 'dataQualityDetail',
    component: () => import('@/views/dataQuality/DataQualityDetail'),
    meta: {
      code: 'data_quality_edition',
      title: i18n.t('tap.dataQuality'),
      showTitle: true,
      isCollapse: true
    }
  },
  {
    path: '/ttl',
    name: 'timeToLive',
    component: () => import('@/views/TimeToLive/List'),
    meta: {
      code: 'time_to_live_menu',
      // url: '/old/index.html#/ttl',
      title: i18n.t('tap.TimeToLive'),
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
      title: i18n.t('tap.dataRules'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/topology',
    name: 'topology',
    component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'Topology_menu',
      url: '/old/index.html#/topology',
      title: i18n.t('tap.topology'),
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
      title: i18n.t('tap.dictionary'),
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
      title: i18n.t('tap.apiManagement'),
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
    // component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'API_data_explorer_menu',
      // url: '/old/index.html#/dataExplorer',
      title: i18n.t('tap.dataExplor'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/apiDocAndTest',
    name: 'apiDocAndTest',
    // component: () => import('@/views/ExternalLink'),
    component: () => import('@/views/apiPage/ApiDocAndTest'),
    meta: {
      code: 'API_doc_&_test_menu',
      // url: '/old/index.html#/apiDocAndTest',
      title: i18n.t('tap.docTest'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/apiAnalysis',
    name: 'apiAnalysis',
    component: () => import('@/views/apiPage/ApiAnalysis'),
    // component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'API_stats_menu',
      // url: '/old/index.html#/apiAnalysis',
      title: i18n.t('tap.apiStats'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/applications',
    name: 'applications',
    component: () => import('@/views/apiPage/Applications'),
    // component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'API_clients_menu',
      // url: '/old/index.html#/applications',
      title: i18n.t('tap.apiClients'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/apiServers',
    name: 'apiServers',
    component: () => import('@/views/apiPage/ApiServers'),
    // component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'API_server_menu',
      // url: '/old/index.html#/apiServers',
      title: i18n.t('tap.apiSever'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/dataCollect',
    name: 'dataCollect',
    component: () => import('@/views/ExternalLink'),
    meta: {
      url: '/old/index.html#/dataCollect',
      title: i18n.t('tap.dataCollect'),
      code: 'data_collect(old)_menu',
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
      title: i18n.t('tap.jobSchedule'),
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
      title: i18n.t('tap.taskHistories'),
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
      title: i18n.t('tap.agentManagement'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/serversOversee',
    name: 'serversOversee',
    component: () => import('@/views/ExternalLink'),
    meta: {
      code: 'servers_oversee_menu',
      url: '/old/index.html#/serversOversee',
      title: i18n.t('tap.serversOversee'),
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
      title: i18n.t('tap.userManagement'),
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
      title: i18n.t('tap.roleManagement'),
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
      title: i18n.t('tap.systemSettings'),
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
      title: i18n.t('tap.clusterManagement'),
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
      title: i18n.t('tap.jobFlow'),
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
      title: i18n.t('menu_title_sharedMining'),
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
      title: i18n.t('tap.jobFlow'),
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
      title: i18n.t('tap.dataLineage'),
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/views/Upload'),
    meta: {
      title: i18n.t('tap.upload'),
      code: 'SYNC_job_import',
      showTitle: true,
      isCollapse: false
    }
  },
  {
    path: '/apiInfo',
    name: 'apiInfo',
    component: () => import('@/views/job/apiInfo'),
    meta: { title: i18n.t('tap.apiInfo'), showTitle: true, isCollapse: false }
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
      title: i18n.t('app.menu.dataVerification'),
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
      title: i18n.t('verify_details_title'),
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
      title: i18n.t('app.menu.dataVerification'),
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
      title: i18n.t('app.menu.dataVerification'),
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
      title: i18n.t('verify_history_title'),
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
      title: i18n.t('verify_diff_history_title'),
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
      title: i18n.t('verify_diff_details_title'),
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
      title: i18n.t('verify_result_title'),
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
      title: i18n.t('notification.systemNotice'),
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
      title: i18n.t('tap.settingCenter'),
      showTitle: true,
      isCollapse: true
    },
    children: [
      {
        path: 'accountSetting',
        name: 'accountSetting',
        component: () => import('@/views/setting/AccountSetting'),
        meta: { title: i18n.t('tap.account'), showTitle: true, isCollapse: true }
      },
      {
        path: 'notificationSetting',
        name: 'notificationSetting',
        component: () => import('@/views/setting/NotificationSetting'),
        meta: { title: i18n.t('notification.setting'), showTitle: true, isCollapse: true }
      }
    ]
  },
  {
    path: '/metadata',
    name: 'metadata',
    component: () => import('@/views/metadata/List'),
    meta: {
      code: 'data_catalog_menu',
      title: i18n.t('tap.dataCatalog'),
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
      title: i18n.t('solution_name'),
      showTitle: true
    }
  }
]

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login/Login'),
      meta: {
        title: i18n.t('tap.login')
      }
    },
    {
      path: '/registry',
      name: 'registry',
      component: () => import('@/views/Login/Registration'),
      meta: {
        title: i18n.t('tap.registry')
      }
    },
    {
      path: '/verificationEmail',
      name: 'verificationEmail',
      component: () => import('@/views/Login/VerificationEmail'),
      meta: {
        title: i18n.t('tap.verificationEmail')
      }
    },
    {
      path: '/registyResult',
      name: 'registyResult',
      component: () => import('@/views/Login/RegistyResult'),
      meta: {
        title: i18n.t('tap.registry')
      }
    },
    {
      path: '/passwordReset',
      name: 'passwordReset',
      component: () => import('@/views/Login/PasswordReset'),
      meta: {
        title: i18n.t('tap.passwordReset')
      }
    },
    {
      path: '/job',
      name: 'job',
      component: () => import('@/views/job/Job'),
      meta: { code: 'Data_SYNC', title: i18n.t('tap.jobFlow') }
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
      path: '/',
      name: 'layout',
      redirect: 'dashboard',
      component: () => import('@/views/Layout'),
      children: childRoutes
    },
    {
      path: '/guide',
      name: 'guide',
      component: () => import('@/views/Guide')
    },
    {
      path: '/dataflow/editor',
      name: 'DataflowNew',
      props: {
        listRoute: {
          name: 'dataflow'
        }
      },
      component: DagEditor
    },
    {
      path: '/dataflow/editor/:id',
      name: 'DataflowEditor',
      props: {
        listRoute: {
          name: 'dataflow'
        }
      },
      component: DagEditor
    },
    {
      path: '/node/editor',
      name: 'NodeEditor',
      component: NodeEditor
    }
  ]
})

let usersModel = factor('users')
router.afterEach(() => {
  // Loading.close()
})
let isFirst = true
router.beforeEach(async (to, from, next) => {
  let flag = false
  if (window.parent && window.parent.emitRouteChange) {
    flag = window.parent.emitRouteChange(to)
  }
  if (flag) {
    return
  }
  if (!to.matched.length) {
    Message.error({
      message: 'Page not found!'
    })
    next(false)
    return
  }
  if (to.meta.title && window.getSettingByKey('SHOW_PAGE_TITLE')) {
    document.title = to.meta.title
  }
  let cookie = window.VueCookie
  let token = cookie.get('token')
  let xToken = cookie.get('xToken')
  // let showGuide = window.getSettingByKey('SHOW_SIMPLE_SCENE') && cookie.get('show_guide');
  let userId = cookie.get('user_id')

  if (token || xToken) {
    //若token存在，获取权限
    let permissions = sessionStorage.getItem('tapdata_permissions')
    if (!permissions || isFirst) {
      if (xToken) {
        try {
          let res = await usersModel.getUserInfo()
          let user = res.data
          cookie.set('email', user.email)
          cookie.set('username', user.username || '')
          cookie.set('login', 1)
          cookie.set('isAdmin', parseInt(user.role) || 0)
          cookie.set('user_id', user.id)
          cookie.delete('show_guide')
          if (!user.isCompleteGuide) {
            cookie.set('show_guide', 1)
          }
          userId = user.id
        } catch (e) {
          if (e.response && e.response.msg) {
            Message.error({
              message: e.response.msg
            })
          }
        }
      }
      //无权限，说明是首次进入页面，重新请求后台获取
      let loading = Loading.service({
        fullscreen: true,
        lock: true
      })
      try {
        let result = await usersModel.getPermissions(`/${userId}/permissions`)
        isFirst = false
        loading.close()
        if (result && result.data) {
          permissions = result.data.permissions || []
          //权限存在则存入缓存并继续向下走
          permissions = setPermission(permissions)
          // else {
          // 	//权限列表为空，说明没有权限进入，执行sign out操作并跳转到登录页面
          // 	Message.error({
          // 		message: i18n.t('app.signIn.permission_denied')
          // 	});
          // 	signOut();
          // 	return;
          // }
        } else {
          Message.error({
            message: i18n.t('app.signIn.permission_denied')
          })
          next(false)
          return
        }
      } catch (e) {
        loading.close()
        if (e.response && e.response.msg) {
          Message.error({
            message: e.response.msg
          })
        }
      }
    } else {
      permissions = JSON.parse(permissions)
    }

    //判断当前路由的页面是否有权限，无权限则不跳转，有权限则执行跳转
    let matched = true
    if (to.meta.code && !window.getSettingByKey('DFS_IGNORE_PERMISSION')) {
      matched = permissions.some(p => p.code === to.meta.code)
    }
    // 绕开权限判断
    if (matched) {
      // if (showGuide) {
      // 	if (to.name === 'guide') {
      // 		return next();
      // 	} else {
      // 		return next('/guide');
      // 	}
      // }
      if (to.name === 'login' || to.name === 'guide') {
        next('/')
      } else {
        next()
      }
    } else {
      Message.error({
        message: i18n.t('app.signIn.permission_denied')
      })
      next(false)
    }
  } else {
    if (['login', 'registry', 'passwordReset', 'verificationEmail', 'registyResult'].includes(to.name)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
export { childRoutes }
