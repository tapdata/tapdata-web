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
