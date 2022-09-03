import i18n from '@tap/i18n'

// 毫秒换算成时分秒
export const formatMs = (msTime = 0, type = 'time') => {
  let time = msTime / 1000
  let arr = []
  arr.push({
    label: i18n.t('packages_business_task_info_d'),
    value: Math.floor(time / 60 / 60 / 24)
  }) // day
  arr.push({
    label: i18n.t('packages_business_task_info_h'),
    value: Math.floor(time / 60 / 60) % 24
  }) // hour
  arr.push({
    label: i18n.t('packages_business_task_info_m'),
    value: Math.floor(time / 60) % 60
  }) // minute
  arr.push({
    label: i18n.t('packages_business_task_info_s'),
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
    result = msTime + i18n.t('packages_business_task_info_ms')
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
