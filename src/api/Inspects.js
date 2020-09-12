import PublicApi from './publicApi';
// import axios from 'axios';
export default class InspectAPI extends PublicApi {
	constructor() {
		super('/api/Inspects');
	}
}
