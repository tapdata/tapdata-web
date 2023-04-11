import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'
import { action } from '@formily/reactive'

export class DateProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'date_processor'

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
        title: i18n.t('public_node_name'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },
      dataTypes: {
        type: 'array',
        title: '请选择您要运算的时间类型',
        required: true,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          wrapperWidth: 300
        },
        'x-component': 'Select',
        'x-component-props': {
          multiple: true
        },
        'x-reactions': [`{{useFieldDateType($values.$inputs[0])}}`]
      },
      space: {
        type: 'void',
        title: '请选择运算方式',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          asterisk: true
        },
        useAsyncDataSourceByConfig: (config, ...serviceParams) => {
          // withoutField: 不往service方法传field参数
          const { service, fieldName = 'dataSource', withoutField = false } = config
          return field => {
            field.loading = true
            let fetch = withoutField ? service(...serviceParams) : service(field, ...serviceParams)
            fetch.then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },
        'x-component': 'Space',
        properties: {
          add: {
            type: 'boolean',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            default: true,
            enum: [
              {
                label: '增加',
                value: true
              },
              {
                label: '减少',
                value: false
              }
            ]
          },
          hours: {
            type: 'number',
            default: 8,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              addonAfter: '小时'
            },
            'x-component': 'InputNumber',
            'x-component-props': {
              min: 1
            }
          }
        }
      }
    }
  }
}
