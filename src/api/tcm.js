/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from './publicApi';
import axios from 'axios';

export default class TCM extends PublicAPI {
	constructor() {
		super('/api/tcm');
	}
	//h获取可用区
	getRegion() {
		return axios.get(this.url + '/region');
	}
	//h获取可用区
	productVip(params) {
		return axios.get(this.url + '/product/vip', { params });
	}
	//实例相关地区列表
	getRegionZone() {
		return axios.get(this.url + '/agent/regionZone');
	}
	//vpc列表
	getVpcList(id) {
		return axios.get(this.url + '/vpc/list/' + id);
	}
	//创建网络策略
	strategy(params) {
		return axios.post(this.url + '/strategy', params);
	}
}
