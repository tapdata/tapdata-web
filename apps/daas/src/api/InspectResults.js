import PublicApi from './publicApi'
// import axios from 'axios';
export default class InspectResultsAPI extends PublicApi {
  constructor() {
    super('/api/InspectResults')
  }
}
