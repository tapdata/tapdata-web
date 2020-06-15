/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/19/20
 * @description
 */
export const FORM_DATA_KEY = "form_data",
	SCHEMA_DATA_KEY = "schema",
	OUTPUT_SCHEMA_DATA_KEY = "outputSchema",
	DATA_FLOW_SETTING_DATA_KEY = "settingData",
	JOIN_TABLE_TPL = {
		tableName: "",
		joinType: "upsert",
		joinPath: "",
		joinKeys: [
			{
				source: "",
				target: ""
			}
		],
		primaryKeys: "",
		stageId: "",
		isArray: false,
		// fieldProcesses: [],
		arrayUniqueKey: ""
	},
	DEFAULT_SETTING = {
		sync_type: "initial_sync+cdc",
		readBatchSize: 1000,
		notificationWindow: 0,
		notificationInterval: 300,
		readCdcInterval: 500,
		description: "",
		drop_target: false,
		run_custom_sql: false,
		needToCreateIndex: false,
		increment: false,
		isSchedule: false,
		cronExpression: "",
		isOpenAutoDDL: false,
		emailWaring: {
			edited: false,
			started: false,
			error: false,
			paused: false
		},
		stopOnError:false,
		syncPoints:[{
			connectionId: "",
			type: "localTZ",        // localTZ: 本地时区； connTZ：连接时区
			time : "",
			date:"",
			timezone:"+08:00"     // 当type为localTZ时有该字段
		}],
		syncPoint: 'current',
		syncTime: '',
		syncDatePicker: '',
		syncTimePicker: '',
    processorConcurrency:1,
    transformerConcurrency:8
  }
;
