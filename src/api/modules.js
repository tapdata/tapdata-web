/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi';
import axios from 'axios';

export default class Modules extends PublicAPI {
	constructor() {
		super('/api/Modules');
	}

	getApiDocument(id) {
		return axios.get(this.url + '/getApiDocument?id=' + id);
	}
}
