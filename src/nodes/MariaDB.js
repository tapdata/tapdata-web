import { Database } from '@/nodes/extends/Database'

export default class MariaDB extends Database {
  constructor() {
    super('MariaDB', 'maria', 'mariadb')
  }
}
