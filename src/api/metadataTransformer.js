import PublicApi from './publicApi'
// import axios from 'axios';
export default class MetadataTransformerAPI extends PublicApi {
  constructor() {
    super('/api/metadataTransformerItems')
  }
}
