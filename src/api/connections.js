/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import axios from 'axios';
import PublicAPI from './publicApi';

export default class Connections extends PublicAPI {
	constructor() {
		super('/api/Connections');
	}
	customQuery(id, params) {
		let url = `${this.url}/${id}` + '/customQuery?';
		for (let item in params) {
			url += item + '=' + params[item] + '&';
		}
		return axios.get(url);
	}
}
