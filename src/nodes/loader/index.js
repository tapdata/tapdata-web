const nodeContext = require.context('@/nodes/', false, /\.js$/)
const comContext = require.context('@/nodes/components', false, /\.vue$/)

const requireAllNode = requireContext => {
  return requireContext.keys().reduce((map, name) => {
    let Module = requireContext(name)
    Object.keys(Module).forEach(key => (map[key] = Module[key]))
    return map
  }, {})
}

const requireAllCom = requireContext => {
  return requireContext.keys().reduce((obj, name) => {
    const com = requireContext(name).default
    obj[com.name] = com
    return obj
  }, {})
}

export const ctorTypes = requireAllNode(nodeContext)

export const nodeComs = requireAllCom(comContext)

export const nodeTypes = [
  {
    name: 'DB2',
    icon: 'db2',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'db2' }
  },
  {
    name: 'GBase 8s',
    icon: 'gbase',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'gbase-8s' }
  },
  {
    name: 'Kafka',
    icon: 'wKafka',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'kafka' }
  },
  {
    name: 'MariaDB',
    icon: 'maria',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'mariadb' }
  },
  {
    name: 'MongoDB',
    icon: 'mongo',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'mongodb' }
  },
  {
    name: 'MySQL',
    icon: 'mysql',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'mysql' }
  },
  {
    name: 'Mysql PXC',
    icon: 'mysqlpxc',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'mysql pxc' }
  },
  {
    name: 'Oracle',
    icon: 'ora2',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'oracle' }
  },
  {
    name: 'Postgres',
    icon: 'pg',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'postgres' }
  },
  {
    name: 'SQL Server',
    icon: 'sqlserver',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'sqlserver' }
  },
  {
    name: 'Sybase ASE',
    icon: 'sybase',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'sybase ase' }
  }
]
