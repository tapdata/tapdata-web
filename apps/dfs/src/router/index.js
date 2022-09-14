import Layout from '../views/Layout.vue'
import Error from '../views/Error.vue'
import FastDownload from '@/views/agent-download/FastDownload.vue'
import UpgradeVersion from '@/views/agent-download/UpgradeVersion.vue'
import i18n from '@/i18n'
import Lang from '../views/Lang.vue'

const UserCenter = () => import(/* webpackChunkName: "task-form" */ '../views/user/Center.vue')
const DagEditor = async () => {
  const { Editor } = await import('@tap/dag')
  return Editor
}
const MigrationEditor = async () => {
  const { MigrationEditor } = await import('@tap/dag')
  return MigrationEditor
}
const MigrateDetails = async () => {
  const { MigrateDetails } = await import('@tap/business')
  return MigrateDetails
}
const ConnectionForm = async () => {
  const { ConnectionForm } = await import('@tap/business')
  return ConnectionForm
}
const MigrationMonitor = async () => {
  const { MigrationMonitor } = await import('@tap/dag')
  return MigrationMonitor
}
const EtlDetails = async () => {
  const { EtlDetails } = await import('@tap/business')
  return EtlDetails
}
const EtlStatistics = async () => {
  const { EtlStatistics } = await import('@tap/business')
  return EtlStatistics
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
        path: '/connections',
        name: 'connections',
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
            name: 'connectionsEdit',
            component: ConnectionForm,
            //component: Iframe,
            meta: {
              title: i18n.t('tap_edit_connection')
            }
          }
        ]
      },
      {
        path: '/migrate',
        name: 'migrateList',
        component: () => import(/* webpackChunkName: "task-migration" */ '../views/task/MigrationList.tsx'),
        meta: {
          title: i18n.t('task_manage_migrate'),
          icon: 'task'
        },
        children: [
          {
            path: 'details/:id',
            name: 'MigrateDetails',
            component: MigrateDetails,
            meta: {
              title: i18n.t('tap_task_details')
            }
          },
          {
            path: 'Statistics',
            name: 'MigrateStatistics',
            component: MigrateDetails,
            meta: {
              title: i18n.t('tap_monitor')
            }
          }
        ]
      },
      {
        path: '/etl',
        name: 'dataflowList',
        component: () => import(/* webpackChunkName: "task-migration" */ '../views/task/EtlList.tsx'),
        meta: {
          title: i18n.t('task_manage_etl'),
          icon: 'task'
        },
        children: [
          {
            path: 'details/:id',
            name: 'dataflowDetails',
            component: EtlDetails,
            meta: {
              title: i18n.t('tap_task_details')
            }
          },
          {
            path: 'statistics/:id',
            name: 'dataflowStatistics',
            component: EtlStatistics,
            meta: {
              title: i18n.t('tap_monitor')
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
    path: '/migrate/monitor/:id',
    name: 'MigrationMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor'
    }
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
    component: DagEditor,
    meta: {
      title: i18n.t('task_manage_etl')
    }
  },
  {
    path: '/dataflow/viewer/:id',
    name: 'DataflowViewer',
    component: DagEditor,
    meta: {
      title: i18n.t('task_manage_etl')
    }
  },
  {
    path: '/migrate/editor',
    name: 'MigrateCreate',
    component: MigrationEditor,
    meta: {
      title: 'tap_edit_task'
    }
  },
  {
    path: '/migrate/editor/:id',
    name: 'MigrateEditor',
    component: MigrationEditor,
    meta: {
      title: 'tap_edit_task'
    }
  },
  {
    path: '/migrate/viewer/:id',
    name: 'MigrateViewer',
    component: MigrationEditor,
    meta: {
      title: 'tap_edit_task'
    }
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
