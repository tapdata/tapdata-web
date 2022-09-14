import i18n from '@tap/i18n'

export const alarmStatus = {
  ING: { text: i18n.t('packages_dag_shared_const_gaojingzhong'), type: 'ING' },
  RECOVER: { text: i18n.t('packages_dag_shared_const_yihuifu'), type: 'success' },
  CLOESE: { text: i18n.t('packages_dag_components_alert_yiguanbi'), type: 'success' }
}

export const alarmLevel = {
  RECOVERY: { text: i18n.t('packages_dag_components_alert_huifu'), type: 'success' },
  NORMAL: { text: i18n.t('packages_dag_shared_const_yiban'), type: 'lprimary' },
  WARNING: { text: i18n.t('packages_dag_shared_const_jinggao'), type: 'warning' },
  CRITICAL: { text: i18n.t('packages_dag_shared_const_yanzhong'), type: 'warning' },
  EMERGENCY: { text: i18n.t('packages_dag_shared_const_jinji'), type: 'danger' }
}
