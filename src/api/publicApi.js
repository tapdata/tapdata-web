import axios from 'axios';

export default class PublicAPI {

	constructor(url) {
		this.url = url;
	}

	count(params) {
		return axios.get(this.url + '/count', {params});
	}

	patch(params) {
		return axios.patch(this.url, params);
	}

	get(params) {
		if (Array.isArray(params)) {
			return axios.get(this.url + '/' + params.join('/'));
		}
		params = params || {};
		return axios.get(this.url, {params});
	}

	delete(id) {
		return axios.delete(`${this.url}/${id}`);
	}

	post(params) {
		return axios.post(this.url, params);
	}

	findOne(params) {
		params = params || {};
		return axios.get(this.url + '/findOne', {params});
	}
}
