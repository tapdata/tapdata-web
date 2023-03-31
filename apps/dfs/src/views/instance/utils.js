import i18n from '@/i18n'
import { AGENT_SPEC_MAP, NUMBER_MAP } from '@tap/business'

export function getSpec(item = {}) {
  const { name = '', cpu = 0, memory = 0 } = item
  if (name) return name
  if (!cpu || !memory) return ''
  return AGENT_SPEC_MAP[`${cpu}C${memory}G`]
}

export function getPaymentMethod(item = {}) {
  const isEn = i18n.locale === 'en'
  const s = isEn ? ' ' : ''
  const { type, periodUnit, period = 0 } = item
  const labelMap = {
    recurring_day: i18n.t('dfs_instance_utils_lianxu') + s + i18n.t('public_time_every_day'),
    recurring_month: i18n.t('dfs_instance_utils_lianxu') + s + i18n.t('dfs_instance_utils_baoyue'),
    recurring_year: i18n.t('dfs_instance_utils_lianxu') + s + i18n.t('dfs_instance_utils_baonian')
  }
  const val = labelMap[`${type}_${periodUnit}`]
  if (val) return val
  if (!period) return ''
  if (periodUnit === 'year')
    return i18n.t('public_button_order') + s + NUMBER_MAP[period] + s + i18n.t('public_time_year')
  return i18n.t('public_button_order') + s + NUMBER_MAP[period] + s + i18n.t('dfs_instance_utils_geyue')
}
