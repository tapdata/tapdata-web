import PublicApi from './publicApi'
// import axios from 'axios';
export default class Metadata extends PublicApi {
  constructor() {
    super('/api/metadata')
  }
}
