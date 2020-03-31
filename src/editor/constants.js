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
		//fieldProcesses: []
	}
;
