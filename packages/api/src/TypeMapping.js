import PublicApi from './publicApi'
import axios from 'axios'
// import axios from 'axios';
export default class TypeMapping extends PublicApi {
  constructor() {
    super('/api/TypeMappings')
  }

  dataType(type) {
    return axios.get(this.url + '/dataType?databaseType=' + type)
  }
}
