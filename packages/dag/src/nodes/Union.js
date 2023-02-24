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
        title: i18n.t('packages_dag_nodes_database_jiedianmingcheng'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
    },
  }
}
