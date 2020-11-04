/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/20
 * @description
 */
import i18n from '../../i18n/i18n';

export const TYPEMAP = {
	started: i18n.t('notification.started'),
	paused: i18n.t('notification.paused'),
	edited: i18n.t('notification.edited'),
	deleted: i18n.t('notification.deleted'),
	abnormallyStopped: i18n.t('notification.abnormallyStopped'),
	stoppedByError: i18n.t('notification.stoppedByError'),
	startupFailed: i18n.t('notification.startupFailed'),
	stopFailed: i18n.t('notification.startupFailed'),
	encounterERRORSkipped: i18n.t('notification.encounterERRORSkipped'),
	CDCLag: i18n.t('notification.CDCLag'),
	manageSeverRestartFailed: i18n.t('notification.manageSeverRestartFailed'),
	APISeverRestartFailed: i18n.t('notification.APISeverRestartFailed'),
	SYNCSeverRestartFailed: i18n.t('notification.SYNCSeverRestartFailed'),
	connectionInterrupted: i18n.t('notification.connectionInterrupted'),
	manageSeverStartFailed: i18n.t('notification.manageSeverStartFailed'),
	APISeverStartFailed: i18n.t('notification.APISeverStartFailed'),
	SYNCSeverStartFailed: i18n.t('notification.SYNCSeverStartFailed'),
	manageSeverStopFailed: i18n.t('notification.manageSeverStopFailed'),
	APISeverStopFailed: i18n.t('notification.APISeverStopFailed'),
	SYNCSeverStopFailed: i18n.t('notification.SYNCSeverStopFailed'),
	APISeverAbnormallyStopped: i18n.t('notification.APISeverAbnormallyStopped'),
	SYNCSeverAbnormallyStopped: i18n.t('notification.SYNCSeverAbnormallyStopped'),
	manageSeverAbnormallyStopped: i18n.t('notification.manageSeverAbnormallyStopped'),
	manageSeverStartedSuccessfully: i18n.t('notification.manageSeverStartedSuccessfully'),
	APISeverStartedSuccessfully: i18n.t('notification.APISeverStartedSuccessfully'),
	SYNCSeverStartedSuccessfully: i18n.t('notification.SYNCSeverStartedSuccessfully'),
	manageSeverStoppedSuccessfully: i18n.t('notification.manageSeverStoppedSuccessfully'),
	APISeverStoppedSuccessfully: i18n.t('notification.APISeverStoppedSuccessfully'),
	SYNCSeverStoppedSuccessfully: i18n.t('notification.SYNCSeverStoppedSuccessfully'),
	manageSeverRestartedSuccessfully: i18n.t('notification.manageSeverRestartedSuccessfully'),
	APISeverRestartedSuccessfully: i18n.t('notification.APISeverRestartedSuccessfully'),
	SYNCSeverRestartedSuccessfully: i18n.t('notification.SYNCSeverRestartedSuccessfully'),
	newSeverCreatedSuccessfully: i18n.t('notification.newSeverCreatedSuccessfully'),
	newSeverDeletedSuccessfully: i18n.t('notification.newSeverDeletedSuccessfully'),
	databaseDDLChanged: i18n.t('notification.databaseDDLChanged'),
	inspectCount: i18n.t('notification.inspectVerifyJobCount'),
	inspectValue: i18n.t('notification.inspectVerifyJobValue'),
	inspectDelete: i18n.t('notification.inspectVerifyJobDelete'),
	inspectError: i18n.t('notification.inspectVerifyJobError')
};

export const notificationMAP = {
	jobStarted: i18n.t('notification.jobStarted'),
	jobPaused: i18n.t('notification.jobPaused'),
	jobDeleted: i18n.t('notification.jobDeleted'),
	jobStateError: i18n.t('notification.jobStateError'),
	jobEncounterError: i18n.t('notification.jobEncounterError'),
	jobNoticeInterval: i18n.t('notification.jobNoticeInterval'),
	CDCLagTime: i18n.t('notification.CDCLagTime'),
	lagTime: i18n.t('notification.lagTime'),
	DDL: i18n.t('notification.DDL'),
	noticeInterval: i18n.t('notification.noticeInterval'),
	serverDisconnected: i18n.t('notification.serverDisconnected'),
	agentStarted: i18n.t('notification.agentStarted'),
	agentStopped: i18n.t('notification.agentStopped'),
	agentCreated: i18n.t('notification.agentCreated'),
	inspectCount: i18n.t('notification.inspectCount'),
	inspectValue: i18n.t('notification.inspectValue'),
	inspectDelete: i18n.t('notification.inspectDelete'),
	inspectError: i18n.t('notification.inspectError')
};
