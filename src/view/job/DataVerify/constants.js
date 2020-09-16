/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/10
 * @description
 */
export const DEFAULT_DATAVERIFY = {
	condition: {
		type: 'rows', // # rows：按行数参与校验，sampleRate：按采样率参与校验
		// # type为rows时表示行数；type为sampleRate时，表示采样率，如：
		value: '1000'
	},
	source: {
		connectionId: '',
		databaseType: '',
		stageId: '',
		tableName: '',
		filter: '',
		checkedSource: false,
		id: ''
	},
	target: {
		connectionId: '',
		databaseType: '',
		stageId: '',
		tableName: '',
		filter: '',
		checkedTarget: false,
		id: ''
	},
	validateCode: 'function validate(sourceRow){}',
	type: 'advance' // row: 行数 hash：哈希  advance：高级校验
};
