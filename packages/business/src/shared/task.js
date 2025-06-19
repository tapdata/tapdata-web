import { getIcon } from '@tap/assets/icons'
import i18n from '@tap/i18n'
import { getConnectionIcon } from '../views/connections/util'
// 获取子任务状态统计
import { ETL_STATUS_MAP, ETL_SUB_STATUS_MAP } from './const'

export const TASK_SETTINGS = {
  name: '', // 任务名称
  desc: '', // 任务描述
  type: 'initial_sync+cdc', // 任务类型：全量+增量
  isAutoCreateIndex: true, // 自动创建索引
  isOpenAutoDDL: false, // 自动DDL
  increOperationMode: false, // 增量数据处理模式：批量,
  increaseReadSize: 1, // 增量批次读取行数
  processorThreadNum: 1, // 处理器线程数
  shareCdcEnable: false, //开启共享挖掘
  isSchedule: false,
  cronExpression: ' ',
  accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
  isAutoInspect: false,
}

export function getSubTaskStatus(rows = []) {
  const statusMap = {
    running: ['wait_run', 'scheduling', 'running', 'stopping'],
    not_running: ['edit', 'stop', 'complete'],
    error: ['error', 'schedule_failed'],
  }
  const len = rows.length
  let result = [],
    item = {}
  if (len === 0) {
    result = [
      Object.assign({ count: 1 }, ETL_SUB_STATUS_MAP.edit, {
        status: 'edit',
      }),
    ]
  } else {
    const tempMap = {}
    rows.forEach((r) => {
      tempMap[r.status] = true
    })
    if (Object.keys(tempMap).length === 1) {
      let status = rows[0]?.status
      status = status === 'edit' ? 'ready' : status
      status = status === 'schedule_failed' ? 'error' : status
      result = [
        Object.assign({ count: 1 }, ETL_SUB_STATUS_MAP[status], {
          status,
        }),
      ]
    } else {
      for (const key in ETL_STATUS_MAP) {
        item = Object.assign({}, ETL_STATUS_MAP[key])
        item.status = key
        item.count = 0
        rows.forEach((el) => {
          if (statusMap[key].includes(el.status)) {
            item.count++
          }
        })
        result.push(item)
      }
    }
  }
  return result
}

// 同步主任务，按钮的禁用逻辑
export function getTaskBtnDisabled(row, or) {
  const result = {
    start: false,
    stop: false,
    edit: false,
    reset: false,
    delete: false,
  }
  // 启动可用：待启动、已完成、错误、调度失败、已停止
  // 停止可用：运行中、停止中
  // 编辑可用：编辑中、待启动、已完成、错误、调度失败、已停止 或者 未运行状态
  // 重置可用：已完成、错误、调度失败、已停止
  // 删除可用：编辑中、待启动、已完成、错误、调度失败、已停止
  result.start = ['wait_run', 'complete', 'error', 'stop'].includes(row.status)
  result.stop = !['running', 'stopping'].includes(row.status)
  result.edit = ![
    'edit',
    'ready',
    'complete',
    'error',
    'schedule_failed',
    'stop',
  ].includes(row.status)
  result.reset = !['complete', 'error', 'schedule_failed', 'stop'].includes(
    row.status,
  )
  result.delete = ![
    'edit',
    'ready',
    'complete',
    'error',
    'stop',
    'schedule_failed',
  ].includes(row.status)
  if (or) {
    for (const key in result) {
      result[key] = or || result[key]
    }
  }
  return result
}

const BASE_URL = import.meta.env.BASE_URL || '/'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    return getConnectionIcon(pdkHash)
  }
  let icon =
    node.type === 'table' || node.type === 'database' || node.databaseType
      ? node.databaseType
      : node.type
  if (node.type === 'hazelcastIMDG') {
    const map = {
      memory: 'memory',
      mongodb: 'mongodb',
      rocksdb: 'rocksdb',
    }
    icon = map[node.externaltype]
  }
  return icon ? getIcon(icon) : null
}

export const STATUS_MAP = {
  edit: {
    i18n: 'public_status_edit',
  },
  wait_start: {
    i18n: 'public_status_wait_run',
  },
  starting: {
    i18n: 'public_status_starting',
    in: ['preparing', 'scheduling', 'wait_run'],
  },
  running: {
    i18n: 'public_status_running',
  },
  complete: {
    i18n: 'public_status_finished',
  },
  stopping: {
    i18n: 'public_status_stopping',
  },
  stop: {
    i18n: 'public_status_stop',
  },
  error: {
    i18n: 'public_status_error',
    in: ['schedule_failed', 'error'],
  },
  renewing: {
    i18n: 'public_status_renewing',
  },
  renew_failed: {
    i18n: 'public_status_renew_failed',
  },
  deleting: {
    i18n: 'public_status_deleting',
  },
  delete_failed: {
    i18n: 'public_status_delete_failed',
  },
  deleted: {
    i18n: 'public_status_deleted',
  },
}

export const STATUS_MERGE = Object.entries(STATUS_MAP).reduce(
  (merge, [key, value]) => {
    if (value.in) {
      value.in.reduce((res, val) => ((res[val] = key), res), merge)
    }
    return merge
  },
  {},
)

//'renewing' 不可以删除
const BUTTON_WITH_STATUS = {
  start: ['wait_start', 'complete', 'error', 'stop'],
  edit: ['edit', 'wait_start', 'complete', 'error', 'stop', 'renew_failed'],
  delete: ['edit', 'wait_start', 'complete', 'error', 'stop', 'renew_failed'],
  stop: ['running'],
  forceStop: ['stopping'],
  reset: ['wait_start', 'complete', 'error', 'stop', 'renew_failed'],
  monitor: [
    'running',
    'complete',
    'error',
    'stop',
    'stopping',
    'renewing',
    'renew_failed',
  ],
}

export function makeStatusAndDisabled(item) {
  let { status } = item
  const mergeStatus = STATUS_MERGE[status]

  if (item._deleted) {
    item.status = status = 'deleted'
  } else if (mergeStatus) {
    item.status = status = mergeStatus
  } else if (!(status in STATUS_MAP)) {
    console.error(
      i18n.t('packages_business_shared_task_weishibiederen', {
        val1: status,
      }),
      i18n.t('packages_business_shared_task_yijingzhiweie'),
    )
    item.status = status = 'error'
  }

  item.btnDisabled = Object.entries(BUTTON_WITH_STATUS).reduce(
    (map, [key, value]) => {
      map[key] = !value.includes(status)
      return map
    },
    {},
  )

  // 当返回false时，任务不可点击强制停止
  if (item.canForceStopping === false) {
    item.btnDisabled.forceStop = true
  }

  return item
}

export const MILESTONE_TYPE = {
  TASK: {
    text: i18n.global.t('packages_business_milestone_list_renwudiaodu'),
  },
  DEDUCTION: {
    text: i18n.global.t(
      'packages_business_milestone_list_load_table_structure',
    ),
  },
  DATA_NODE_INIT: {
    text: i18n.global.t('packages_business_milestone_list_shujujiedianchu'),
  },
  TABLE_INIT: {
    text: i18n.global.t('packages_business_milestone_list_biaojiegouqianyi'),
  },
  SNAPSHOT: {
    text: i18n.global.t('packages_business_milestone_list_quanliangshujuqian'),
  },
  CDC: {
    text: i18n.global.t('packages_business_milestone_list_jinruzengliangshu'),
  },
}
