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
            console.debug('[DEBUG]: tableNames validate', value)
            if (!value.length) return
            const parents = findParentNodes($values.id)
            if (parents && parents.length && parents[0].tableNames.length) {
              let tableNames = parents[0].tableNames
              let countByName = {}
              let duplicateTableNames = new Set()
              let tableNameMap = value.reduce((obj, item) => {
                obj[item.previousTableName] = item.currentTableName
                if (item.currentTableName in countByName) {
                  countByName[item.currentTableName]++
                  duplicateTableNames.add(item.currentTableName)
                } else {
                  countByName[item.currentTableName] = 1
                }
                return obj
              }, {})
              let currentTableNames = Object.values(tableNameMap)
              // if (currentTableNames.length !== new Set(currentTableNames).size) return rule.message
              tableNames.forEach(name => {
                if (currentTableNames.includes(name) && !tableNameMap[name]) {
                  duplicateTableNames.add(name)
                }
              })
              if (duplicateTableNames.size) {
                return \`\${rule.message}: \${[...duplicateTableNames].join(', ')}\` 
              }
            }
          }}}`,
          message: '表名重复'
        }
      }
    }
  }
}
