/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from "./publicApi";
import axios from "axios";

export default class DataFlows extends PublicAPI{

	constructor(){
		super('/api/DataFlows');
	}

	copy(id) {
		return axios.post(`${this.url}/${id}/copy`);
	}

	reset(id) {
		return axios.post(`${this.url}/${id}/reset`);
	}
	patchId(id,params) {
		return axios.patch(`${this.url}/${id}`,params);
	}
	getId(id,params, filter) {
		if (Array.isArray(params)) {
			filter = typeof filter === 'object' ? JSON.stringify(filter) : filter;
			let qs = filter ? ('?filter=' + filter) : '';
			return axios.get(this.url + '/'+ id + params.join('/') + qs);
		}
		params = params || {};
		return axios.get(this.url+"/"+id, {params});
	}
	getSourceList(id){
		return axios.get(this.url+"/dataFlowTables?dataFlowId="+id);
	}
}
