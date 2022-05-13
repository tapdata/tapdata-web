import PublicApi from './publicApi'
// import axios from '@/plugins/axios';
export default class InspectResultsAPI extends PublicApi {
  constructor() {
    super('/api/InspectResults')
  }
}
