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
		return axios.get(this.url + '/agent/region');
	}
	//实例相关地区列表
	getRegionZone() {
		return axios.get(this.url + '/agent/regionZone');
	}
}
