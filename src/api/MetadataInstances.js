/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/11/20
 * @description
 */
import PublicApi from "./publicApi";
import axios from "axios";
export default class MetadataInstancesAPI extends PublicApi {
  constructor() {
    super("/api/MetadataInstances");
  }
  classification(params) {
    return axios.patch(this.url + "/classifications", params);
  }
  download(where) {
    if (typeof where === "object") where = JSON.stringify(where);
    window.open(this.url + "/download?where=" + where);
    // return axios.get(this.url + '/download?where=' + where);
  }
}
