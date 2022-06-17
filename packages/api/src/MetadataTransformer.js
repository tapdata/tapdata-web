import Http from './Http'
import { isPlainObj } from '@tap/shared'
export default class MetadataTransformer extends Http {
  constructor() {
    super('/api/metadataTransformerItems')
  }

  get(params = {}, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      let qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
      return this.axios.get(this.url + '/' + params.join('/') + qs).then(this.useData)
    }
    const config = { params }
    if (isPlainObj(filter)) {
      Object.assign(config, filter)
    }
    return this.axios.get(this.url, config).then(this.useData)
  }
}
export { MetadataTransformer }
