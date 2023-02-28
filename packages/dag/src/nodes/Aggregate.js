import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class Aggregate extends NodeType {
  constructor() {
    super()
  }

  type = 'aggregation_processor'

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
      fieldNames: {
        type: 'array',
        visible: false,
        'x-reactions': [
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, fieldName: "value", withoutField: true}, $values.$inputs[0])}}',
          {
            target: '*(aggregations.*.aggExpression,aggregations.*.groupByExpression)',
            fulfill: {
              state: {
                dataSource: '{{$self.value}}',
                loading: '{{$self.loading}}'
              }
            }
          }
        ]
      },

      aggregations: {
        type: 'array',
        display: 'none',
        default: [
          {
            filterPredicate: '',
            aggFunction: 'COUNT',
            aggExpression: '',
            groupByExpression: []
          }
        ]
      },

      'aggregations.0': {
        type: 'object',
        properties: {
          row: {
            type: 'void',
            'x-component': 'FormGrid',
            properties: {
              aggFunction: {
                type: 'string',
                title: i18n.t('packages_dag_nodes_aggregate_juhehanshu'),
                enum: [
                  {
                    label: 'AVG',
                    value: 'AVG'
                  },
                  {
                    label: 'SUM',
                    value: 'SUM'
                  },
                  {
                    label: 'MAX',
                    value: 'MAX'
                  },
                  {
                    label: 'MIN',
                    value: 'MIN'
                  },
                  {
                    label: 'COUNT',
                    value: 'COUNT'
                  }
                ],
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Select'
              },
              aggExpression: {
                type: 'string',
                title: i18n.t('packages_dag_nodes_aggregate_zuoyongmubiao'),
                required: true,
                'x-decorator': 'FormItem',
                'x-decorator-props': { gridSpan: 2 },
                'x-component': 'FieldSelect',
                'x-component-props': {
                  allowCreate: true
                },
                'x-reactions': [
                  {
                    dependencies: ['.aggFunction'],
                    fulfill: {
                      state: {
                        value: `{{$deps[0]==='COUNT' ? null:'1'}}`,
                        disabled: `{{$deps[0]==='COUNT'}}`
                      }
                    }
                  }
                ]
              }
            }
          },
          groupByExpression: {
            title: i18n.t('packages_dag_nodes_aggregate_fenzuziduan'),
            type: 'array',
            'x-decorator': 'FormItem',
            'x-component': 'FieldSelect',
            'x-component-props': {
              multiple: true
            }
          }
        }
      },
      // TODO 按时屏蔽外存功能
      // externalStorageId: {
      //   title: '外存配置', //外存配置
      //   type: 'string',
      //   'x-decorator': 'FormItem',
      //   'x-component': 'Select',
      //   'x-reactions': [
      //     '{{useAsyncDataSourceByConfig({service: loadExternalStorage, withoutField: true})}}',
      //     {
      //       fulfill: {
      //         state: {
      //           value: '{{$self.value || $self.dataSource?.find(item => item.isDefault)?.value }}'
      //         }
      //       }
      //     }
      //   ]
      // },

      return: {
        title: i18n.t('packages_dag_nodes_aggregate_fanhuishili'),
        type: 'void',
        'x-decorator': 'FormItem',
        'x-component': 'ArrayAggregate'
      }
    }
  }

  locales = AllLocales.Aggregate
}
