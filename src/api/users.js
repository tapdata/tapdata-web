/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi';
import axios from 'axios';

export default class users extends PublicAPI {
	constructor() {
		super('/api/users');
	}
	login(params) {
		return axios.post(this.url + '/login', params);
	}
	getUserById(params) {
		return axios.get(this.url + params);
	}
	getPermissions(params) {
		return axios.get(this.url + params);
	}

	reset(params) {
		return axios.post(this.url + '/reset', params);
	}

	changePassword(params) {
		return axios.post(this.url + '/change-password', params);
	}

	patch(params) {
		return axios.patch(`${this.url}/${params.id}`, params);
	}
}
