import { Database } from '@/nodes/extends/Database'

export default class MongoDB extends Database {
  constructor() {
    super('MongoDB', 'mongo', 'mongodb')
  }
}
