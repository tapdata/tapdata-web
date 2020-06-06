/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/11/20
 * @description
 */
import PublicApi from "./publicApi";
export default class WorkerAPI extends PublicApi {
	constructor() {
		super("/api/Workers");
	}
	getAvailableAgent() {
		return this.get(["/availableAgent"]);
	}
}
