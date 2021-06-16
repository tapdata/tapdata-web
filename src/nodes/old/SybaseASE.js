import { Database } from '@/nodes/extends/Database'

export default class SybaseASE extends Database {
  constructor() {
    super('Sybase ASE', 'sybase', 'sybase ase')
  }
}
