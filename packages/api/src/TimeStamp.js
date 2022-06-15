import Http from './http'

export default class TimeStamp extends Http {
  constructor() {
    super('/api/timeStamp')
  }
}
export { TimeStamp }
