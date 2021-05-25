import { Database } from '@/nodes/extends/Database'

export default class Postgres extends Database {
  constructor() {
    super('Postgres', 'pg', 'postgres')
  }
}
