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
	s_connection: 'rds',
	t_connection: 'rds',
	s_region: 'region1',
	t_region: 'region1',
	s_instance: 'zone1',
	t_instance: 'zone1',
	s_connectionId: '',
	t_connectionId: ''
};

export const INSTANCE_MODEL = {
	instance: 'a',
	region: 'region1'
};
