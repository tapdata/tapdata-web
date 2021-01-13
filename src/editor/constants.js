/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/19/20
 * @description
 */
export const FORM_DATA_KEY = 'form_data',
	SCHEMA_DATA_KEY = 'schema',
	OUTPUT_SCHEMA_DATA_KEY = 'outputSchema',
	DATA_FLOW_SETTING_DATA_KEY = 'settingData',
	JOIN_TABLE_TPL = {
		tableName: '',
		joinType: 'upsert',
		joinPath: '',
		manyOneUpsert: false,
		joinKeys: [
			{
				source: '',
				target: ''
			}
		],
		// primaryKeys: '',
		stageId: '',
		isArray: false,
		// fieldProcesses: [],
		arrayUniqueKey: ''
	},
	DEFAULT_SETTING = {
		isSerialMode: false,
		sync_type: 'initial_sync+cdc',
		readBatchSize: 1000,
		notificationWindow: 0,
		notificationInterval: 300,
		readCdcInterval: 500,
		maxTransactionLength: 12,
		description: '',
		cdcFetchSize: 1,
		distinctWriteType: 'intellect',
		drop_target: false,
		run_custom_sql: false,
		needToCreateIndex: true,
		increment: false,
		isSchedule: false,
		cronExpression: '',
		isOpenAutoDDL: false,
		emailWaring: {
			edited: false,
			started: false,
			error: false,
			paused: false
		},
		stopOnError: false,
		syncPoints: [
			{
				connectionId: '',
				type: 'current', // localTZ: 本地时区； connTZ：连接时区
				time: '',
				date: '',
				name: '',
				timezone: '+08:00' // 当type为localTZ时有该字段
			}
		],
		processorConcurrency: 1,
		transformerConcurrency: 8
	},
	DATABASE_TYPE_MAPPING = {
		mysql: {
			name: 'MySQL',
			type: 'mysql',
			shapeImage: 'static/editor/o-mysql.svg',
			stencilImage: 'static/editor/mysql.svg'
		},
		oracle: {
			type: 'oracle',
			name: 'Oracle',
			shapeImage: 'static/editor/o-ora.svg',
			stencilImage: 'static/editor/ora2.svg'
		},
		mongodb: {
			type: 'mongodb',
			name: 'MongoDB',
			shapeImage: 'static/editor/o-mongo.svg',
			stencilImage: 'static/editor/mongo.svg'
		},
		db2: {
			type: 'db2',
			name: 'DB2',
			shapeImage: 'static/editor/o-db2.svg',
			stencilImage: 'static/editor/DB2.svg'
		},
		postgres: {
			type: 'postgres',
			name: 'Postgres',
			shapeImage: 'static/editor/o-pg.svg',
			stencilImage: 'static/editor/pg.svg'
		},
		sqlserver: {
			type: 'sqlserver',
			name: 'SQL Server',
			shapeImage: 'static/editor/o-sqlserver.svg',
			stencilImage: 'static/editor/sqlserver.svg'
		},
		'gbase-8s': {
			type: 'gbase-8s',
			name: 'GBase 8s',
			shapeImage: 'static/editor/o-gbase.svg',
			stencilImage: 'static/editor/gbase.svg'
		},
		'sybase ase': {
			type: 'sybase ase',
			name: 'Sybase ASE',
			shapeImage: 'static/editor/o-sybase.svg',
			stencilImage: 'static/editor/sybase.svg'
		}
	},
	FILE_TYPE_MAPPING = {
		xml: {
			type: 'xml',
			name: 'XML',
			shapeImage: 'static/editor/xml.svg',
			stencilImage: 'static/editor/xml.svg'
		},
		excel: {
			type: 'excel',
			name: 'EXCEL',
			shapeImage: 'static/editor/excel.svg',
			stencilImage: 'static/editor/excel.svg'
		},
		csv: {
			type: 'csv',
			name: 'CSV',
			shapeImage: 'static/editor/csv.svg',
			stencilImage: 'static/editor/csv.svg'
		},
		json: {
			type: 'json',
			name: 'JSON',
			shapeImage: 'static/editor/json.svg',
			stencilImage: 'static/editor/json.svg'
		}
	};
