/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import axios from 'axios';
import PublicAPI from "./publicApi";

export default class ClusterAPI extends PublicAPI{

	constructor(){
		super('http://localhost:8080/api/clusterStates');
	}

	updateStatus(params){
		return axios.post(this.url + '/updataStatus', params);
  }

  addMonitor(params) {
    return axios.post(this.url + '/addMonitor', params);
  }

}
