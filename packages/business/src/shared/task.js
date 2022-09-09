import i18n from '@tap/i18n'
import { Cookie } from '@tap/shared'
// 获取子任务状态统计
import { ETL_STATUS_MAP, ETL_SUB_STATUS_MAP } from './const'

export function getSubTaskStatus(rows = []) {
  const statusMap = {
    running: ['wait_run', 'scheduling', 'running', 'stopping'],
    not_running: ['edit', 'stop', 'complete'],
    error: ['error', 'schedule_failed']
  }
  const len = rows.length
  let result = [],
    item = {}
  if (len === 0) {
    result = [
      Object.assign({ count: 1 }, ETL_SUB_STATUS_MAP['edit'], {
        status: 'edit'
      })
    ]
  } else {
    let tempMap = {}
    rows.forEach(r => {
      tempMap[r.status] = true
    })
    if (Object.keys(tempMap).length === 1) {
      let status = rows[0]?.status
      status = status === 'edit' ? 'ready' : status
      status = status === 'schedule_failed' ? 'error' : status
      result = [
        Object.assign({ count: 1 }, ETL_SUB_STATUS_MAP[status], {
          status: status
        })
      ]
    } else {
      for (let key in ETL_STATUS_MAP) {
        item = Object.assign({}, ETL_STATUS_MAP[key])
        item.status = key
        item.count = 0
        rows.forEach(el => {
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
  let result = {
    start: false,
    stop: false,
    edit: false,
    reset: false,
    delete: false
  }
  // 启动可用：待启动、已完成、错误、调度失败、已停止
  // 停止可用：运行中、停止中
  // 编辑可用：编辑中、待启动、已完成、错误、调度失败、已停止 或者 未运行状态
  // 重置可用：已完成、错误、调度失败、已停止
  // 删除可用：编辑中、待启动、已完成、错误、调度失败、已停止
  result.start = ['wait_run', 'complete', 'error', 'stop'].includes(row.status)
  result.stop = !['running', 'stopping'].includes(row.status)
  result.edit = !['edit', 'ready', 'complete', 'error', 'schedule_failed', 'stop'].includes(row.status)
  result.reset = !['complete', 'error', 'schedule_failed', 'stop'].includes(row.status)
  result.delete = !['edit', 'ready', 'complete', 'error', 'stop', 'schedule_failed'].includes(row.status)
  if (or) {
    for (let key in result) {
      result[key] = or || result[key]
    }
  }
  return result
}

const BASE_URL = process.env.BASE_URL || '/'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    const accessToken = Cookie.get('token')
    return `${BASE_URL}api/pdk/icon?access_token=${accessToken}&pdkHash=${pdkHash}`
  }
  let icon = node.type === 'table' || node.type === 'database' || node.databaseType ? node.databaseType : node.type
  return icon ? require(`web-core/assets/icons/node/${icon}.svg`) : null
}

export const STATUS_MAP = {
  edit: {
    i18n: 'packages_business_status_edit'
  },
  wait_start: {
    i18n: 'packages_business_status_wait_start'
  },
  starting: {
    i18n: 'packages_business_status_starting',
    in: ['preparing', 'scheduling', 'wait_run']
  },
  running: {
    i18n: 'packages_business_status_running'
  },
  complete: {
    i18n: 'packages_business_status_complete'
  },
  stopping: {
    i18n: 'packages_business_status_stopping'
  },
  stop: {
    i18n: 'packages_business_status_stop'
  },
  error: {
    i18n: 'packages_business_status_error',
    in: ['schedule_failed', 'error']
  }
}

const STATUS_MERGE = Object.entries(STATUS_MAP).reduce((merge, [key, value]) => {
  if (value.in) {
    value.in.reduce((res, val) => ((res[val] = key), res), merge)
  }
  return merge
}, {})

const BUTTON_WITH_STATUS = {
  start: ['wait_start', 'complete', 'error', 'stop'],
  edit: ['edit', 'wait_start', 'complete', 'error', 'stop'],
  delete: ['edit', 'wait_start', 'complete', 'error', 'stop'],
  stop: ['running'],
  forceStop: ['stopping'],
  reset: ['wait_start', 'complete', 'error', 'stop'],
  monitor: ['running', 'complete', 'error', 'stop', 'stopping']
}

export function makeStatusAndDisabled(item) {
  let { status } = item
  const mergeStatus = STATUS_MERGE[status]

  if (mergeStatus) {
    item.status = status = mergeStatus
  }

  if (!(status in STATUS_MAP)) {
    console.error(
      i18n.t('packages_business_shared_task_weishibiederen', {
        val1: status
      }),
      i18n.t('packages_business_shared_task_yijingzhiweie')
    ) // eslint-disable-line
    item.status = status = 'error'
  }

  item.btnDisabled = Object.entries(BUTTON_WITH_STATUS).reduce((map, [key, value]) => {
    map[key] = !value.includes(status)
    return map
  }, {})

  return item
}
