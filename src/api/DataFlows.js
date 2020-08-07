/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi';
import axios from 'axios';

export default class DataFlows extends PublicAPI {
	constructor() {
		super('/api/DataFlows');
	}

	chart() {
		return axios.get(this.url + '/chart');
	}

	draft(params) {
		return axios.patch(this.url + '/draft', params);
	}

	copy(id) {
		return axios.post(`${this.url}/${id}/copy`);
	}

	reset(id) {
		return axios.post(`${this.url}/${id}/reset`);
	}
	patchId(id, params) {
		return axios.patch(`${this.url}/${id}`, params);
	}

	patchAll(params) {
		return axios.patch(`${this.url}/updateBatch`, params);
	}

	getId(id, params, filter) {
		if (Array.isArray(params)) {
			filter = typeof filter === 'object' ? JSON.stringify(filter) : filter;
			let qs = filter ? '?filter=' + filter : '';
			return axios.get(this.url + '/' + id + params.join('/') + qs);
		}
		params = params || {};
		return axios.get(this.url + '/' + id, { params });
	}
	getSourceList(id, type, connId) {
		return axios.get(`${this.url}/dataFlowTables?dataFlowId=${id}&type=${type}&connId=${connId}`);
	}
	deleteAll(where) {
		if (typeof where === 'object') where = JSON.stringify(where);
		return axios.post(this.url + '/removeAll?where=' + where);
	}
	resetAll(where) {
		if (typeof where === 'object') where = JSON.stringify(where);
		return axios.post(this.url + '/resetAll?id=' + where);
	}

	saveStage(stages) {
		return axios.post(`${this.url}/stages`, stages);
	}

	relatedDataFlows(params) {
		return axios.get(this.url + '/relatedDataFlows', { params });
	}
}
