/**
 * @author xzq
 * @date 7/15/20
 * @description
 */
let statusBtMap = {
	draft: {
		start: false,
		stop: true,
		forceStop: true,
		reset: false,
		setting: false,
		preview: false,
		logs: false,
		reloadSchema: false,
		finder: false,
		edit: false
	},
	running: {
		start: true,
		stop: false,
		forceStop: true,
		reset: true,
		setting: true,
		preview: false,
		logs: false,
		reloadSchema: true,
		finder: true,
		edit: true
	},
	stopping: {
		start: true,
		stop: true,
		forceStop: false,
		reset: true,
		setting: true,
		preview: true,
		logs: true,
		reloadSchema: true,
		finder: true,
		edit: true
	},
	scheduled: {
		start: true,
		stop: true,
		forceStop: false,
		reset: true,
		setting: true,
		preview: true,
		logs: true,
		reloadSchema: true,
		finder: true,
		edit: true
	},
	error: {
		start: false,
		stop: true,
		forceStop: true,
		reset: false,
		setting: false,
		preview: false,
		logs: false,
		reloadSchema: false,
		finder: false,
		edit: false
	},
	paused: {
		start: false,
		stop: true,
		forceStop: true,
		reset: false,
		setting: false,
		preview: false,
		logs: false,
		reloadSchema: false,
		finder: true,
		edit: false
	},
	'force stopping': {
		start: true,
		stop: true,
		forceStop: true,
		reset: true,
		setting: true,
		preview: true,
		logs: true,
		reloadSchema: true,
		finder: true,
		edit: true
	}
};

export { statusBtMap };
