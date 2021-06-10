let directionMap = {
	unidirectional: '单向同步',
	bidirectional: '双向同步'
}
let topologyMap = {}
for (const dKey in directionMap) {
	let dValue = directionMap[dKey]
	topologyMap[dKey] = `${dValue}`
}
export const TOPOLOGY_MAP = topologyMap,
	INSTANCE_STATUS_MAP = {
		// Approving: { text: '创建中', icon: 'loading', type: 'info' },
		Creating: { text: '创建中', icon: 'loading', type: 'info' },
		Running: { text: '运行中', icon: 'running', type: 'success' },
		Stopping: { text: '停止中', icon: 'loading', type: 'info' },
		Stopped: { text: '已停止', icon: 'warning', type: 'info' },
		Error: { text: '异常', icon: 'warning', type: 'warning' },
		Freezing: { text: '冻结中', icon: 'loading', type: 'info' },
		Freeze: { text: '已冻结', icon: 'warning', type: 'info' },
		// Deleting: { text: '退订中', icon: 'loading', type: 'info' },
		Restarting: { text: '重启中', icon: 'loading', type: 'info' },
		Recovering: { text: '恢复中', icon: 'loading', type: 'info' },
		FreezeRecovering: { text: '恢复中', icon: 'loading', type: 'info' },
		Altering: { text: '规格变更中', icon: 'loading', type: 'info' },
		WaitingAlter: { text: '规格变更中', icon: 'loading', type: 'info' },
		Offline: { text: '离线', icon: 'warning', type: 'info' }
		// WaitingDelete: { text: '退订中', icon: 'loading', type: 'info' }
	},
	TASK_STATUS_MAP = {
		running: { text: '运行中', icon: 'running' },
		paused: { text: '待启动', icon: 'waiting' },
		error: { text: '错误', icon: 'warning' },
		draft: { text: '待启动', icon: 'waiting' },
		scheduled: { text: '启动中', icon: 'loading' },
		stopping: { text: '停止中', icon: 'loading' },
		'force stopping': { text: '强制停止中', icon: 'loading' }
	},
	SPEC_MAP = {
		micro: '小规格',
		small: '标准规格',
		medium: '中规格',
		large: '大规格'
	},
	CHARGE_MAP = {
		'1,month': '包月计费',
		'2,1': '按量计费'
	}
