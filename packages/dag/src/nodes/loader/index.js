import { AllLocales } from '../locales'
const nodeContext = require.context('../', false, /\.js$/)

const requireAllNode = requireContext => {
  return requireContext.keys().reduce((map, name) => {
    let Module = requireContext(name)
    Object.keys(Module).forEach(key => (map[key] = Module[key]))
    return map
  }, {})
}

const requireAllIns = requireContext => {
  return requireContext.keys().map(name => {
    let Module = requireContext(name)
    return new Module[Object.keys(Module)[0]]()
  }, {})
}

export const ctorTypes = requireAllNode(nodeContext)

export const allResourceIns = requireAllIns(nodeContext)

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
    }
  },
  {
    name: 'DM DB',
    icon: 'dameng',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: {
      databaseType: 'dameng'
    }
  },
  {
    name: 'Elasticsearch',
    icon: 'elasticsearch',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: {
      databaseType: 'elasticsearch'
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
    name: 'HBase',
    icon: 'hbase',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'hbase' }
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
    name: 'kudu',
    icon: 'kudu',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'kudu' }
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
    name: 'MQ',
    icon: 'mq',
    group: 'data',
    type: 'database',
    constructor: 'Database',
    attr: { databaseType: 'mq' }
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
    constructor: 'Table',
    locales: AllLocales.Table
  },
  {
    name: '数据集',
    icon: 'collection',
    group: 'data',
    type: 'collection',
    constructor: 'Common',
    attr: {
      formSchema: {
        type: 'object',
        properties: {
          datasource: {
            title: '数据库',
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
                'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["mongodb"])}}']
              },
              databaseType: {
                type: 'string',
                default: 'mongodb',
                'x-display': 'hidden'
              },
              connectionBtn: {
                type: 'void',
                'x-component': 'AddDatabaseBtn'
              }
            }
          },
          tableRow: {
            title: '数据集',
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
              tableName: {
                type: 'string',
                required: true,
                'x-decorator': 'Col',
                'x-decorator-props': { flex: 1 },
                'x-component': 'Select',
                'x-component-props': {
                  placeholder: '请选择数据集',
                  clearable: true,
                  filterable: true,
                  itemLabel: 'table_name',
                  itemValue: 'table_name'
                },
                'x-reactions': ['{{useAsyncDataSource(loadCollections)}}']
              },
              table: {
                type: 'object',
                'x-display': 'hidden',
                'x-reactions': {
                  dependencies: ['tableName'],
                  fulfill: {
                    state: {
                      value: '{{$form.query("tableName").get("dataSource")?.find(item=>item.table_name===$deps[0])}}'
                    }
                  }
                }
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
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$deps[0] || $self.value}}'
                }
              }
            }
          },
          fieldFilterType: {
            type: 'string',
            title: '字段过滤',
            required: true,
            default: 'keepAllFields',
            enum: [
              {
                label: '全部字段',
                value: 'keepAllFields'
              },
              {
                label: '保留字段',
                value: 'retainedField'
              },
              {
                label: '删除字段',
                value: 'deleteField'
              }
            ],
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': {
              target: 'fieldFilter',
              fulfill: {
                state: {
                  visible: '{{$self.value !== "keepAllFields"}}'
                }
              }
            }
          },
          fieldFilter: {
            type: 'array',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              size: 'mini',
              multiple: true,
              filterable: true,
              defaultFirstOption: true
            },
            'x-reactions': {
              dependencies: ['table'],
              fulfill: {
                state: {
                  dataSource: '{{$deps[0] && $deps[0].fields ? $deps[0].fields.map(item => item.field_name) : []}}'
                }
              }
            }
            // 'x-reactions': ['{{useAsyncDataSource(loadTableField)}}']
          },
          switchSpace: {
            type: 'void',
            title: '启用自定义初始化顺序',
            properties: {
              enableInitialOrder: {
                type: 'boolean',
                required: true,
                'x-component': 'Switch',
                'x-component-props': {},
                'x-reactions': {
                  target: 'initialSyncOrder',
                  fulfill: {
                    state: {
                      visible: '{{!!$self.value}}'
                    }
                  }
                }
              },

              initialSyncOrder: {
                type: 'number',
                required: true,
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  size: 'mini'
                }
              }
            },
            'x-decorator': 'ElFormItem',
            'x-decorator-props': {
              asterisk: true
            },
            'x-component': 'Space',
            'x-component-props': {
              size: 'middle'
            }
          },
          isFilter: {
            type: 'boolean',
            title: '过滤设置',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Switch',
            'x-reactions': {
              target: 'custSql',
              fulfill: {
                state: {
                  visible: '{{!!$self.value}}'
                }
              }
            }
          },
          custSql: {
            type: 'object',
            'x-component': 'FormTab',
            'x-component-props': {},
            properties: {
              tab1: {
                type: 'void',
                'x-component': 'FormTabPane',
                'x-component-props': {
                  tab: '智能模式'
                },
                properties: {
                  conditions: {
                    type: 'array',
                    'x-component': 'FilterConditions',
                    'x-component-props': {},
                    'x-reactions': {
                      dependencies: ['fieldFilter'],
                      fulfill: {
                        run: '{{$self.dataSource = $form.query("fieldFilter").get("dataSource")}}'
                      }
                    }
                  },
                  previewSql: {
                    type: 'string',
                    'x-component': 'PreviewSql',
                    'x-component-props': {}
                  }
                }
              },
              tab2: {
                type: 'void',
                'x-component': 'FormTabPane',
                'x-component-props': {
                  tab: 'MQL模式'
                },
                properties: {
                  editSql: {
                    type: 'string',
                    'x-decorator': 'ElFormItem',
                    'x-component': 'SqlEditor',
                    'x-component-props': {
                      options: { showPrintMargin: false, useWrapMode: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      linkFormSchema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            default: 'no_drop',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{loadDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
          }
        }
      }
    }
  },
  {
    name: 'Redis',
    icon: 'redis',
    group: 'data',
    type: 'redis',
    constructor: 'Common',
    attr: {
      formSchema: {
        type: 'object',
        properties: {
          connectionId: {
            title: '选择Redis',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择Redis'
            },
            'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["redis"])}}']
          },
          name: {
            type: 'string',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['connectionId'],
              fulfill: {
                run: '{{$self.value = $form.query("connectionId").get("dataSource")?.find(item=>item.value===$deps[0])?.label || $self.value}}'
              }
            }
          },
          redisKey: {
            title: '设置缓存键',
            type: 'array',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择或输入缓存键',
              allowCreate: true,
              multiple: true,
              filterable: true
            }
          },
          redisKeyPrefix: {
            title: '缓存键前缀',
            type: 'string',
            'x-decorator': 'ElFormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: '请输入缓存键前缀'
            }
          }
        }
      },
      linkFormSchema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            default: 'no_drop',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{loadDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
          }
        }
      }
    }
  },
  {
    name: 'GridFS',
    icon: 'gridfs2',
    group: 'data',
    type: 'gridfs',
    constructor: 'Common',
    attr: {
      formSchema: {
        type: 'object',
        properties: {
          connectionId: {
            title: '选择GridFS',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择GridFS'
            },
            'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["gridfs"])}}']
          },
          tableName: {
            title: '请选择数据集',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择数据集',
              clearable: true,
              filterable: true,
              itemLabel: 'table_name',
              itemValue: 'table_name'
            },
            'x-reactions': ['{{useAsyncDataSource(loadCollections)}}']
          },
          table: {
            type: 'object',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$form.query("tableName").get("dataSource")?.find(item=>item.table_name===$deps[0])}}'
                }
              }
            }
          },
          name: {
            type: 'string',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$deps[0] || $self.value}}'
                }
              }
            }
          },
          databaseType: {
            type: 'string',
            default: 'gridfs',
            'x-display': 'hidden'
          }
        }
      },
      linkFormSchema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            default: 'no_drop',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{loadDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
          }
        }
      }
    }
  },
  {
    name: 'Dummy',
    icon: 'dummy',
    group: 'data',
    type: 'dummy db',
    constructor: 'Common',
    attr: {
      formSchema: {
        type: 'object',
        properties: {
          connectionId: {
            title: '选择Dummy',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择Dummy'
            },
            'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["dummy db"])}}']
          },
          tableName: {
            title: '请选择数据集',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择数据集',
              clearable: true,
              filterable: true,
              itemLabel: 'table_name',
              itemValue: 'table_name'
            },
            'x-reactions': ['{{useAsyncDataSource(loadCollections)}}']
          },
          table: {
            type: 'object',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$form.query("tableName").get("dataSource")?.find(item=>item.table_name===$deps[0])}}'
                }
              }
            }
          },
          name: {
            type: 'string',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$deps[0] || $self.value}}'
                }
              }
            }
          },
          databaseType: {
            type: 'string',
            default: 'dummy db',
            'x-display': 'hidden'
          }
        }
      },
      linkFormSchema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            default: 'no_drop',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{loadDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
          }
        }
      }
    }
  },
  {
    name: 'API',
    icon: 'API-target1',
    group: 'data',
    type: 'rest api',
    constructor: 'Common',
    attr: {
      formSchema: {
        type: 'object',
        properties: {
          connectionId: {
            title: '选择API',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择API'
            },
            'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["rest api"])}}']
          },
          tableName: {
            title: '请选择数据集',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择数据集',
              clearable: true,
              filterable: true,
              itemLabel: 'table_name',
              itemValue: 'table_name'
            },
            'x-reactions': ['{{useAsyncDataSource(loadCollections)}}']
          },
          table: {
            type: 'object',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$form.query("tableName").get("dataSource")?.find(item=>item.table_name===$deps[0])}}'
                }
              }
            }
          },
          name: {
            type: 'string',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$deps[0] || $self.value}}'
                }
              }
            }
          },
          databaseType: {
            type: 'string',
            default: 'rest api',
            'x-display': 'hidden'
          }
        }
      },
      linkFormSchema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            default: 'no_drop',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{loadDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
          }
        }
      }
    }
  },
  {
    name: 'ES',
    icon: 'elasticsearch',
    group: 'data',
    type: 'elasticsearch',
    constructor: 'Common',
    attr: {
      formSchema: {
        type: 'object',
        properties: {
          connectionId: {
            title: '配置Elastic search',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择Elastic search'
            },
            'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["elasticsearch"])}}']
          },
          name: {
            type: 'string',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['connectionId'],
              fulfill: {
                state: {
                  value: '{{$form.query("connectionId").get("dataSource")?.find(item=>item.id===$deps[0])?.name}}'
                }
              }
            }
          },
          databaseType: {
            type: 'string',
            default: 'elasticsearch',
            'x-display': 'hidden'
          }
        }
      },
      linkFormSchema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            default: 'no_drop',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{loadDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
          }
        }
      }
    }
  },
  {
    name: 'Custom',
    icon: 'custom',
    group: 'data',
    type: 'custom_connection',
    constructor: 'Common',
    attr: {
      formSchema: {
        type: 'object',
        properties: {
          connectionId: {
            title: '选择Custom',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择Custom'
            },
            'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["custom_connection"])}}']
          },
          tableName: {
            title: '表',
            type: 'string',
            required: true,
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择表，区分大小写',
              clearable: true,
              filterable: true,
              itemLabel: 'table_name',
              itemValue: 'table_name'
            },
            'x-reactions': ['{{useAsyncDataSource(loadCollections)}}']
          },
          table: {
            type: 'object',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$form.query("tableName").get("dataSource")?.find(item=>item.table_name===$deps[0])}}'
                }
              }
            }
          },
          name: {
            type: 'string',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['connectionId'],
              fulfill: {
                state: {
                  value: '{{$form.query("connectionId").get("dataSource")?.find(item=>item.id===$deps[0])?.name}}'
                }
              }
            }
          },
          databaseType: {
            type: 'string',
            default: 'custom_connection',
            'x-display': 'hidden'
          },
          switchSpace: {
            type: 'void',
            title: '启用自定义初始化顺序',
            properties: {
              enableInitialOrder: {
                type: 'boolean',
                required: true,
                'x-component': 'Switch',
                'x-component-props': {},
                'x-reactions': {
                  target: 'initialSyncOrder',
                  fulfill: {
                    state: {
                      visible: '{{!!$self.value}}'
                    }
                  }
                }
              },
              initialSyncOrder: {
                type: 'number',
                required: true,
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  size: 'mini'
                }
              }
            },
            'x-decorator': 'ElFormItem',
            'x-decorator-props': {
              asterisk: true
            },
            'x-component': 'Space',
            'x-component-props': {
              size: 'middle'
            }
          }
        }
      },
      linkFormSchema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            default: 'no_drop',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{loadDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
          }
        }
      }
    }
  }
].concat(
  // 演示新增节点
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

export const processNodeTypes = [
  {
    icon: 'js',
    name: 'JavaScript',
    type: 'js_processor',
    constructor: 'JavaScript'
  },
  {
    icon: 'field-processor',
    name: '字段处理',
    type: 'field_processor',
    constructor: 'JavaScript'
  },
  {
    icon: 'aggregator',
    name: '聚合',
    type: 'aggregation_processor',
    constructor: 'JavaScript'
  },
  {
    icon: 'row-filter',
    name: 'Row Filter',
    type: 'row_filter_processor',
    constructor: 'JavaScript'
  },
  {
    icon: 'joint-cache',
    name: '关联缓存',
    type: 'cache_lookup_processor',
    constructor: 'JavaScript'
  }
]
