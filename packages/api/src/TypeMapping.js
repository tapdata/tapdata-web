import Http from './Http'
export default class TypeMapping extends Http {
  constructor() {
    super('/api/TypeMappings')
  }

  dataType(type) {
    return this.axios.get(this.url + '/dataType?databaseType=' + type)
  }
  pdkDataType(type) {
    return this.axios.get(this.url + '/pdk/dataType?databaseType=' + type)
  }
}
export { TypeMapping }
