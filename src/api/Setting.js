/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/8/18
 * @description
 */
import PublicAPI from './publicApi';
import axios from 'axios';

export default class Settings extends PublicAPI {
	constructor() {
		super('/api/Settings');
	}

	getRegistryPolicy() {
		return axios.get(`${this.url}/getRegistryPolicy`);
	}
}
