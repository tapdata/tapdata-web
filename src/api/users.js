/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi';
import axios from 'axios';

export default class DataFlows extends PublicAPI {
	constructor() {
		super('/api/users');
	}
	login(params) {
		return axios.post(this.url + '/login', params);
	}
	post(params) {
		return axios.post(this.url, params);
	}
	getUserById(params) {
		return axios.get(this.url + params);
	}
	getPermissions(params) {
		return axios.get(this.url + params);
	}
	resetPassword(params) {
		return axios.post(this.url + '/reset-password', params);
	}
	checktoken() {
		return axios.get(this.url + '/checktoken');
	}
	reset(params) {
		return axios.post(this.url + '/reset', params);
	}

	newResetPassword() {
		return axios.post(this.url + '/newResetPassword');
	}
}
