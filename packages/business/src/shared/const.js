import locale from '../locale'

export const CONNECTION_STATUS_MAP = {
  ready: { text: locale.t('connection_list_efficient'), type: 'success' },
  invalid: { text: locale.t('connection_list_invalidation'), type: 'danger' },
  testing: { text: locale.t('connection_list_testing'), type: 'warning' }
}

export const TASK_STATUS_MAP = {
  running: { text: locale.t('status_running'), icon: 'yunxingzhong', type: 'success' },
  paused: { text: locale.t('status_paused'), icon: 'daiqidong' },
  error: { text: locale.t('status_error'), icon: 'cuowu', type: 'warning' },
  draft: { text: locale.t('status_draft'), icon: 'daiqidong' },
  scheduled: { text: locale.t('status_scheduled'), icon: 'qidongzhong', type: 'success' },
  stopping: { text: locale.t('status_stopping'), icon: 'tingzhizhong', type: 'success' },
  'force stopping': { text: locale.t('status_force_stopping'), icon: 'qiangzhitingzhi', type: 'success' },
  finished: { text: locale.t('status_finished'), icon: 'yiwancheng', type: 'success' }
}

export const MILESTONE_STATUS_MAP = {
  waiting: { text: locale.t('milestone_list_status_waiting'), icon: 'daizhixing' },
  running: { text: locale.t('milestone_list_status_progressing'), icon: 'jinxingzhong' },
  error: { text: locale.t('milestone_list_status_error'), icon: 'cuowu' },
  finish: { text: locale.t('milestone_list_status_finish'), icon: 'yiwancheng' },
  paused: { text: locale.t('milestone_list_status_stopping'), icon: 'yizanting' }
}

export const ETL_STATUS_MAP = {
  running: { text: locale.t('task_status_running'), type: 'success' },
  not_running: { text: locale.t('task_status_not_running'), type: 'disable' },
  error: { text: locale.t('task_status_error'), type: 'danger' }
}

export const ETL_SUB_STATUS_MAP = {
  ready: { text: locale.t('status_ready'), type: 'ready' },
  edit: { text: locale.t('status_edit'), type: 'edit' },
  scheduling: { text: locale.t('status_scheduling'), type: 'scheduling' },
  schedule_failed: { text: locale.t('status_schedule_failed'), type: 'schedule_failed' },
  wait_run: { text: locale.t('status_wait_run'), type: 'wait_run' },
  running: { text: locale.t('status_running'), type: 'running' },
  stopping: { text: locale.t('status_stopping'), type: 'stopping' },
  stop: { text: locale.t('status_stop'), type: 'stop' },
  complete: { text: locale.t('status_complete'), type: 'complete' },
  error: { text: locale.t('task_status_error'), type: 'error' }
}

export const SHARECDC_MAP = {
  running: { text: locale.t('status_running'), icon: 'running', type: 'success' },
  stop: { text: locale.t('status_stop'), icon: 'stop' },
  error: { text: locale.t('status_error'), icon: 'error', type: 'warning' },
  edit: { text: locale.t('status_edit'), icon: 'edit' },
  scheduling: { text: locale.t('status_scheduling'), icon: 'scheduling', type: 'success' },
  stopping: { text: locale.t('status_stopping'), icon: 'stopping', type: 'warning' }
}
