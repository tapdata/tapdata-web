import { Database } from '@/nodes/extends/Database'

export default class Oracle extends Database {
  constructor() {
    super('Oracle', 'ora2', 'oracle')
  }
}
