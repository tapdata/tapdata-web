import { NUMBER_MAP } from '@tap/business'

export function getSpec(item = {}) {
  const { cpu = 0, memory = 0 } = item
  if (!cpu || !memory) return ''
  return `${cpu}C${memory}G`
}

export function getPaymentMethod(item = {}) {
  const { type, periodUnit, period = 0 } = item
  const labelMap = {
    recurring_month: '连续' + '包月',
    recurring_year: '连续' + '包年'
  }
  const val = labelMap[`${type}_${periodUnit}`]
  if (val) return val
  if (periodUnit === 'year') return '订购' + NUMBER_MAP[period] + '年'
  return '订购' + NUMBER_MAP[period] + '个月'
}

