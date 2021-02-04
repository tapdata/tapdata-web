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
	s_connectionId: '',
	t_connectionId: ''
};
