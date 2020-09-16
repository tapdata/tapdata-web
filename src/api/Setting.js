/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/18
 * @description
 */
import PublicAPI from './publicApi';

export default class notification extends PublicAPI {
	constructor() {
		super('/api/Settings');
	}
}
