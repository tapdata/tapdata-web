import PublicAPI from './publicApi';
import axios from 'axios';

export default class LineageGraphsAPI extends PublicAPI {
	constructor() {
		super('/api/LineageGraphs');
	}
	graphData(qualifiedName, level, fields) {
		level = level || 'table';
		let url = '';
		if (level === 'table') {
			url = `${this.url}/graphData?qualifiedName=` + qualifiedName + '&level=' + level;
		} else {
			url =
				`${this.url}/graphData?qualifiedName=` +
				qualifiedName +
				'&level=' +
				level +
				fields
					.map(it => {
						return '&fields=' + it;
					})
					.join('');
		}
		return axios.get(url);
	}
	refreshGraphData() {
		let url = `${this.url}/refreshGraphData?`;
		return axios.get(url);
	}
}
