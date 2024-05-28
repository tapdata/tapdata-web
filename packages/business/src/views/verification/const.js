import i18n from '@tap/i18n'

export const inspectMethod = {
  row_count: i18n.t('packages_business_verification_row_verify'),
  field: i18n.t('packages_business_verification_content_verify'),
  jointField: i18n.t('packages_business_verification_joint_verify'),
  cdcCount: i18n.t('packages_business_verification_details_dongtaijiaoyan'),
  hash: i18n.t('packages_business_verification_hash_verify')
}

export const typeList = [
  { label: i18n.t('public_select_option_all'), value: '' },
  { label: i18n.t('packages_business_verification_row_verify'), value: 'row_count' },
  { label: i18n.t('packages_business_verification_content_verify'), value: 'field' },
  { label: i18n.t('packages_business_verification_joint_verify'), value: 'jointField' },
  { label: i18n.t('packages_business_verification_hash_verify'), value: 'hash' }
]

export const statusMap = {
  waiting: i18n.t('packages_business_verification_waiting'),
  scheduling: i18n.t('packages_business_verification_scheduling'),
  error: i18n.t('packages_business_verification_error'),
  done: i18n.t('packages_business_verification_done'),
  running: i18n.t('packages_business_verification_running'),
  stopping: i18n.t('public_status_stopping')
}
