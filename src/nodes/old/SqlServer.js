import { Database } from '@/nodes/extends/Database'

export default class SqlServer extends Database {
  constructor() {
    super('SQL Server', 'sqlserver', 'sqlserver')
  }
}
