import PublicApi from './publicApi'
// import axios from 'axios';
export default class TypeMapping extends PublicApi {
  constructor() {
    super('/api/typeMappings/dataType')
  }
}
