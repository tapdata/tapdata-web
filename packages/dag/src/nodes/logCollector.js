import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class LogCollector extends NodeType {
  constructor() {
    super()
  }

  type = 'logCollector'

  minInputs = 0 // 最小输入个数
  maxInputs = 1 // 最小输入个数
  minOutputs = 0 // 最小输出个数
  maxOutputs = 1 // 最大输出个数

  // allowSource = false // 该节点不允许有源

  group = 'data'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        'x-display': 'hidden'
      },
      $outputs: {
        type: 'array',
        'x-display': 'hidden'
      },
      databaseType: {
        type: 'string',
        'x-display': 'hidden'
      },
      connectionId: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': '{{useSyncConnection}}'
      },

      type: {
        type: 'string',
        'x-display': 'hidden'
      },

      name: {
        type: 'string',
        title: i18n.t('public_node_name'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },

      sourceConfig: {
        type: 'void',
        'x-reactions': {
          dependencies: ['$outputs'],
          fulfill: {
            state: {
              display: '{{$deps[0].length > 0 ? "visible":"hidden"}}'
            }
          }
        },
        properties: {
          SharedMiningTableInfo: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'SharedMiningTableInfo',
            'x-component-props': {
              height: '400px'
            }
          },

          nodeConfig: {
            type: 'object'
          }
        }
      },

      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden'
      }
    }
  }
}
