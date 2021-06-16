import { Database } from '@/nodes/extends/Database'

export default class MySqlPXC extends Database {
  constructor() {
    super('Mysql PXC', 'mysqlpxc', 'mysql pxc')
  }
}
