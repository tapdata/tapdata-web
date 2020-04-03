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
}
