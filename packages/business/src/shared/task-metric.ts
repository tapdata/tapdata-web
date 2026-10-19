import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import { isNumber } from 'lodash-es'

dayjs.extend(relativeTime)

export function formatTaskMetricInfo(
  metricInfo: Record<string, any>,
  translate: (key: string, params: Record<string, any>) => string,
  formatMemory: (value: any, type: string, fix: number) => string,
  now = Date.now(),
) {
  const day = dayjs(metricInfo.lastUpdateTime)

  return {
    ...metricInfo,
    cpuUsage: isNumber(metricInfo.cpuUsage)
      ? `${Number(metricInfo.cpuUsage.toFixed(2))}%`
      : '--',
    memoryUsage: isNumber(metricInfo.memoryUsage)
      ? formatMemory(metricInfo.memoryUsage, 'b', 2)
      : '--',
    lastUpdateTime: translate('public_updated_from_now', {
      time: day.fromNow(),
    }),
    hasWarning: now - day.valueOf() > 60000,
  }
}
