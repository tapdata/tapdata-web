import i18n from '@tap/i18n'

export const inspectMethod = {
  row_count: i18n.t('packages_business_verification_rowVerify'),
  field: i18n.t('packages_business_verification_contentVerify'),
  jointField: i18n.t('packages_business_verification_jointVerify'),
  cdcCount: i18n.t('packages_business_verification_details_dongtaijiaoyan'),
  hash: i18n.t('packages_business_verification_hash_verify')
}

export const statusMap = {
  waiting: i18n.t('packages_business_verification_waiting'),
  scheduling: i18n.t('packages_business_verification_scheduling'),
  error: i18n.t('packages_business_verification_error'),
  done: i18n.t('packages_business_verification_done'),
  running: i18n.t('packages_business_verification_running')
}
