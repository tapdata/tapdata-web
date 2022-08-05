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
  let statusResult = []
  if (row.statusResult) {
    statusResult = row.statusResult
  } else {
    statusResult = getSubTaskStatus(row.statuses)
  }
  let filterArr = statusResult.filter(t => t.count > 0)
  // 统计出3种状态：运行中running、未运行not_running、错误error
  if (statusResult.length > 1) {
    // 启动禁用：运行中
    // 停止禁用：未运行、错误
    // 编辑禁用：运行中
    // 重置禁用：运行中
    // 删除禁用：运行中
    result.start = filterArr.every(t => ['running'].includes(t.status))
    result.stop = filterArr.every(t => ['not_running', 'error'].includes(t.status))
    result.edit = filterArr.every(t => ['running'].includes(t.status))
    result.reset = filterArr.every(t => ['running'].includes(t.status))
    result.delete = filterArr.every(t => ['running'].includes(t.status))
  } else {
    // 启动可用：待启动、已完成、错误、调度失败、已停止
    // 停止可用：运行中、停止中
    // 编辑可用：编辑中、待启动、已完成、错误、调度失败、已停止 或者 未运行状态
    // 重置可用：已完成、错误、调度失败、已停止
    // 删除可用：编辑中、待启动、已完成、错误、调度失败、已停止
    result.start = !filterArr.every(t => ['ready', 'complete', 'error', 'schedule_failed', 'stop'].includes(t.status))
    result.stop = !filterArr.every(t => ['running', 'stopping'].includes(t.status))
    result.edit = !filterArr.every(t =>
      ['edit', 'ready', 'complete', 'error', 'schedule_failed', 'stop'].includes(t.status)
    )
    result.reset = !filterArr.every(t => ['complete', 'error', 'schedule_failed', 'stop'].includes(t.status))
    result.delete = !filterArr.every(t =>
      ['edit', 'ready', 'complete', 'error', 'stop', 'schedule_failed'].includes(t.status)
    )
  }
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
