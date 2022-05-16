import PublicApi from './publicApi'
// import axios from '@/plugins/axios';
export default class InspectAPI extends PublicApi {
  constructor() {
    super('/api/InspectDetails')
  }
}
