import i18n from '@tap/i18n'

export const alarmStatus = {
  ING: { text: i18n.t('packages_dag_shared_const_gaojingzhong'), type: 'waiting' },
  RECOVER: { text: i18n.t('packages_dag_shared_const_yihuifu'), type: 'finish' },
  CLOESE: { text: i18n.t('packages_dag_components_alert_yiguanbi'), type: 'success' }
}

export const alarmLevel = {
  RECOVERY: { text: i18n.t('packages_dag_components_alert_huifu'), type: 'finish' },
  NORMAL: { text: i18n.t('packages_dag_shared_const_yiban'), type: 'edit' },
  WARNING: { text: i18n.t('packages_dag_shared_const_jinggao'), type: 'waiting' },
  CRITICAL: { text: i18n.t('packages_dag_shared_const_yanzhong'), type: 'stop' },
  EMERGENCY: { text: i18n.t('packages_dag_shared_const_jinji'), type: 'error' }
}

export const alarmLevelSort = ['EMERGENCY', 'CRITICAL', 'WARNING', 'NORMAL', 'RECOVERY']
