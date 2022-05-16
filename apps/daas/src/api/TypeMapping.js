import PublicApi from './publicApi'
import axios from '@/plugins/axios'
// import axios from '@/plugins/axios';
export default class TypeMapping extends PublicApi {
  constructor() {
    super('/api/TypeMappings/dataType')
  }
  getId(type) {
    return axios.get(this.url + '?databaseType=' + type)
  }
}
