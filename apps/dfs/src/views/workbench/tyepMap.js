/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/20
 * @description
 */
import i18n from '@/i18n'
export const TYPEMAP = {
  started: i18n.t('notify_list_started'),
  paused: i18n.t('notify_list_paused'),
  edited: i18n.t('notify_list_edited'),
  deleted: i18n.t('notify_list_deleted'),
  abnormallyStopped: i18n.t('notify_abnormally_stopped'),
  stoppedByError: i18n.t('notify_list_stopped_by_error'),
  startupFailed: i18n.t('notify_list_startup_failed'),
  stopFailed: i18n.t('notify_list_stop_failed'),
  encounterERRORSkipped: i18n.t('notify_list_encounter_error_skipped'),
  releaseAgent: i18n.t('notify_list_releases_agent'),
  willReleaseAgent: i18n.t('notify_list_will_release_agent'),
  CDCLag: 'CDC滞后超时',
  manageSeverRestartFailed: '管理端服务重启失败',
  APISeverRestartFailed: 'API服务重启失败',
  SYNCSeverRestartFailed: '同步治理服务重启失败',
  connectionInterrupted: i18n.t('notify_list_connection_interrupted'),
  connected: i18n.t('notify_list_connected'),
  manageSeverStartFailed: '管理端服务启动失败',
  APISeverStartFailed: 'API服务启动失败',
  SYNCSeverStartFailed: '同步治理服务启动失败',
  manageSeverStopFailed: '管理端服务停止失败',
  APISeverStopFailed: 'API服务停止失败',
  SYNCSeverStopFailed: '同步治理服务停止失败',
  APISeverAbnormallyStopped: 'API服务意外停止',
  SYNCSeverAbnormallyStopped: '同步治理服务意外停止',
  manageSeverAbnormallyStopped: '管理端服务意外停止',
  manageSeverStartedSuccessfully: '管理端服务已启动',
  APISeverStartedSuccessfully: 'API服务已启动',
  SYNCSeverStartedSuccessfully: '同步治理服务已启动',
  manageSeverStoppedSuccessfully: '管理端服务已停止',
  APISeverStoppedSuccessfully: 'API服务已停止',
  SYNCSeverStoppedSuccessfully: '同步治理服务已停止',
  manageSeverRestartedSuccessfully: '管理端服务已重启',
  APISeverRestartedSuccessfully: 'API服务已重启',
  SYNCSeverRestartedSuccessfully: '同步治理服务已重启',
  newSeverCreatedSuccessfully: '新服务监控被创建',
  newSeverDeletedSuccessfully: '新服务监控被删除',
  databaseDDLChanged: '监测到数据库DDL变化',
  inspectCount: i18n.t('notify_list_inspect_count'),
  inspectValue: i18n.t('notify_list_inspect_value'),
  inspectDelete: i18n.t('notify_list_inspect_delete'),
  inspectError: i18n.t('notify_list_inspect_error'),
  approaching: i18n.t('notify_list_approaching')
}

export const notificationMAP = {
  jobStarted: '任务被启动',
  jobPaused: '任务被停止',
  jobDeleted: '任务被删除',
  jobStateError: '任务状态error',
  jobEncounterError: '任务遇到错误',
  CDCLagTime: 'CDC滞后通知',
  lagTime: '滞后时间',
  DDL: '数据库DDL变化',
  noticeInterval: '发送间隔',
  serverDisconnected: '服务器断开连接',
  agentStarted: i18n.t('notify_list_agent_started'),
  agentStopped: i18n.t('notify_list_agent_stopped'),
  agentCreated: i18n.t('notify_list_agent_created'),
  agentDeleted: i18n.t('notify_list_agent_deleted')
}
