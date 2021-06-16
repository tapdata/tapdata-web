import { Database } from '@/nodes/extends/Database'

export default class Kafka extends Database {
  constructor() {
    super('Kafka', 'wKafka', 'kafka')
  }
}
