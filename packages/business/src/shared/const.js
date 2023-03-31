import i18n from '@tap/i18n'

export const CONNECTION_STATUS_MAP = {
  ready: { text: i18n.t('public_status_ready'), type: 'success' },
  invalid: { text: i18n.t('public_status_invalid'), type: 'danger' },
  testing: { text: i18n.t('public_status_testing'), type: 'warning' }
}

export const CONNECTION_TYPE_MAP = {
  source: { text: i18n.t('public_connection_type_source') },
  target: { text: i18n.t('public_connection_type_target') },
  source_and_target: { text: i18n.t('public_connection_type_source_and_target') }
}

export const TASK_STATUS_MAP = {
  running: { text: i18n.t('public_status_running'), icon: 'yunxingzhong', type: 'success' },
  paused: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong' },
  error: { text: i18n.t('public_status_error'), icon: 'cuowu', type: 'warning' },
  draft: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong' },
  scheduled: { text: i18n.t('public_status_starting'), icon: 'qidongzhong', type: 'success' },
  stopping: { text: i18n.t('public_status_stopping'), icon: 'tingzhizhong', type: 'success' },
  'force stopping': {
    text: i18n.t('public_status_force_stopping'),
    icon: 'qiangzhitingzhi',
    type: 'success'
  },
  finished: { text: i18n.t('public_status_finished'), icon: 'yiwancheng', type: 'success' }
}

export const MILESTONE_STATUS_MAP = {
  waiting: { text: i18n.t('packages_business_milestone_list_status_waiting'), icon: 'daizhixing' },
  running: { text: i18n.t('packages_business_milestone_list_status_progressing'), icon: 'jinxingzhong' },
  error: { text: i18n.t('public_status_error'), icon: 'cuowu' },
  finish: { text: i18n.t('public_status_finished'), icon: 'yiwancheng' },
  paused: { text: i18n.t('public_status_stopping'), icon: 'yizanting' }
}

export const ETL_STATUS_MAP = {
  running: { text: i18n.t('packages_business_task_status_running'), type: 'success' },
  not_running: { text: i18n.t('packages_business_task_status_not_running'), type: 'disable' },
  error: { text: i18n.t('public_status_error'), type: 'danger' }
}

export const ETL_SUB_STATUS_MAP = {
  ready: { text: i18n.t('public_status_wait_run'), type: 'ready' },
  edit: { text: i18n.t('public_status_edit'), type: 'edit' },
  scheduling: { text: i18n.t('public_status_starting'), type: 'scheduling' },
  schedule_failed: { text: i18n.t('public_status_error'), type: 'schedule_failed' },
  wait_run: { text: i18n.t('public_status_starting'), type: 'wait_run' },
  running: { text: i18n.t('public_status_running'), type: 'running' },
  stopping: { text: i18n.t('public_status_stopping'), type: 'stopping' },
  stop: { text: i18n.t('public_status_stop'), type: 'stop' },
  complete: { text: i18n.t('public_status_finished'), type: 'complete' },
  error: { text: i18n.t('public_status_error'), type: 'error' }
}

export const SHARECDC_MAP = {
  running: { text: i18n.t('public_status_running'), icon: 'running', type: 'success' },
  stop: { text: i18n.t('public_status_stop'), icon: 'stop' },
  error: { text: i18n.t('public_status_error'), icon: 'error', type: 'warning' },
  edit: { text: i18n.t('public_status_edit'), icon: 'edit' },
  scheduling: { text: i18n.t('public_status_starting'), icon: 'scheduling', type: 'success' },
  stopping: { text: i18n.t('public_status_stopping'), icon: 'stopping', type: 'warning' }
}

export const ALARM_STATUS_MAP = {
  ING: { text: i18n.t('packages_business_shared_const_gaojingzhong'), type: 'waiting' },
  RECOVER: { text: i18n.t('packages_business_shared_const_yihuifu'), type: 'finish' },
  CLOESE: { text: i18n.t('packages_business_components_alert_yiguanbi'), type: 'success' }
}

export const ALARM_LEVEL_MAP = {
  RECOVERY: { text: i18n.t('packages_business_components_alert_huifu'), type: 'finish' },
  NORMAL: { text: i18n.t('packages_business_shared_const_yiban'), type: 'edit' },
  WARNING: { text: i18n.t('packages_business_shared_const_jinggao'), type: 'waiting' },
  CRITICAL: { text: i18n.t('packages_business_shared_const_yanzhong'), type: 'stop' },
  EMERGENCY: { text: i18n.t('packages_business_shared_const_jinji'), type: 'error' }
}

export const ALARM_LEVEL_SORT = ['EMERGENCY', 'CRITICAL', 'WARNING', 'NORMAL', 'RECOVERY']

export const ORDER_STATUS_MAP = {
  unPay: i18n.t('packages_business_shared_const_weizhifu'),
  pay: i18n.t('packages_business_shared_const_yizhifu'),
  payFail: i18n.t('packages_business_shared_const_zhifushibai'),
  refund: i18n.t('packages_business_shared_const_yituikuan'),
  refundFail: i18n.t('packages_business_shared_const_tuikuanshibai'),
  refunding: i18n.t('packages_business_shared_const_tuikuanzhong'),
  expire: i18n.t('packages_business_shared_const_shixiao'),
  cancelSubscribe: i18n.t('packages_business_shared_const_yiquxiao')
}

export const CURRENCY_SYMBOL_MAP = {
  usd: '$',
  hkd: 'HK$',
  cny: '¥'
}

export const NUMBER_MAP = {
  0: i18n.t('packages_business_shared_const_ling'),
  1: i18n.t('packages_business_shared_const_yi'),
  2: i18n.t('packages_business_shared_const_er'),
  3: i18n.t('packages_business_shared_const_san'),
  4: i18n.t('packages_business_shared_const_si'),
  5: i18n.t('packages_business_shared_const_wu'),
  6: i18n.t('packages_business_shared_const_liu'),
  7: i18n.t('packages_business_shared_const_qi'),
  8: i18n.t('packages_business_shared_const_ba'),
  9: i18n.t('packages_business_shared_const_jiu'),
  10: i18n.t('packages_business_shared_const_shi'),
  11: i18n.t('packages_business_shared_const_shiyi'),
  12: i18n.t('packages_business_shared_const_shier')
}

export const AGENT_SPEC_MAP = {
  '1C2G': 'Mini',
  '2C4G': 'Small',
  '4C8G': 'Medium',
  '8C16G': 'Large',
  '12C24G': 'XLarge',
  '16C32G': '2Large',
  '32C64G': '4Large'
}
