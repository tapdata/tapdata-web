import * as Vue from 'vue'
import i18n from '@/i18n'
import FastDownload from '@/views/agent-download/FastDownload.vue'
import PaidUpgrade from '@/views/agent-download/PaidUpgrade.vue'
import UpgradeVersion from '@/views/agent-download/UpgradeVersion.vue'
import Lang from '../views/Lang.vue'
import Layout from '../views/Layout.vue'

import Parent from './Parent'

const UserCenter = () => import('../views/user/Center.vue')
const UserContactUs = () => import('../views/user/ContactUs.vue')
const DagEditor = async () => {
  const { Editor } = await import('@tap/dag')
  return Editor
}
const MigrationEditor = async () => {
  const { MigrationEditor } = await import('@tap/dag')
  return MigrationEditor
}

const MigrationForm = async () => {
  const { MigrationForm } = await import('@tap/dag')
  return MigrationForm
}

const ConnectionForm = () => import('@/views/connection/Form.vue')

const TaskList = async () => {
  const { TaskList } = await import('@tap/business')
  return TaskList
}

const MigrateList = async () => {
  const { MigrateList } = await import('@tap/task')
  return MigrateList
}

const MigrationMonitor = async () => {
  const { MigrationMonitor } = await import('@tap/dag')
  return MigrationMonitor
}

const MigrationMonitorSimple = async () => {
  const { MigrationMonitorSimple } = await import('@tap/dag')
  return MigrationMonitorSimple
}

const MigrationMonitorViewer = async () => {
  const { MigrationMonitorViewer } = await import('@tap/dag')
  return MigrationMonitorViewer
}

const DataCapture = async () => {
  const { DataCapture } = await import('@tap/dag')
  return DataCapture
}

const VerifyDetails = async () => {
  const { VerifyDetails } = await import('@tap/business')
  return VerifyDetails
}

const DataConsoleDashboard = async () => {
  const { Dashboard } = await import('@tap/ldp')
  return Dashboard
}

const NoticeList = async () => {
  const { NoticeList } = await import('@tap/business')
  return NoticeList
}

const CustomNodeList = async () => {
  const { CustomNodeList } = await import('@tap/business')
  return CustomNodeList
}

const NodeEditor = async () => {
  const { Editor } = await import(
    /* webpackChunkName: "node-design" */ '@tap/node-design'
  )
  return Editor
}

// 数据校验
const VerificationList = async () => {
  const { VerificationList } = await import('@tap/business')
  return VerificationList
}

const VerificationDetails = async () => {
  const { VerificationDetails } = await import('@tap/business')
  return VerificationDetails
}

const VerificationForm = async () => {
  const { VerificationForm } = await import('@tap/business')
  return VerificationForm
}

const VerificationHistory = async () => {
  const { VerificationHistory } = await import('@tap/business')
  return VerificationHistory
}

const VerificationResult = async () => {
  const { VerificationResult } = await import('@tap/business')
  return VerificationResult
}

const SharedMiningList = async () => {
  const { SharedMiningList } = await import('@tap/business')
  return SharedMiningList
}

