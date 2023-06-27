import i18n from '@tap/i18n'
import { NodeType } from './NodeType'

export class CustomProcessor extends NodeType {
  constructor(props) {
    super()
    this.props = props
    this.formSchema = {
      type: 'object',
      properties: {
        tabs: {
          type: 'void',
          'x-component': 'FormTab',
          'x-component-props': {
            class: 'config-tabs',
            formTab: '{{formTab}}'
          },
          properties: {
            tab1: {
              type: 'void',
              'x-component': 'FormTab.TabPane',
              'x-component-props': {
                label: i18n.t('public_basic_settings')
              },
              properties: {
                form: JSON.parse(JSON.stringify(props.formSchema.schema)),
                schemaPreview: {
                  type: 'void',
                  'x-component': 'SchemaPreview'
                }
              }
            }
          }
        }
      }
    }
  }

  type = 'custom_processor'

  group = 'processor'

  selector(node) {
    return node.type === this.type && node.customNodeId === this.props.customNodeId
  }
}
