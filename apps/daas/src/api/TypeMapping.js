import PublicApi from './publicApi'
import axios from '@/plugins/axios'
// import axios from '@/plugins/axios';
export default class TypeMapping extends PublicApi {
  constructor() {
    super('/api/TypeMappings')
  }
  getId(type) {
    return axios.get(this.url + '/dataType?databaseType=' + type)
  }
  pdkDataType(type) {
    return axios.get(this.url + '/pdk/dataType?databaseType=' + type)
  }
}
