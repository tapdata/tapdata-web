import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class Union extends NodeType {
  constructor() {
    super()
  }

  type = 'union_processor'

  group = 'processor'

  formSchema = {
    properties: {
      name: {
        type: 'string',
        title: i18n.t('public_node_name'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      }
    }
  }
}
