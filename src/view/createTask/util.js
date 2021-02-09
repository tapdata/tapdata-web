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
	s_connectionType: 'rds',
	t_connectionType: 'rds',
	s_region: '',
	t_region: '',
	s_zone: '',
	t_zone: '',
	s_connectionId: '',
	t_connectionId: ''
};

export const INSTANCE_MODEL = {
	region: '', //区域
	zone: '' //可用区
};
