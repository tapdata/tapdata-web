/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/2/3
 * @description
 */
export const SETTING_MODEL = {
	name: '',
	sync_type: 'initial_sync+cdc',
	distinctWriteType: 'intellect',
	stopOnError: true,
	needToCreateIndex: true,
	isOpenAutoDDL: true
};

export const DATASOURCE_MODEL = {
	source_sourceType: 'rds',
	target_sourceType: 'rds',
	source_region: '',
	target_region: '',
	source_zone: '',
	target_zone: '',
	source_connectionId: '',
	target_connectionId: '',
	source_connectionName: '',
	target_connectionName: ''
};

export const INSTANCE_MODEL = {
	region: '', //区域
	zone: '', //可用区,
	regionName: '', //区域
	zoneName: '' //可用区,
};
