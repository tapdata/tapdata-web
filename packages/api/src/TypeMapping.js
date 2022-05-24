import Http from './http'
export class TypeMapping extends Http {
  constructor() {
    super('/api/TypeMappings')
  }

  dataType(type) {
    return this.axios.get(this.url + '/dataType?databaseType=' + type)
  }
}
