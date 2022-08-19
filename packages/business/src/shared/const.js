import i18n from '@tap/i18n'

export const CONNECTION_STATUS_MAP = {
  ready: { text: i18n.t('connection_list_efficient'), type: 'success' },
  invalid: { text: i18n.t('connection_list_invalidation'), type: 'danger' },
  testing: { text: i18n.t('connection_list_testing'), type: 'warning' }
}

export const TASK_STATUS_MAP = {
  running: { text: i18n.t('status_running'), icon: 'yunxingzhong', type: 'success' },
  paused: { text: i18n.t('status_paused'), icon: 'daiqidong' },
  error: { text: i18n.t('status_error'), icon: 'cuowu', type: 'warning' },
  draft: { text: i18n.t('status_draft'), icon: 'daiqidong' },
  scheduled: { text: i18n.t('status_scheduled'), icon: 'qidongzhong', type: 'success' },
  stopping: { text: i18n.t('status_stopping'), icon: 'tingzhizhong', type: 'success' },
  'force stopping': { text: i18n.t('status_force_stopping'), icon: 'qiangzhitingzhi', type: 'success' },
  finished: { text: i18n.t('status_finished'), icon: 'yiwancheng', type: 'success' }
}

export const MILESTONE_STATUS_MAP = {
  waiting: { text: i18n.t('milestone_list_status_waiting'), icon: 'daizhixing' },
  running: { text: i18n.t('milestone_list_status_progressing'), icon: 'jinxingzhong' },
  error: { text: i18n.t('milestone_list_status_error'), icon: 'cuowu' },
  finish: { text: i18n.t('milestone_list_status_finish'), icon: 'yiwancheng' },
  paused: { text: i18n.t('milestone_list_status_stopping'), icon: 'yizanting' }
}

export const ETL_STATUS_MAP = {
  running: { text: i18n.t('task_status_running'), type: 'success' },
  not_running: { text: i18n.t('task_status_not_running'), type: 'disable' },
  error: { text: i18n.t('task_status_error'), type: 'danger' }
}

export const ETL_SUB_STATUS_MAP = {
  ready: { text: i18n.t('status_ready'), type: 'ready' },
  edit: { text: i18n.t('status_edit'), type: 'edit' },
  scheduling: { text: i18n.t('status_scheduling'), type: 'scheduling' },
  schedule_failed: { text: i18n.t('status_schedule_failed'), type: 'schedule_failed' },
  wait_run: { text: i18n.t('status_wait_run'), type: 'wait_run' },
  running: { text: i18n.t('status_running'), type: 'running' },
  stopping: { text: i18n.t('status_stopping'), type: 'stopping' },
  stop: { text: i18n.t('status_stop'), type: 'stop' },
  complete: { text: i18n.t('status_complete'), type: 'complete' },
  error: { text: i18n.t('task_status_error'), type: 'error' }
}

export const SHARECDC_MAP = {
  running: { text: i18n.t('status_running'), icon: 'running', type: 'success' },
  stop: { text: i18n.t('status_stop'), icon: 'stop' },
  error: { text: i18n.t('status_error'), icon: 'error', type: 'warning' },
  edit: { text: i18n.t('status_edit'), icon: 'edit' },
  scheduling: { text: i18n.t('status_scheduling'), icon: 'scheduling', type: 'success' },
  stopping: { text: i18n.t('status_stopping'), icon: 'stopping', type: 'warning' }
}
