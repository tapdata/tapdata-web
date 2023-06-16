import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class FieldModTypeFilter extends NodeType {
  constructor() {
    super()
  }

  type = 'migrate_field_mod_type_filter_processor'

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
        title: '选择要过滤掉的字段类型',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          multiple: true
        },
        'x-reactions':
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldTypesById, withoutField: true}, $self.value.length ? $values.id : $values.$inputs[0])}}'
      }
    }
  }
}
