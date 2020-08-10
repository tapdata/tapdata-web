/**
 * @author xzq
 * @date 7/15/20
 * @description
 */
let db2db = {
	data: {
		name: 'The new task is not named',
		description: '',
		status: 'draft',
		executeMode: 'normal',
		category: '数据库克隆',
		stopOnError: false,
		mappingTemplate: 'cluster-clone',
		emailWaring: { edited: true, started: false, error: true, paused: false },
		stages: [
			{
				id: '9a74f52e-9d98-4fa4-94f4-fac4210862d9',
				inputLanes: [],
				outputLanes: ['9ec112e9-f93e-4edc-bff1-330294016890'],
				distance: 1,
				connectionId: '',
				includeTables: [],
				dropTable: false,
				table_prefix: '',
				table_suffix: '',
				type: 'database',
				readCdcInterval: 500,
				readBatchSize: 1000
			},
			{
				id: '9ec112e9-f93e-4edc-bff1-330294016890',
				inputLanes: ['9a74f52e-9d98-4fa4-94f4-fac4210862d9'],
				outputLanes: [],
				distance: 0,
				connectionId: '',
				includeTables: [],
				dropTable: false,
				table_prefix: '',
				table_suffix: '',
				type: 'database',
				readCdcInterval: 500,
				readBatchSize: 1000
			}
		],
		setting: {
			sync_type: 'initial_sync+cdc',
			readBatchSize: 1000,
			notificationWindow: 0,
			notificationInterval: 300,
			readCdcInterval: 500,
			description: '',
			distinctWriteType: 'intellect',
			drop_target: false,
			run_custom_sql: false,
			needToCreateIndex: true,
			increment: false,
			isSchedule: false,
			cronExpression: '',
			isOpenAutoDDL: false,
			emailWaring: { edited: false, started: false, error: false, paused: false },
			stopOnError: false,
			syncPoints: [{ connectionId: '', type: 'current', time: '', date: '', name: '', timezone: '+08:00' }],
			processorConcurrency: 1,
			transformerConcurrency: 8
		},
		editorData:
			'{"cells":[{"type":"app.Database","form_data":{"connectionId":"","includeTables":[],"dropTable":false,"table_prefix":"","table_suffix":"","type":"database"},"freeTransform":false,"size":{"width":160,"height":36},"ports":{"groups":{"greens":{"attrs":{"circle":{"fill":"#f56c6c","stroke":"red","strokeWidth":1,"r":6}},"position":"absolute"}}},"schema":null,"outputSchema":null,"position":{"x":-370,"y":120},"angle":0,"id":"9a74f52e-9d98-4fa4-94f4-fac4210862d9","z":1,"attrs":{"body":{"stroke":"#ff0000"}}},{"type":"app.Database","form_data":{"connectionId":"","includeTables":[],"dropTable":false,"table_prefix":"","table_suffix":"","type":"database"},"freeTransform":false,"size":{"width":160,"height":36},"ports":{"groups":{"greens":{"attrs":{"circle":{"fill":"#f56c6c","stroke":"red","strokeWidth":1,"r":6}},"position":"absolute"}}},"schema":null,"outputSchema":{"meta_type":"table"},"position":{"x":-92,"y":120},"angle":0,"id":"9ec112e9-f93e-4edc-bff1-330294016890","z":2,"attrs":{"body":{"stroke":"#ff0000"}}},{"type":"app.Link","router":{"name":"manhattan"},"connector":{"name":"rounded"},"labels":[],"source":{"id":"9a74f52e-9d98-4fa4-94f4-fac4210862d9"},"target":{"id":"9ec112e9-f93e-4edc-bff1-330294016890"},"id":"802dbe9d-3d09-4a05-b749-1fafb2730998","z":3,"form_data":{"label":"","type":"link"},"attrs":{}}]}'
	}
};

export { db2db };
