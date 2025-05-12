import { AGENT_SPEC_MAP, NUMBER_MAP } from '@tap/business'
import i18n from '@/i18n'

export function getSpec(item = {}) {
  const { name = '', cpu = 0, memory = 0 } = item
  if (name) return name
  if (!cpu || !memory) return ''
  return AGENT_SPEC_MAP[`${cpu}C${memory}G`]
}

export function getPaymentMethod(item = {}, chargeProvider = '') {
  const map = {
    Aliyun: i18n.global.t('dfs_instance_utils_baozhouqi'),
    FreeTier: i18n.global.t('dfs_instance_instance_mianfei'),
  }

  if (map[chargeProvider]) return map[chargeProvider]

  const isEn = i18n.locale === 'en'
  const s = isEn ? ' ' : ''
  const { type, periodUnit } = item
  const labelMap = {
    recurring_day:
      i18n.global.t('dfs_instance_utils_lianxu') +
      s +
      i18n.global.t('public_time_every_day'),
    recurring_month: i18n.global.t('dfs_instance_utils_baoyue'),
    recurring_year: i18n.global.t('dfs_instance_utils_baonian'),
  }
  const val = labelMap[`${type}_${periodUnit}`]
  if (val) return val
  if (periodUnit === 'year')
    return i18n.global.t('dfs_instance_utils_one_year_only')
  return i18n.global.t('dfs_instance_utils_one_month_only')
}
export const AGENT_TYPE_MAP = {
  local: i18n.global.t('public_selfHost'),
  cloud: i18n.global.t('public_fullManagement'),
  selfHost: i18n.global.t('public_selfHost'),
  fullManagement: i18n.global.t('public_fullManagement'),
  Local: i18n.global.t('public_selfHost'),
  Cloud: i18n.global.t('public_fullManagement'),
}
