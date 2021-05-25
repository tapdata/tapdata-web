import { Database } from '@/nodes/extends/Database'

export default class MySql extends Database {
  constructor() {
    super('MySQL', 'mysql', 'mysql')
  }
}
