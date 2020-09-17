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
				id: 'dbafb160-4793-4bd5-aba3-188eb049ecfa',
				inputLanes: [],
				outputLanes: ['34455d62-177d-4410-a115-9d053a84ec80'],
				distance: 1,
				connectionId: '',
				includeTables: [],
				dropTable: false,
				type: 'database',
				readCdcInterval: 500,
				readBatchSize: 1000
			},
			{
				id: '34455d62-177d-4410-a115-9d053a84ec80',
				inputLanes: ['dbafb160-4793-4bd5-aba3-188eb049ecfa'],
				outputLanes: [],
				distance: 0,
				connectionId: '',
				includeTables: [],
				dropTable: false,
				type: 'database',
				dropType: 'no_drop',
				table_prefix: '',
				table_suffix: '',
				syncObjects: [{ type: 'table', objectNames: [] }],
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
			maxTransactionLength: 12,
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
			'{"cells":[{"type":"app.Database","form_data":{"connectionId":"","includeTables":[],"dropTable":false,"type":"database"},"freeTransform":false,"size":{"width":160,"height":36},"ports":{"groups":{"greens":{"attrs":{"circle":{"fill":"#f56c6c","stroke":"red","strokeWidth":1,"r":6}},"position":"absolute"}}},"schema":null,"outputSchema":null,"position":{"x":-370,"y":120},"angle":0,"id":"dbafb160-4793-4bd5-aba3-188eb049ecfa","z":1,"attrs":{"body":{"stroke":"#ff0000"}}},{"type":"app.Database","form_data":{"connectionId":"","includeTables":[],"dropTable":false,"type":"database","dropType":"no_drop","table_prefix":"","table_suffix":"","syncObjects":[{"type":"table","objectNames":[]}]},"freeTransform":false,"size":{"width":160,"height":36},"ports":{"groups":{"greens":{"attrs":{"circle":{"fill":"#f56c6c","stroke":"red","strokeWidth":1,"r":6}},"position":"absolute"}}},"schema":null,"outputSchema":{"meta_type":"table"},"position":{"x":-92,"y":120},"angle":0,"id":"34455d62-177d-4410-a115-9d053a84ec80","z":2,"attrs":{"body":{"stroke":"#ff0000"}}},{"type":"app.databaseLink","router":{"name":"manhattan"},"connector":{"name":"rounded"},"labels":[],"source":{"id":"dbafb160-4793-4bd5-aba3-188eb049ecfa"},"target":{"id":"34455d62-177d-4410-a115-9d053a84ec80"},"id":"2219b10a-6958-47bb-9a63-77712d75c476","z":3,"form_data":{"table_prefix":"","table_suffix":"","dropType":"no_drop","type":"databaseLink","selectSourceArr":[],"selectSourceDatabase":{"table":true,"view":false,"function":false,"procedure":false},"joinTable":{"tableName":"","joinType":"upsert","joinPath":"","manyOneUpsert":false,"joinKeys":[{"source":"","target":""}],"stageId":"dbafb160-4793-4bd5-aba3-188eb049ecfa","isArray":false,"arrayUniqueKey":""}},"attrs":{}}]}'
	}
};

export { db2db };
