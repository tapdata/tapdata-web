import PublicApi from './publicApi'
// import axios from '@/plugins/axios';
export default class MetadataTransformerAPI extends PublicApi {
  constructor() {
    super('/api/metadataTransformerItems')
  }
}
