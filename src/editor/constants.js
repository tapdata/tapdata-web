/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/19/20
 * @description
 */
export const
	FORM_DATA_KEY = 'form_data',
	SCHEMA_DATA_KEY= 'schema',
	OUTPUT_SCHEMA_DATA_KEY = 'outputSchema',
	DATA_FLOW_SETTING_DATA_KEY = 'settingData',
	JOIN_TABLE_TPL = {
		tableName: '',
		joinType: 'upsert',
		joinPath: '',
		joinKeys: [{
			source: '',
			target: ''
		}],
		primaryKeys: '',
		stageId: ''
		//fieldProcesses: []
	},

	DEFAULT_SETTING = {
		sync_type: 'initial_sync',
		readBatchSize:25000,
		notificationWindow:0,
		notificationInterval:300,
		readCdcInterval:500,
		description:'',
		drop_target:false,
		needToCreateIndex:false,
		increment:false,
		isSchedule:false,
		emailWaring: {
			edited: false,
			started: false,
			error: false,
			paused: false
		},
		stopOnError:false,
	}
;
