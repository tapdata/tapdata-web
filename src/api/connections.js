/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import PublicAPI from "./publicApi";

export default class Connections extends PublicAPI {
  constructor() {
    super("/api/Connections");
  }
}
