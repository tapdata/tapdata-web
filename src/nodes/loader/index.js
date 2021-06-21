const nodeContext = require.context('@/nodes/', false, /\.js$/)

const requireAllNode = requireContext => {
  return requireContext.keys().reduce((map, name) => {
    let Module = requireContext(name)
    Object.keys(Module).forEach(key => (map[key] = Module[key]))
    return map
  }, {})
}

export const ctorTypes = requireAllNode(nodeContext)

let _nodeTypes = localStorage['store.nodeTypes']

export const nodeTypes = [
  {
    name: 'DB2',
    icon: 'db2',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: {
      databaseType: 'db2'
      /*formSchema: {
        type: 'object',
        properties: {
          password: {
            title: '银行卡密码',
            type: 'string',
            'x-decorator': 'ElFormItem',
            'x-component': 'Input'
          },
          datasource: {
            title: '数据库123',
            type: 'void',
            'x-decorator': 'ElFormItem',
            'x-decorator-props': {
              asterisk: true
            },
            'x-component': 'Row',
            'x-component-props': {
              type: 'flex',
              gap: '8px'
            },
            properties: {
              connectionId: {
                type: 'string',
                required: true,
                'x-decorator': 'Col',
                'x-decorator-props': { flex: 1 },
                'x-component': 'ComboSelect',
                'x-component-props': {
                  config: { placeholder: '请选择数据库' }
                },
                'x-reactions': ['{{useAsyncDataSource(loadDatabase)}}']
              },
              connectionBtn: {
                type: 'void',
                'x-component': 'AddDatabaseBtn'
              }
            }
          },
          name: {
            type: 'string',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['connectionId'],
              fulfill: {
                run: '{{$self.value = $form.query("connectionId").get("dataSource")?.find(item=>item.id===$deps[0])?.name}}'
              }
            }
          },
          datasourceInfo: {
            type: 'string',
            'x-component': 'DatabaseInfo',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo)}}']
          }
        }
      }*/
    }
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
  },
  {
    name: '表',
    icon: 'table',
    group: 'data',
    type: 'table',
    constructor: 'Table'
  }
].concat(
  _nodeTypes
    ? JSON.parse(_nodeTypes).map(item => {
        if (item.attr.formSchema) {
          item.attr.formSchema = JSON.parse(item.attr.formSchema)
        }
        if (item.attr.linkFormSchema) {
          item.attr.linkFormSchema = JSON.parse(item.attr.linkFormSchema)
        }
        return item
      })
    : []
)
