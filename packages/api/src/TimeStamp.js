import Http from './Http'

export default class TimeStamp extends Http {
  constructor() {
    super('/api/timeStamp')
  }
}
export { TimeStamp }
