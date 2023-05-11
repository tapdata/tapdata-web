import i18n from '@/i18n'
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

const ConnectionForm = async () => {
  const { ConnectionForm } = await import('@tap/business')
  return ConnectionForm
}

const TaskList = async () => {
  const { TaskList } = await import('@tap/business')
  return TaskList
}

const MigrateList = async () => {
  const { MigrateList } = await import('@tap/business')
  return MigrateList
}

const MigrationMonitor = async () => {
  const { MigrationMonitor } = await import('@tap/dag')
  return MigrationMonitor
}
const MigrationMonitorViewer = async () => {
  const { MigrationMonitorViewer } = await import('@tap/dag')
  return MigrationMonitorViewer
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
            path: 'create',
            name: 'createAgent',
            component: () => import(/* webpackChunkName: "instance-details" */ '../views/instance/CreateAgent'),
            meta: {
              title: i18n.t('dfs_agent_download_subscriptionmodeldialog_peizhishishishu')
            }
          },
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
      /* ---------- 数据复制  ----------*/
      {
        path: '/migrate',
        name: 'migrate',
        redirect: 'migrate/',
        component: Parent,
        meta: {
          title: 'task_manage_migrate',
          icon: 'task'
        },
        children: [
          {
            path: '',
            name: 'migrateList',
            component: MigrateList,
            meta: {
              title: 'task_manage_migrate',
              desc: 'task_manage_migrate_desc',
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
          title: 'task_manage_etl',
          icon: 'task'
        },
        children: [
          {
            path: '',
            name: 'dataflowList',
            component: TaskList,
            meta: {
              title: 'task_manage_etl',
              desc: 'task_manage_desc',
              code: 'v2_data_flow'
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
        path: '/user/order',
        name: 'order',
        component: () => import(/* webpackChunkName: "instance" */ '../views/order/List.vue'),
        meta: {
          title: i18n.t('dfs_router_index_dingyuezhongxin')
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
        path: '/data-console',
        name: 'dataConsole',
        component: SwimlaneDashboard,
        meta: {
          title: 'page_title_data_console',
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
  },
  //产品引导
  {
    path: '/product',
    name: 'productDemo',
    component: () => import('../views/productDemo')
  }
]

export default routes
