import i18n from '@/i18n'
import { formatTime } from '@/utils/util'
// 全量任务，标识为已完成
export function isFinished(data = {}) {
  // 全量状态下，任务完成状态时，前端识别为已停止
  let flag = false
  if (data.status === 'paused' && data.setting?.sync_type === 'initial_sync') {
    let { stages, stats } = data
    // 有节点
    if (stats?.stagesMetrics?.length > 0) {
      let source = stages.find(t => t.outputLanes?.length > 0) // 源端
      let stagesMetrics = stats.stagesMetrics || []
      let list = stagesMetrics.filter(t => t.stageId === source.id)
      flag = list.every(t => t.status === 'initialized')
    } else {
      // 无节点的任务
      flag = false
    }
  }
  return flag
}

// 全量概览，进度、预计完成时间
export function getOverviewData(data) {
  let progress = 0
  let overview = {}
  let waitingForSyecTableNums = 0
  let completeTime = ''
  let currentStatus = ''
  if (data?.stats?.overview) {
    overview = JSON.parse(JSON.stringify(data.stats.overview))

    currentStatus = !overview?.status ? i18n.t('task_monitor_not_start') : ''

    if (overview.waitingForSyecTableNums !== undefined) {
      waitingForSyecTableNums = overview.sourceTableNum - overview.waitingForSyecTableNums
    } else {
      waitingForSyecTableNums = 0
    }
    overview.waitingForSyecTableNums = waitingForSyecTableNums

    let num
    const { targatRowNum, sourceRowNum } = overview
    if (sourceRowNum === -1) {
      overview.sourceRowNum = 0
      num = 0
    } else if (sourceRowNum === 0) {
      if (targatRowNum === 0) {
        num = 100
      } else {
        num = 0
      }
    } else {
      num = (targatRowNum / sourceRowNum) * 100
    }
    num = Math.abs(num)
    if (num > 100) {
      num = 100
    }
    progress = num ? num.toFixed(2) * 1 : 0

    let now = new Date().getTime()
    let startTime = new Date(data.runningTime).getTime(),
      runningTime = now - startTime,
      speed = overview.targatRowNum / runningTime

    let time = (overview.sourceRowNum - overview.targatRowNum) / speed / 1000

    let r = ''
    if (time) {
      let s = time,
        m = 0,
        h = 0,
        d = 0
      if (s > 60) {
        m = parseInt(s / 60)
        s = parseInt(s % 60)
        if (m > 60) {
          h = parseInt(m / 60)
          m = parseInt(m % 60)
          if (h > 24) {
            d = parseInt(h / 24)
            h = parseInt(h % 24)
          }
        }
      }
      if (m === 0 && h === 0 && d === 0 && s < 60 && s > 0) {
        r = 1 + i18n.t('taskProgress.m')
      }
      // r = parseInt(s) + i18n.t('timeToLive.s')
      if (m > 0) {
        r = parseInt(m) + i18n.t('taskProgress.m')
      }
      if (h > 0) {
        r = parseInt(h) + i18n.t('taskProgress.h') + r
      }
      if (d > 0) {
        r = parseInt(d) + i18n.t('taskProgress.d') + r
      }
      // 全量未完成 停止任务
      if (['paused', 'error'].includes(data.status)) {
        completeTime = i18n.t('taskProgress.taskStopped') // 任务已停止
      } else {
        completeTime = r
      }
    }

    if (progress === 100) {
      overview.currentStatus = i18n.t('taskProgress.progress') // 进行中
      completeTime = i18n.t('taskProgress.fullyCompleted') // 全量已完成
      if (data.milestones) {
        completeTime = formatTime(data.milestones.find(t => t.code === 'WRITE_SNAPSHOT')?.end)
      }
    }
    // 任务暂停、错误  增量状态都为停止
    if (completeTime === i18n.t('taskProgress.fullyCompleted')) {
      if (['paused', 'error'].includes(data.status)) {
        overview.currentStatus = i18n.t('taskProgress.stopped') // 已停止
      }
    }
  }
  return {
    progress,
    overview,
    completeTime,
    currentStatus
  }
}

// 转化单位
export function handleChangeUnit(val) {
  console.log('handleChangeUnit', val)
  if ([undefined, null, ''].includes(val)) {
    return '-'
  }
  if (val / (1000 * 1000 * 1000) > 1) {
    return (val / (1000 * 1000 * 1000)).toFixed(1) + 'T'
  } else if (val / (1000 * 1000) > 1) {
    return (val / (1000 * 1000)).toFixed(1) + 'M'
  } else if (val / 1000 > 1) {
    return (val / 1000).toFixed(1) + 'K'
  } else {
    return val
  }
}
