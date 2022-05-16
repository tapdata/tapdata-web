/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/11/20
 * @description
 */
import PublicApi from './publicApi'
import axios from '@/plugins/axios'
export default class MetadataDefinitionsAPI extends PublicApi {
  constructor() {
    super('/api/MetadataDefinition')
  }
  changeById(params) {
    return axios.patch(`${this.url}/${params.id}`, params)
  }
}
