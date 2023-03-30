import i18n from '@/i18n'
import { NUMBER_MAP } from '@tap/business'

export function getSpec(item = {}) {
  const { cpu = 0, memory = 0 } = item
  if (!cpu || !memory) return ''
  return `${cpu}C${memory}G`
}

export function getPaymentMethod(item = {}) {
  const { type, periodUnit, period = 0 } = item
  const labelMap = {
    recurring_month: i18n.t('dfs_instance_utils_lianxu') + i18n.t('dfs_instance_utils_baoyue'),
    recurring_year: i18n.t('dfs_instance_utils_lianxu') + i18n.t('dfs_instance_utils_baonian')
  }
  const val = labelMap[`${type}_${periodUnit}`]
  if (val) return val
  if (!period) return ''
  if (periodUnit === 'year') return i18n.t('public_button_order') + NUMBER_MAP[period] + i18n.t('public_time_year')
  return i18n.t('public_button_order') + NUMBER_MAP[period] + i18n.t('dfs_instance_utils_geyue')
}
