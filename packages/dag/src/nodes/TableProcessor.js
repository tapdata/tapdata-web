import { NodeType } from './extends/NodeType'

export class TableProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'table_rename_processor'

  maxInputs = 1 // 最大输入个数
  maxOutputs = 1 // 最大输出个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
      },
      name: {
        type: 'string',
        title: '节点名称',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },
      tableNames: {
        type: 'array',
        'x-component': 'TableRename',
        'x-component-props': {
          findParentNode: '{{findParentNode}}',
          listStyle: {
            maxHeight: 'calc((100vh - 120px) * 0.618)'
          }
        },
        'x-validator': {
          validator: `{{(value, rule) => {
            if (!value.length) return
            const parents = findParentNodes($values.id)
            if (parents && parents.length && parents[0].tableNames.length) {
              let tableNames = parents[0].tableNames
              let tableNameMap = value.reduce((obj, item) => {
                obj[item.previousTableName] = item.currentTableName
                return obj
              }, {})
              let currentTableNames = Object.values(tableNameMap)
              if (currentTableNames.length !== new Set(currentTableNames).size) return rule.message
              let hasDuplicateTableName = tableNames.some(name => {
                if (currentTableNames.includes(name) && !tableNameMap[name]) {
                  return true
                }
              })
              
              return hasDuplicateTableName ? rule.message : ''
            }
          }}}`,
          message: '表名重复'
        }
      }
    }
  }
}
