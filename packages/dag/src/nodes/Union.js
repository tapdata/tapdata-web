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
        title: '节点名称',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      }
    }
  }
}
