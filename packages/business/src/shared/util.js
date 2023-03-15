import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'
import { dayjs } from './dayjs'

// 毫秒换算成时分秒
export const formatMs = (msTime = 0, type = 'time') => {
  let time = msTime / 1000
  let arr = []
  arr.push({
    label: i18n.t('public_time_d'),
    value: Math.floor(time / 60 / 60 / 24)
  }) // day
  arr.push({
    label: i18n.t('public_time_h'),
    value: Math.floor(time / 60 / 60) % 24
  }) // hour
  arr.push({
    label: i18n.t('public_time_m'),
    value: Math.floor(time / 60) % 60
  }) // minute
  arr.push({
    label: i18n.t('public_time_s'),
    value: Math.floor(time) % 60
  }) // second
  let result = ''
  if (type === 'time') {
    result = arr
      .slice(1)
      .map(t => (t.value + '').padStart(2, '0'))
      .join(':')
    return result
  }
  arr.forEach(el => {
    if (el.value) {
      result += el.value + el.label
    }
  })
  if (!result) {
    result = msTime + i18n.t('public_time_ms')
  }
  return result
}

// 转化单位
export function toThousandsUnit(val) {
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

// datepicker配置，有效时间为 当前时间~以前
export function getPickerOptionsBeforeTime(val = Time.now(), nowTimestamp, cb) {
  const now = nowTimestamp || Time.now()
  const formatMap = {
    date: 'YYYY-MM-DD',
    time: 'HH:mm:ss',
    startTime: '00:00:00',
    endTime: '23:59:59'
  }

  const pickDate = dayjs(val).format(formatMap.date)
  const nowDate = dayjs(now).format(formatMap.date)
  const nowTime = dayjs(now).format(formatMap.time)
  if (val > now) {
    cb?.()
  }
  let op = {
    disabledDate: time => {
      return new Date(time).getTime() > now
    }
  }
  if (pickDate === nowDate) {
    op.selectableRange = `${formatMap.startTime} - ${nowTime}`
  } else {
    op.selectableRange = `${formatMap.startTime} - ${formatMap.endTime}`
  }
  return op
}
