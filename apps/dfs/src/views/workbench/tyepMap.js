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
  CDCLag: i18n.t('dfs_workbench_tyepmap_cdCzhihou2'),
  manageSeverRestartFailed: i18n.t('dfs_workbench_tyepmap_guanliduanfuwu7'),
  APISeverRestartFailed: i18n.t('dfs_workbench_tyepmap_apIfuwu7'),
  SYNCSeverRestartFailed: i18n.t('dfs_workbench_tyepmap_tongbuzhilifu7'),
  connectionInterrupted: i18n.t('notify_list_connection_interrupted'),
  connected: i18n.t('notify_list_connected'),
  manageSeverStartFailed: i18n.t('dfs_workbench_tyepmap_guanliduanfuwu6'),
  APISeverStartFailed: i18n.t('dfs_workbench_tyepmap_apIfuwu6'),
  SYNCSeverStartFailed: i18n.t('dfs_workbench_tyepmap_tongbuzhilifu6'),
  manageSeverStopFailed: i18n.t('dfs_workbench_tyepmap_guanliduanfuwu5'),
  APISeverStopFailed: i18n.t('dfs_workbench_tyepmap_apIfuwu5'),
  SYNCSeverStopFailed: i18n.t('dfs_workbench_tyepmap_tongbuzhilifu5'),
  APISeverAbnormallyStopped: i18n.t('dfs_workbench_tyepmap_apIfuwu4'),
  SYNCSeverAbnormallyStopped: i18n.t('dfs_workbench_tyepmap_tongbuzhilifu4'),
  manageSeverAbnormallyStopped: i18n.t('dfs_workbench_tyepmap_guanliduanfuwu4'),
  manageSeverStartedSuccessfully: i18n.t('dfs_workbench_tyepmap_guanliduanfuwu3'),
  APISeverStartedSuccessfully: i18n.t('dfs_workbench_tyepmap_apIfuwu3'),
  SYNCSeverStartedSuccessfully: i18n.t('dfs_workbench_tyepmap_tongbuzhilifu3'),
  manageSeverStoppedSuccessfully: i18n.t('dfs_workbench_tyepmap_guanliduanfuwu2'),
  APISeverStoppedSuccessfully: i18n.t('dfs_workbench_tyepmap_apIfuwu2'),
  SYNCSeverStoppedSuccessfully: i18n.t('dfs_workbench_tyepmap_tongbuzhilifu2'),
  manageSeverRestartedSuccessfully: i18n.t('dfs_workbench_tyepmap_guanliduanfuwu'),
  APISeverRestartedSuccessfully: i18n.t('dfs_workbench_tyepmap_apIfuwu'),
  SYNCSeverRestartedSuccessfully: i18n.t('dfs_workbench_tyepmap_tongbuzhilifu'),
  newSeverCreatedSuccessfully: i18n.t('dfs_workbench_tyepmap_xinfuwujiankong2'),
  newSeverDeletedSuccessfully: i18n.t('dfs_workbench_tyepmap_xinfuwujiankong'),
  databaseDDLChanged: i18n.t('dfs_workbench_tyepmap_jiancedaoshuju'),
  inspectCount: i18n.t('notify_list_inspect_count'),
  inspectValue: i18n.t('notify_list_inspect_value'),
  inspectDelete: i18n.t('notify_list_inspect_delete'),
  inspectError: i18n.t('notify_list_inspect_error'),
  approaching: i18n.t('notify_list_approaching')
}

export const notificationMAP = {
  jobStarted: i18n.t('dfs_workbench_tyepmap_renwubeiqidong'),
  jobPaused: i18n.t('dfs_workbench_tyepmap_renwubeitingzhi'),
  jobDeleted: i18n.t('dfs_workbench_tyepmap_renwubeishanchu'),
  jobStateError: i18n.t('dfs_workbench_tyepmap_renwuzhuangtaie'),
  jobEncounterError: i18n.t('dfs_workbench_tyepmap_renwuyudaocuo'),
  CDCLagTime: i18n.t('dfs_workbench_tyepmap_cdCzhihou'),
  lagTime: i18n.t('dfs_workbench_tyepmap_zhihoushijian'),
  DDL: i18n.t('dfs_workbench_tyepmap_shujukuDd'),
  noticeInterval: i18n.t('dfs_workbench_tyepmap_fasongjiange'),
  serverDisconnected: i18n.t('dfs_workbench_tyepmap_fuwuqiduankai'),
  agentStarted: i18n.t('notify_list_agent_started'),
  agentStopped: i18n.t('notify_list_agent_stopped'),
  agentCreated: i18n.t('notify_list_agent_created'),
  agentDeleted: i18n.t('notify_list_agent_deleted')
}
