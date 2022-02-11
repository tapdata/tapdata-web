import PublicAPI from './publicApi'
// import axios from 'axios'

export default class Metrics extends PublicAPI {
  constructor() {
    super('/api/Metrics')
  }
}
