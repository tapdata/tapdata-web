import PublicAPI from './publicApi';
import axios from 'axios';

export default class LineageGraphsAPI extends PublicAPI {
	constructor() {
		super('/api/LineageGraphs');
	}
	graphData(qualifiedName) {
		let url = `${this.url}/graphData?qualifiedName=` + qualifiedName;
		return axios.get(url);
	}
}
