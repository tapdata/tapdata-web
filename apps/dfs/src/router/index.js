import Layout from '../views/Layout.vue'
import Error from '../views/Error.vue'
import FastDownload from '@/views/agent-download/FastDownload.vue'
import UpgradeVersion from '@/views/agent-download/UpgradeVersion.vue'
import i18n from '@/i18n'
import Lang from '../views/Lang.vue'

// const TaskForm = () => import(/* webpackChunkName: "task-form" */ '../views/task/Form.vue')
const ConnectionForm = () =>
  import(/* webpackChunkName: "connection-form" */ '@tap/business/src/views/connections/DatabaseForm.vue')
// const DataflowDetails = () => import(/* webpackChunkName: "task-form" */ '../views/task/copy/Index.vue')
const UserCenter = () => import(/* webpackChunkName: "task-form" */ '../views/user/Center.vue')
const DagEditor = async () => {
  const { Editor } = await import('@tap/dag')
  return Editor
}

const routes = [
  {
    path: '/',
    component: Layout,
    meta: {},
    children: [
      {
        path: '/',
        name: 'Home',
        meta: {
          title: i18n.t('tap_home')
        },
        redirect: { name: 'Workbench' },
        hidden: true
      },
      {
        path: '/workbench',
        name: 'Workbench',
        component: () => import('../views/workbench/Workbench.vue'),
        meta: {
          title: i18n.t('tap_workbench'),
          icon: 'workbench',
          hideTitle: true
        },
        children: [
          {
            path: 'notice',
            name: 'WorkbenchNotice',
            component: () => import('../views/workbench/Notice.vue'),
            meta: {
              title: i18n.t('tap_announcement_notice')
            }
          }
        ]
      },
      {
        path: '/systemNotice',
        name: 'SystemNotice',
        component: () => import('../views/workbench/SystemNotice.vue'),
        meta: {
          title: i18n.t('tap_system_notification')
        }
      },
      {
        path: '/instance',
        name: 'Instance',
        component: () => import(/* webpackChunkName: "instance" */ '../views/instance/Instance.vue'),
        meta: {
          title: i18n.t('tap_agent_management'),
          icon: 'agent'
        },
        children: [
          {
            path: '/instanceDetails',
            name: 'InstanceDetails',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "instance-details" */ '../views/instance/Details.vue'),
            meta: {
              title: i18n.t('tap_instance_details')
            }
          }
        ]
      },
      {
        path: '/connection',
        name: 'Connection',
        // component: Iframe,
        component: () => import(/* webpackChunkName: "connection-list" */ '@/views/connection/List.tsx'),
        meta: {
          title: i18n.t('tap_connection_management'),
          icon: 'connection'
        },
        children: [
          {
            path: 'create',
            name: 'connectionCreate',
            component: ConnectionForm,
            //component: Iframe,
            meta: {
              title: i18n.t('tap_create_connection')
            }
          },
          {
            path: ':id',
            name: 'ConnectionEdit',
            component: ConnectionForm,
            //component: Iframe,
            meta: {
              title: i18n.t('tap_edit_connection')
            }
          }
        ]
      },
      // {
      //   path: '/task',
      //   name: 'Task',
      //   component: () => import(/* webpackChunkName: "task-migration" */ '../views/task/Migration.vue'),
      //   meta: {
      //     title: i18n.t('tap_task_management'),
      //     icon: 'task'
      //   },
      //   children: [
      //     {
      //       path: 'create',
      //       name: 'DataflowCreate',
      //       component: TaskForm,
      //       meta: {
      //         title: i18n.t('tap_create_task')
      //       }
      //     },
      //     {
      //       path: ':id',
      //       name: 'DataflowEdit',
      //       component: TaskForm,
      //       meta: {
      //         title: i18n.t('tap_edit_task')
      //       }
      //     },
      //     {
      //       path: ':id/monitor',
      //       name: 'Monitor',
      //       component: () => import(/* webpackChunkName: "task-monitor" */ '../views/monitor/Dashboard.vue'),
      //       meta: {
      //         title: i18n.t('tap_monitor')
      //       }
      //     },
      //     {
      //       path: ':id/statistics',
      //       name: 'DataflowDetails',
      //       component: DataflowDetails,
      //       meta: {
      //         title: i18n.t('tap_task_details')
      //       }
      //     }
      //   ]
      // },
      {
        path: '/etl',
        name: 'Etl',
        component: () => import(/* webpackChunkName: "task-etl" */ '../views/task/Migration.vue'),
        meta: {
          title: i18n.t('task_manage_etl'),
          icon: 'task'
        }
      },
      {
        path: '/migrate',
        name: 'Migrate',
        component: () => import(/* webpackChunkName: "task-migration" */ '../views/task/Migration.vue'),
        meta: {
          title: i18n.t('task_manage_migrate'),
          icon: 'task'
        }
      },
      {
        path: '/verify',
        name: 'Verify',
        component: () => import(/* webpackChunkName: "verify" */ '../views/verify/List.vue'),
        meta: {
          title: i18n.t('tap_data_validation'),
          icon: 'shujuxiaoyan'
        },
        children: [
          {
            path: 'create',
            name: 'VerifyCreate',
            component: () => import(/* webpackChunkName: "verify-form" */ '../views/verify/Form.vue'),
            meta: {
              title: i18n.t('tap_create_verification_task')
            }
          },
          {
            path: ':id/edit',
            name: 'VerifyEdit',
            component: () => import(/* webpackChunkName: "verify-form" */ '../views/verify/Form.vue'),
            meta: {
              title: i18n.t('tap_edit_verification_task')
            }
          },
          {
            path: ':id/details',
            name: 'VerifyDetails',
            component: () => import(/* webpackChunkName: "verify-details" */ '../views/verify/Details.vue'),
            meta: {
              title: i18n.t('tap_task_verification_details')
            }
          },
          {
            path: 'result/:id/details',
            name: 'VerifyDiffDetails',
            component: () => import(/* webpackChunkName: "verify-result" */ '../views/verify/Result.vue'),
            meta: {
              title: i18n.t('tap_difference_check_details')
            }
          },
          {
            path: 'result/:id',
            name: 'VerifyResult',
            component: () => import(/* webpackChunkName: "verify-result" */ '../views/verify/Result.vue'),
            meta: {
              title: i18n.t('tap_check_result')
            }
          },
          {
            path: ':id/history',
            name: 'VerifyHistory',
            component: () => import(/* webpackChunkName: "verify-history" */ '../views/verify/History.vue'),
            meta: {
              title: i18n.t('tap_task_verification_history')
            }
          },
          {
            path: 'result/:id/history',
            name: 'VerifyDiffHistory',
            component: () => import(/* webpackChunkName: "verify-history" */ '../views/verify/History.vue'),
            meta: {
              title: i18n.t('tap_difference_check_history')
            }
          }
        ]
      },
      {
        path: '/operationLog',
        name: 'OperationLog',
        component: () => import(/* webpackChunkName: "instance" */ '../views/operation-log/List.vue'),
        meta: {
          title: i18n.t('tap_operation_log'),
          icon: 'operation-log'
        }
      },
      {
        path: '/user/center',
        name: 'userCenter',
        component: UserCenter,
        meta: {
          title: i18n.t('tap_user_center')
        }
      }
    ]
  },
  {
    path: '/fastDownload',
    name: 'FastDownload',
    component: FastDownload,
    meta: {
      title: i18n.t('tap_agent_download_now')
    }
  },
  {
    path: '/upgradeVersion',
    name: 'UpgradeVersion',
    component: UpgradeVersion,
    meta: {
      title: i18n.t('tap_upgrade')
    }
  },
  {
    path: '/500',
    name: '500',
    component: Error
  },
  {
    path: '/invalid',
    name: 'Invalid',
    component: Error
  },
  {
    path: '/freeze',
    name: 'Freeze',
    component: Error
  },
  {
    path: '/off',
    name: 'Off',
    component: Error
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
  }
]
if (process.env.NODE_ENV === 'development') {
  routes[0].children?.push({
    path: '/lang',
    name: 'lang',
    component: Lang
  })
}

export default routes
