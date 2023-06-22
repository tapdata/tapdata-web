import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class FieldModTypeFilter extends NodeType {
  constructor() {
    super()
  }

  type = 'field_mod_type_filter_processor'

  maxInputs = 1 // 最大输入个数

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
        title: i18n.t('public_node_name'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },
      filterTypes: {
        type: 'array',
        title: i18n.t('packages_dag_nodes_database_xuanzeyaoguolvdiaode'),
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          multiple: true
        },
        'x-reactions':
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldTypesById, withoutField: true}, $self.value.length ? $values.id : $values.$inputs[0])}}'
      },
      fieldList: {
        type: 'void',
        title: i18n.t('packages_dag_nodes_database_guolvjieguo'),
        'x-decorator': 'FormItem',
        'x-component': 'fieldList',
        'x-component-props': {
          nodeId: '{{$values.id}}',
          hideNav: true
        }
      }
    }
  }
}