// 外存管理
const ExternalStorageList = async () => {
  const { ExternalStorageList } = await import('@tap/business')
  return ExternalStorageList
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
          title: 'tap_home',
        },
        redirect: { name: 'Dashboard' },
        hidden: true,
      },
      {
        path: '/workbench',
        name: 'Workbench',
        redirect: { name: 'Dashboard' },
        hidden: true,
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/workbench/Workbench.vue'),
        meta: {
          title: 'tap_workbench',
          icon: 'workbench',
          hideTitle: true,
        },
      },
      {
        path: '/systemNotice',
        name: 'SystemNotice',
        component: () => import('../views/workbench/SystemNotice.vue'),
        meta: {
          title: 'tap_system_notification',
        },
      },
      /* ---------- 数据开发  ----------*/
      {
        path: '/dataflow',
        name: 'dataflowList',
        component: TaskList,
        meta: {
          title: 'task_manage_etl',
          icon: 'task',
          desc: 'task_manage_desc',
          code: 'v2_data_flow',
        },
      },
      /* ---------- 共享挖掘  ----------*/
      {
        path: '/shared-mining',
        name: 'sharedMiningList',
        component: SharedMiningList,
        meta: {
          title: 'public_shared_mining',
          code: 'v2_log_collector',
        },
      },
      {
        path: '/operationLog',
        name: 'OperationLog',
        component: () => import('../views/operation-log/List.vue'),
        meta: {
          title: 'tap_operation_log',
          icon: 'operation-log',
        },
      },
      {
        path: '/external-storage',
        name: 'externalStorage',
        component: ExternalStorageList,
        meta: {
          hideTitle: true,
          title: 'public_external_storage',
          code: 'v2_external-storage_menu',
        },
      },
      {
        path: '/user/center',
        name: 'userCenter',
        component: UserCenter,
        meta: {
          title: 'tap_user_center',
        },
      },
      {
        path: '/user/contact-us',
        name: 'userContactUs',
        component: UserContactUs,
        meta: {
          title: 'tap_contact_us',
        },
      },
      {
        path: '/data-server',
        name: 'dataServerList',
        component: () => import('../views/data-server/list.vue'),
        meta: {
          title: 'dfs_data_server',
          hideTitle: true,
          icon: 'data-server',
        },
      },
      {
        path: '/data-hub',
        name: 'dataConsole',
        component: () => import('../views/data-hub/index.vue'),
        meta: {
          title: 'page_title_data_hub',
          hideTitle: true,
          icon: 'data-server',
        },
      },
      {
        path: '/create-storage',
        name: 'CreateStorage',
        component: () => import('../views/instance/CreateStorage.vue'),
        meta: {
          title: 'page_title_subscribe_storage',
          hideTitle: true,
          icon: 'data-server',
          activeMenu: '/data-hub',
        },
      },
      {
        path: '/data-console',
        name: 'DataConsole',
        component: DataConsoleDashboard,
        meta: {
          title: 'page_title_data_console',
          hideTitle: true,
          icon: 'data-server',
        },
      },
      {
        path: '/notice',
        name: 'noticeList',
        component: NoticeList,
        meta: {
          title: i18n.global.t('dfs_router_index_gonggaoliebiao'),
          hideTitle: false,
        },
        children: [
          {
            path: 'notice',
            name: 'WorkbenchNotice',
            component: () => import('../views/workbench/Notice.vue'),
            meta: {
              title: 'tap_announcement_notice',
            },
          },
        ],
      },
      /* ---------- 自定义节点  ----------*/
      {
        path: '/custom-node',
        name: 'customNodeList',
        component: CustomNodeList,
        meta: {
          title: 'page_title_custom_node',
        },
      },
      {
        path: '/lang',
        name: 'lang',
        component: Lang,
      },
      /* ---------- 工单系统  ----------*/
      {
        path: '/ticketSystem',
        name: 'TicketSystem',
        component: () => import('../views/ticketing-system/List.vue'),
        meta: {
          title: 'dfs_router_index_gongdanliebiao',
        },
      },
    ],
  },

  {
    path: '/instance',
    name: 'Instance',
    redirect: {
      name: 'InstanceList',
    },
    component: Layout,
    meta: {
      title: 'tap_agent_management',
      icon: 'agent',
      hideTitle: true,
    },
    children: [
      {
        path: '',
        name: 'InstanceList',
        component: () => import('../views/instance/Instance.vue'),
        meta: {
          title: 'tap_agent_management',
          icon: 'agent',
          hideTitle: true,
        },
      },
      {
        path: 'create',
        name: 'createAgent',
        component: () => import('../views/instance/CreateAgent.vue'),
        meta: {
          title: i18n.global.t(
            'dfs_agent_download_subscriptionmodeldialog_peizhishishishu',
          ),
          activeMenu: '/instance',
        },
      },
      {
        path: '/instanceDetails',
        name: 'InstanceDetails',
        component: () => import('../views/instance/Details.vue'),
        meta: {
          title: 'tap_instance_details',
        },
      },
      {
        path: 'install/:id',
        name: 'installAgent',
        component: () => import('../views/instance/Install.vue'),
        meta: {
          title: i18n.t('dfs_guide_index_bushujisuanyin'),
          hideTitle: true,
        },
      },
    ],
  },

  {
    path: '/connections',
    name: 'connections',
    component: Layout,
    redirect: {
      name: 'connectionsList',
    },
    meta: {
      hideTitle: true,
      title: 'tap_connection_management',
      icon: 'connection',
    },
    children: [
      {
        path: '',
        name: 'connectionsList',
        component: () => import('@/views/connection/List.tsx'),
        meta: {
          title: 'tap_connection_management',
        },
      },
      {
        path: 'create',
        name: 'connectionCreate',
        component: ConnectionForm,
        meta: {
          title: 'tap_create_connection',
          activeMenu: '/connections',
        },
      },
      {
        path: ':id',
        name: 'connectionsEdit',
        component: ConnectionForm,
        meta: {
          title: 'tap_edit_connection',
          activeMenu: '/connections',
        },
      },
    ],
  },

  /* ---------- 数据复制  ----------*/
  {
    path: '/migrate',
    name: 'migrate',
    redirect: {
      name: 'migrateList',
    },
    component: Layout,
    meta: {
      title: 'task_manage_migrate',
      icon: 'task',
    },
    children: [
      {
        path: '',
        name: 'migrateList',
        component: MigrateList,
        meta: {
          title: 'task_manage_migrate',
          desc: 'task_manage_migrate_desc',
          code: 'v2_data_replication',
        },
      },

      {
        path: 'form/:id?',
        name: 'MigrateForm',
        component: MigrationForm,
        meta: {
          title: 'task_manage_migrate',
          activeMenu: '/migrate',
        },
      },
    ],
  },

  /* ---------- 数据校验  ----------*/
  {
    path: '/dataVerification',
    name: 'dataVerification',
    redirect: {
      name: 'dataVerificationList',
    },
    component: Layout,
    meta: {
      title: 'page_title_data_verify',
    },
    children: [
      {
        path: '',
        name: 'dataVerificationList',
        component: VerificationList,
        meta: {
          title: 'page_title_data_verify',
          code: 'v2_data_check',
        },
      },
      {
        path: 'create',
        name: 'dataVerificationCreate',
        component: VerificationForm,
        meta: {
          title: 'page_title_verification_create',
          code: 'v2_data_check_create',
        },
      },
      {
        path: ':id/edit',
        name: 'dataVerificationEdit',
        component: VerificationForm,
        meta: {
          title: 'page_title_task_edit',
          code: 'v2_data_check_edit',
        },
      },
      {
        path: ':id/details',
        name: 'dataVerifyDetails',
        component: VerificationDetails,
        meta: {
          title: 'page_title_task_details',
          code: 'v2_data_check_details',
        },
      },
      {
        path: ':id/history',
        name: 'dataVerifyHistory',
        component: VerificationHistory,
        meta: {
          title: 'page_title_verification_history',
          code: 'v2_data_check_history',
        },
      },
      {
        path: '/dataVerifyResult/:id/history',
        name: 'VerifyDiffHistory',
        component: VerificationHistory,
        meta: {
          title: 'page_title_diff_verification_history',
          code: 'v2_data_check_result_history',
        },
      },
      {
        path: '/dataVerifyResult/:id/details',
        name: 'VerifyDiffDetails',
        component: VerificationResult,
        meta: {
          title: 'page_title_diff_verification_details',
          code: 'v2_data_check_result_details',
        },
      },
      {
        path: '/dataVerifyResult/:id',
        name: 'dataVerifyResult',
        component: VerificationResult,
        meta: {
          title: 'page_title_data_verification_result',
          code: 'v2_data_check_result',
        },
      },
    ],
  },
  /* ---------- 订阅中心  ----------*/
  {
    path: '/user/order',
    name: 'order',
    redirect: {
      name: 'orderList',
    },
    component: Layout,
    meta: {
      title: 'dfs_router_index_dingyuezhongxin',
    },
    children: [
      {
        path: '',
        name: 'orderList',
        component: () => import('../views/order/List.vue'),
        meta: {
          title: 'dfs_router_index_dingyuezhongxin',
        },
      },
      {
        path: 'pay/:id',
        name: 'pay',
        component: () => import('../views/order/Pay.vue'),
        meta: {
          title: 'dfs_router_index_zhifuqingdan',
        },
      },
      {
        path: 'bill/pay/:id',
        name: 'payForBill',
        component: () => import('../views/order/Pay.vue'),
        meta: {
          title: i18n.t('dfs_router_index_zhifuqingdan'),
        },
      },
      {
        path: 'bill/pay/:id/wait',
        name: 'waitPayForBill',
        component: () => import('../views/order/WaitPay.vue'),
        meta: {
          title: i18n.global.t('dfs_router_index_zhifuqingdan'),
        },
      },
      {
        path: 'change/pay/:id',
        name: 'payForChange',
        component: () => import('../views/order/Pay.vue'),
        meta: {
          title: i18n.global.t('dfs_router_index_zhifuqingdan'),
        },
      },
      {
        path: 'renew/pay/:id',
        name: 'payForRenew',
        component: () => import('../views/order/Pay.vue'),
        meta: {
          title: i18n.global.t('dfs_router_index_zhifuqingdan'),
        },
      },
      {
        path: '/user/order/changeList',
        name: 'changeList',
        component: () => import('../views/order/ChangeList.vue'),
        meta: {
          title: i18n.global.t('dfs_change_record'),
          code: '',
          activeMenu: '/user/order',
        },
      },
    ],
  },
  // 复制任务校验详情
  {
    path: '/verify',
    name: 'verify',
    meta: {
      title: 'page_title_data_verify',
      doNotJump: true,
    },
    component: Layout,
    children: [
      {
        path: ':id/details',
        name: 'VerifyDetails',
        component: VerifyDetails,
        meta: {
          title: 'page_title_data_difference_details',
          code: 'Data_verify',
          isNotAside: true,
        },
      },
    ],
  },
  {
    path: '/welcome',
    component: () => import('../views/welcome/WelcomeLayout.vue'),
    children: [
      {
        path: '',
        name: 'Welcome',
        component: () => import('../views/welcome/Welcome.vue'),
      },
      {
        path: 'task/:id?',
        name: 'WelcomeTask',
        component: MigrationForm,
        props: {
          editRouteName: 'WelcomeTask',
        },
      },
    ],
  },
  {
    path: '/migrate/monitor/simple/:id',
    name: 'MigrationMonitorSimple',
    component: MigrationMonitorSimple,
    meta: {
      title: 'page_title_run_monitor',
    },
  },
  {
    path: '/migrate/monitor/:id',
    name: 'MigrationMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
    },
  },
  {
    path: '/dataflow/monitor/:id',
    name: 'TaskMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'Data_SYNC_menu',
    },
  },
  {
    path: '/fastDownload',
    name: 'FastDownload',
    component: FastDownload,
    meta: {
      title: 'tap_agent_download_now',
    },
  },
  {
    path: '/upgradeVersion',
    name: 'UpgradeVersion',
    component: UpgradeVersion,
    meta: {
      title: 'tap_upgrade',
    },
  },
  {
    path: '/paidUpgrade',
    name: 'PaidUpgrade',
    component: PaidUpgrade,
    meta: {
      title: 'tap_upgrade',
    },
  },
  {
    path: '/dataflow/editor',
    name: 'DataflowNew',
    component: DagEditor,
  },
  {
    path: '/dataflow/editor/:id',
    name: 'DataflowEditor',
    component: DagEditor,
    meta: {
      title: 'task_manage_etl',
    },
  },
  {
    path: '/dataflow/viewer/:id',
    name: 'DataflowViewer',
    component: DagEditor,
    meta: {
      title: 'task_manage_etl',
    },
  },
  {
    path: '/migrate/editor',
    name: 'MigrateCreate',
    component: MigrationEditor,
    meta: {
      title: 'task_manage_migrate',
    },
  },
  {
    path: '/migrate/editor/:id',
    name: 'MigrateEditor',
    component: MigrationEditor,
    meta: {
      title: 'task_manage_migrate',
    },
  },
  {
    path: '/migrate/viewer/:id',
    name: 'MigrateViewer',
    component: MigrationEditor,
    meta: {
      title: 'task_manage_migrate',
    },
  },
  {
    path: '/migrate/monitor-record/:id',
    name: 'MigrationMonitorViewer',
    component: MigrationMonitorViewer,
    meta: {
      title: 'page_title_run_monitor',
      code: 'Data_SYNC_menu',
    },
  },
  {
    path: '/data-capture/:id',
    name: 'DataCapture',
    component: DataCapture,
  },
  {
    path: '/sharedMining/monitor/:id',
    name: 'SharedMiningMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor',
    },
  },
  {
    path: '/heartbeat/monitor/:id',
    name: 'HeartbeatMonitor',
    component: MigrationMonitor,
    meta: {
      title: 'page_title_run_monitor',
      code: 'v2_data_replication_monitor',
    },
  },
  {
    path: '/node/editor',
    name: 'NodeNew',
    component: NodeEditor,
  },
  {
    path: '/node/editor/:id',
    name: 'NodeEditor',
    component: NodeEditor,
  },
  //云市场对接
  {
    path: '/aliyun-market/license',
    name: 'aliyunMarketLicense',
    component: () => import('../views/aliyun-market/License.vue'),
  },
  //产品引导
  {
    path: '/product',
    name: 'productDemo',
    component: () => import('../views/productDemo.vue'),
  },
]

export default routes
