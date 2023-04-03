import Parent from './Parent'
import Layout from '../views/Layout.vue'
import FastDownload from '@/views/agent-download/FastDownload.vue'
import UpgradeVersion from '@/views/agent-download/UpgradeVersion.vue'
import PaidUpgrade from '@/views/agent-download/PaidUpgrade.vue'

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
const MigrationMonitorViewer = async () => {
  const { MigrationMonitorViewer } = await import('@tap/dag')
  return MigrationMonitorViewer
}
const EtlDetails = async () => {
  const { EtlDetails } = await import('@tap/business')
  return EtlDetails
}
const EtlStatistics = async () => {
  const { EtlStatistics } = await import('@tap/business')
  return EtlStatistics
}
const VerifyDetails = async () => {
  const { VerifyDetails } = await import('@tap/business')
  return VerifyDetails
}

const SwimlaneDashboard = async () => {
  const { SwimlaneDashboard } = await import('@tap/business')
  return SwimlaneDashboard
}

const CustomNodeList = async () => {
  const { CustomNodeList } = await import('@tap/business')
  return CustomNodeList
}

const NodeEditor = async () => {
  const { Editor } = await import(/* webpackChunkName: "node-design" */ '@tap/node-design')
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
          title: 'tap_home'
        },
        redirect: { name: 'Workbench' },
        hidden: true
      },
      {
        path: '/workbench',
        name: 'Workbench',
        component: () => import('../views/workbench/Workbench.vue'),
        meta: {
          title: 'tap_workbench',
          icon: 'workbench',
          hideTitle: true
        },
        children: [
          {
            path: 'notice',
            name: 'WorkbenchNotice',
            component: () => import('../views/workbench/Notice.vue'),
            meta: {
              title: 'tap_announcement_notice'
            }
          }
        ]
      },
      {
        path: '/systemNotice',
        name: 'SystemNotice',
        component: () => import('../views/workbench/SystemNotice.vue'),
        meta: {
          title: 'tap_system_notification'
        }
      },
      {
        path: '/instance',
        name: 'Instance',
        component: () => import(/* webpackChunkName: "instance" */ '../views/instance/Instance.vue'),
        meta: {
          title: 'tap_agent_management',
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
              title: 'tap_instance_details'
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
          title: 'tap_connection_management',
          icon: 'connection'
        },
        children: [
          {
            path: 'create',
            name: 'connectionCreate',
            component: ConnectionForm,
            //component: Iframe,
            meta: {
              title: 'tap_create_connection'
            }
          },
          {
            path: ':id',
            name: 'connectionsEdit',
            component: ConnectionForm,
            //component: Iframe,
            meta: {
              title: 'tap_edit_connection'
            }
          }
        ]
      },
      {
        path: '/migrate',
        name: 'migrateList',
        component: () => import(/* webpackChunkName: "task-migration" */ '../views/task/MigrationList.tsx'),
        meta: {
          title: 'task_manage_migrate',
          desc: 'task_manage_migrate_desc',
          icon: 'task'
        },
        children: [
          {
            path: 'details/:id',
            name: 'MigrateDetails',
            component: MigrateDetails,
            meta: {
              title: 'tap_task_details'
            }
          },
          {
            path: 'Statistics',
            name: 'MigrateStatistics',
            component: MigrateDetails,
            meta: {
              title: 'tap_monitor'
            }
          }
        ]
      },
      {
        path: '/etl',
        name: 'dataflowList',
        component: () => import(/* webpackChunkName: "task-migration" */ '../views/task/EtlList.tsx'),
        meta: {
          title: 'task_manage_etl',
          desc: 'task_manage_desc',
          icon: 'task'
        },
        children: [
          {
            path: 'details/:id',
            name: 'dataflowDetails',
            component: EtlDetails,
            meta: {
              title: 'tap_task_details'
            }
          },
          {
            path: 'statistics/:id',
            name: 'dataflowStatistics',
            component: EtlStatistics,
            meta: {
              title: 'tap_monitor'
            }
          }
        ]
      },

      {
        path: '/operationLog',
        name: 'OperationLog',
        component: () => import(/* webpackChunkName: "instance" */ '../views/operation-log/List.vue'),
        meta: {
          title: 'tap_operation_log',
          icon: 'operation-log'
        }
      },
      {
        path: '/user/center',
        name: 'userCenter',
        component: UserCenter,
        meta: {
          title: 'tap_user_center'
        }
      },
      {
        path: '/verify',
        name: 'verify',
        redirect: 'verify/',
        meta: {
          title: 'page_title_data_verify',
          doNotJump: true
        },
        component: Parent,
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
      {
        path: '/data-server',
        name: 'dataServerList',
        component: () => import(/* webpackChunkName: "task-migration" */ '../views/data-server/list'),
        meta: {
          title: 'dfs_data_server',
          hideTitle: true,
          icon: 'data-server'
        }
      },
      {
        path: '/swim-lane',
        name: 'swimLane',
        component: SwimlaneDashboard,
        meta: {
          title: 'dfs_data_server',
          hideTitle: true,
          icon: 'data-server'
        }
      },
      /* ---------- 自定义节点  ----------*/
      {
        path: '/custom-node',
        name: 'customNodeList',
        component: CustomNodeList,
        meta: {
          title: 'page_title_custom_node'
        }
      },
      {
        path: '/lang',
        name: 'lang',
        component: Lang
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
    path: '/dataflow/monitor/:id',
    name: 'TaskMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'Data_SYNC_menu'
    }
  },
  {
    path: '/fastDownload',
    name: 'FastDownload',
    component: FastDownload,
    meta: {
      title: 'tap_agent_download_now'
    }
  },
  {
    path: '/upgradeVersion',
    name: 'UpgradeVersion',
    component: UpgradeVersion,
    meta: {
      title: 'tap_upgrade'
    }
  },
  //付费升级
  {
    path: '/paidUpgrade',
    name: 'PaidUpgrade',
    component: PaidUpgrade,
    meta: {
      title: 'tap_upgrade'
    }
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
      title: 'task_manage_etl'
    }
  },
  {
    path: '/dataflow/viewer/:id',
    name: 'DataflowViewer',
    component: DagEditor,
    meta: {
      title: 'task_manage_etl'
    }
  },
  {
    path: '/migrate/editor',
    name: 'MigrateCreate',
    component: MigrationEditor,
    meta: {
      title: 'task_manage_migrate'
    }
  },
  {
    path: '/migrate/editor/:id',
    name: 'MigrateEditor',
    component: MigrationEditor,
    meta: {
      title: 'task_manage_migrate'
    }
  },
  {
    path: '/migrate/viewer/:id',
    name: 'MigrateViewer',
    component: MigrationEditor,
    meta: {
      title: 'task_manage_migrate'
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
    path: '/sharedMining/monitor/:id',
    name: 'SharedMiningMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor'
    }
  },
  {
    path: '/heartbeat/monitor/:id',
    name: 'HeartbeatMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor'
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
  //云市场对接
  {
    path: '/aliyun-market/license',
    name: 'aliyunMarketLicense',
    component: () => import('../views/aliyun-market/License.vue')
  }
]

export default routes
