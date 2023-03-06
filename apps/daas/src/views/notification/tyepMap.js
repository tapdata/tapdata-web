/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/20
 * @description
 */
import i18n from '@/i18n'

export const TYPEMAP = {
  started: i18n.global.t('notify_started'),
  paused: i18n.global.t('notify_paused'),
  edited: i18n.global.t('notify_edited'),
  deleted: i18n.global.t('notify_deleted'),
  abnormallyStopped: i18n.global.t('notify_abnormally_stopped'),
  stoppedByError: i18n.global.t('notify_stopped_by_error'),
  startupFailed: i18n.global.t('notify_startup_failed'),
  stopFailed: i18n.global.t('notify_stop_failed'),
  encounterERRORSkipped: i18n.global.t('notify_encounter_error_skipped'),
  CDCLag: i18n.global.t('notify_cdc_lag'),
  manageSeverRestartFailed: i18n.global.t('notify_manage_sever_restart_failed'),
  APISeverRestartFailed: i18n.global.t('notify_api_sever_restart_failed'),
  SYNCSeverRestartFailed: i18n.global.t('notify_sync_sever_restart_failed'),
  connectionInterrupted: i18n.global.t('notify_connection_interrupted'),
  manageSeverStartFailed: i18n.global.t('notify_manage_sever_start_failed'),
  APISeverStartFailed: i18n.global.t('notify_api_sever_start_failed'),
  SYNCSeverStartFailed: i18n.global.t('notify_sync_sever_start_failed'),
  manageSeverStopFailed: i18n.global.t('notify_manage_sever_stop_failed'),
  APISeverStopFailed: i18n.global.t('notify_api_sever_stop_failed'),
  SYNCSeverStopFailed: i18n.global.t('notify_sync_sever_stop_failed'),
  APISeverAbnormallyStopped: i18n.global.t('notify_api_sever_abnormally_stopped'),
  SYNCSeverAbnormallyStopped: i18n.global.t('notify_sync_sever_abnormally_stopped'),
  manageSeverAbnormallyStopped: i18n.global.t('notify_manage_sever_abnormally_Stopped'),
  manageSeverStartedSuccessfully: i18n.global.t('notify_manage_sever_started_successfully'),
  APISeverStartedSuccessfully: i18n.global.t('notify_api_sever_started_successfully'),
  SYNCSeverStartedSuccessfully: i18n.global.t('notify_sync_sever_started_successfully'),
  manageSeverStoppedSuccessfully: i18n.global.t('notify_manage_sever_Stopped_successfully'),
  APISeverStoppedSuccessfully: i18n.global.t('notify_api_sever_stopped_successfully'),
  SYNCSeverStoppedSuccessfully: i18n.global.t('notify_sync_sever_stopped_successfully'),
  manageSeverRestartedSuccessfully: i18n.global.t('notify_manage_sever_restarted_successfully'),
  APISeverRestartedSuccessfully: i18n.global.t('notify_api_sever_restarted_successfully'),
  SYNCSeverRestartedSuccessfully: i18n.global.t('notify_sync_sever_restarted_successfully'),
  newSeverCreatedSuccessfully: i18n.global.t('notify_new_sever_created_successfully'),
  newSeverDeletedSuccessfully: i18n.global.t('notify_new_sever_deleted_Successfully'),
  databaseDDLChanged: i18n.global.t('notify_database_ddl_changed'),
  inspectCount: i18n.global.t('notify_inspect_verify_job_count'),
  inspectValue: i18n.global.t('notify_inspect_verify_job_value'),
  inspectDelete: i18n.global.t('notify_inspect_verify_job_delete'),
  inspectError: i18n.global.t('notify_inspect_verify_job_error'),
  approaching: i18n.global.t('notify_approaching')
}

export const notificationMAP = {
  jobStarted: i18n.global.t('notify_job_started'),
  jobPaused: i18n.global.t('notification_jobPaused'),
  jobDeleted: i18n.global.t('notification_jobDeleted'),
  jobStateError: i18n.global.t('notification_jobStateError'),
  jobEncounterError: i18n.global.t('notification_jobEncounterError'),
  CDCLagTime: i18n.global.t('notification_CDCLagTime'),
  lagTime: i18n.global.t('notification_lagTime'),
  DDL: i18n.global.t('notification_DDL'),
  noticeInterval: i18n.global.t('notification_noticeInterval'),
  serverDisconnected: i18n.global.t('notification_serverDisconnected'),
  agentStarted: i18n.global.t('notification_agentStarted'),
  agentStopped: i18n.global.t('notification_agentStopped'),
  agentCreated: i18n.global.t('notification_agentCreated'),
  agentDeleted: i18n.global.t('notification_agentDeleted'),
  inspectCount: i18n.global.t('notification_inspectCount'),
  inspectValue: i18n.global.t('notification_inspectValue'),
  inspectDelete: i18n.global.t('notification_inspectDelete'),
  inspectError: i18n.global.t('notification_inspectError')
}
