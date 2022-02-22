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
      title: i18n.t('tap.connection'),
      isCollapse: false
    }
  },
  {
    path: '/connections/create',
    name: 'connectionsCreate',
    component: () => import('@/views/connections/DatabaseForm'),
    meta: {
      title: i18n.t('tap.connection'),
      isCollapse: true,
      code: 'datasource_creation'
    }
  },
  {
    path: '/connections/:id/edit',
    name: 'connectionsEdit',
    component: () => import('@/views/connections/formbuild'),
    meta: {
      title: i18n.t('tap.connection'),
      isCollapse: true,
      code: 'datasource_edition'
    }
  },
  {
    path: '/metadataSearch',
    name: 'metadataSearch',
    component: () => import('@/views/metadata/Search'),
    meta: {
      title: i18n.t('tap.metadataSearch'),
      isCollapse: true
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
      isCollapse: true
    }
  },
  {
    path: '/dataQuality/:id',
    name: 'dataQualityDetail',
    component: () => import('@/views/dataQuality/DataQualityDetail'),
    meta: {
      code: 'data_quality_edition',
      title: i18n.t('tap.dataQuality'),
      isCollapse: true
    }
  },
  {
    path: '/ttl',
    name: 'timeToLive',
    component: () => import('@/views/TimeToLive/List'),
    meta: {
      code: 'time_to_live_menu',
      title: i18n.t('tap.TimeToLive'),
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
      isCollapse: false
    }
  },
  {
    path: '/module',
    name: 'module',
    component: () => import('@/views/apiPage/ModuleForm'),
    meta: {
      code: 'API_creation'
    }
  },
  {
    path: '/module/:id',
    name: 'editModule',
    component: () => import('@/views/apiPage/ModuleForm'),
    meta: {
      code: 'API_edition'
    }
  },
  {
    path: '/dataExplorer',
    name: 'dataExplorer',
    component: () => import('@/views/apiPage/DataExplorer'),
    meta: {
      code: 'API_data_explorer_menu',
      title: i18n.t('tap.dataExplor'),
      isCollapse: false
    }
  },
  {
    path: '/apiDocAndTest',
    name: 'apiDocAndTest',
    component: () => import('@/views/apiPage/ApiDocAndTest'),
    meta: {
      code: 'API_doc_&_test_menu',
      title: i18n.t('tap.docTest'),
      isCollapse: false
    }
  },
  {
    path: '/apiAnalysis',
    name: 'apiAnalysis',
    component: () => import('@/views/apiPage/ApiAnalysis'),
    meta: {
      code: 'API_stats_menu',
      title: i18n.t('tap.apiStats'),
      isCollapse: false
    }
  },
  {
    path: '/applications',
    name: 'applications',
    component: () => import('@/views/apiPage/Applications'),
    meta: {
      code: 'API_clients_menu',
      title: i18n.t('tap.apiClients'),
      isCollapse: false
    }
  },
  {
    path: '/apiServers',
    name: 'apiServers',
    component: () => import('@/views/apiPage/ApiServers'),
    meta: {
      code: 'API_server_menu',
      title: i18n.t('tap.apiSever'),
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
      isCollapse: false
    }
  },
  {
    path: '/role',
    name: 'role',
    component: () => import('@/views/Role/Role'),
    meta: {
      code: 'role_creation'
    }
  },
  {
    path: '/role/:id',
    name: 'editRole',
    component: () => import('@/views/Role/Role'),
    meta: {
      code: 'role_edition'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/setting/Setting'),
    meta: {
      code: 'system_settings_menu',
      title: i18n.t('tap.systemSettings'),
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
    path: '/dataflow',
    name: 'dataflow',
    component: () => import('@/views/task/etl/List'),
    meta: {
      code: 'Data_SYNC_menu',
      title: i18n.t('tap.jobFlow'),
      isCollapse: false
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
    meta: {}
  },
  {
    path: '/dataMap',
    name: 'dataMap',
    component: () => import('@/views/dataMap/DataMap'),
    meta: {
      code: 'data_lineage_menu',
      title: i18n.t('tap.dataLineage'),
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
      isCollapse: false
    }
  },
  {
    path: '/apiInfo',
    name: 'apiInfo',
    component: () => import('@/views/job/apiInfo'),
    meta: { title: i18n.t('tap.apiInfo'), isCollapse: false }
  },
  {
    path: '/function',
    name: 'Function',
    component: () => import('@/views/function/List'),
    meta: {
      isCollapse: false,
      code: 'SYNC_Function_management'
    }
  },
  {
    path: '/function/create',
    name: 'FunctionCreate',
    component: () => import('@/views/function/Form'),
    meta: {
      isCollapse: false,
      code: 'SYNC_Function_management'
    }
  },
  {
    path: '/function/import',
    name: 'FunctionImport',
    component: () => import('@/views/function/ImportForm'),
    meta: {
      isCollapse: false,
      code: 'SYNC_Function_management'
    }
  },
  {
    path: '/function/edit/:id',
    name: 'FunctionEdit',
    component: () => import('@/views/function/Form'),
    meta: {
      isCollapse: false,
      code: 'SYNC_Function_management'
    }
  },
  {
    path: '/function/details/:id',
    name: 'FunctionDetails',
    component: () => import('@/views/function/Details'),
    meta: {
      isCollapse: false,
      code: 'SYNC_Function_management'
    }
  },
  {
    path: '/tableFlows',
    name: 'tableFlows',
    component: () => import('@/views/task/TableFlows'),
    meta: { isCollapse: true }
  },

  {
    path: '/dataVerification/:id/edit',
    name: 'dataVerificationEdit',
    component: () => import('@/views/dataVerification/Form'),
    meta: {
      title: i18n.t('app.menu.dataVerification'),
      isCollapse: true,
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
      isCollapse: true
    },
    children: [
      {
        path: 'accountSetting',
        name: 'accountSetting',
        component: () => import('@/views/setting/AccountSetting'),
        meta: { title: i18n.t('tap.account'), isCollapse: true }
      },
      {
        path: 'notificationSetting',
        name: 'notificationSetting',
        component: () => import('@/views/setting/NotificationSetting'),
        meta: { title: i18n.t('notification.setting'), isCollapse: true }
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
