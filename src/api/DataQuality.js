import axios from 'axios';
import PublicAPI from './publicApi';

export default class DataQualityAPI extends PublicAPI {
	constructor() {
		super('/api/DataCatalogs');
	}

	getList(params) {
		return axios.get(this.url + '/getList', { params: params });
	}
}
