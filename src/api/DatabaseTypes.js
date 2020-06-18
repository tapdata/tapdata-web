import PublicAPI from './publicApi';

export default class extends PublicAPI {
	constructor() {
		super('/api/DatabaseTypes');
	}
}
