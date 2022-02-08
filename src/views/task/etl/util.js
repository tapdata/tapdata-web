import { ETL_STATUS_MAP, ETL_SUB_STATUS_MAP } from '@/const'
// 获取子任务状态统计
export function getSubTaskStatus(rows = []) {
  const statusMap = {
    running: ['scheduling', 'running', 'pausing', 'stopping', 'scheduling'],
    not_running: ['edit', 'wait_run', 'pause', 'stop', 'complete', 'schedule_failed'],
    error: ['error']
  }
  const len = rows.length
  const etlStatusMap = ETL_STATUS_MAP
  let result = [],
    item = {}
  switch (len) {
    case 0:
      result = [
        Object.assign({ count: 1 }, ETL_STATUS_MAP['not_running'], {
          status: 'not_running'
        })
      ]
      break
    case 1:
      result = [
        Object.assign({ count: 1 }, ETL_SUB_STATUS_MAP[rows[0]?.status], {
          status: rows[0]?.status
        })
      ]
      break
    default:
      for (let key in etlStatusMap) {
        item = etlStatusMap[key]
        item.status = key
        item.count = 0
        rows.forEach(el => {
          if (statusMap[key].includes(el.status)) {
            item.count++
          }
        })
        result.push(item)
      }

      break
  }
  return result
}

// formatResult() {
//   const { rows, statusMap } = this
//   let result = []
//   let obj = deepCopy(ETL_STATUS_MAP)
//   for (let key in obj) {
//     obj[key].status = key
//     obj[key].count = 0
//     rows.forEach(el => {
//       if (statusMap[key].includes(el.status)) {
//         obj[key].count++
//       }
//     })
//     result.push(obj[key])
//   }
//   return result
// }
