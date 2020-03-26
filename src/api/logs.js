/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/27/20
 * @description
 */
import PublicAPI from "./publicApi";

export default class LogsAPI extends PublicAPI{

	constructor(){
		super('http://132.232.60.65:3030/api/Logs');
	}
}
