import Http from './Http'
export default class Inspect extends Http {
  constructor() {
    super('/api/Inspects')
  }
}
export { Inspect }
