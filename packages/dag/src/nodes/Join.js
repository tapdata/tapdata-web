import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class Join extends NodeType {
  constructor() {
    super()
  }

  type = 'join_processor'

  maxInputs = 2 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none',
        'x-reactions': [
          {
            fulfill: {
              run: `
                // console.log('$self.value', $self.value, $values);
                if (($values.leftNodeId && !$self.value.includes($values.leftNodeId)) || !$values.leftNodeId) {
                  let nodeIds = $self.value.filter(v => v !== $values.rightNodeId)
                  $values.leftNodeId = nodeIds[0] || ''
                }

                if (($values.rightNodeId && !$self.value.includes($values.rightNodeId)) || !$values.rightNodeId) {
                  let nodeIds = $self.value.filter(v => v !== $values.leftNodeId)
                  $values.rightNodeId = nodeIds[0] || ''
                }
                // console.log('$inputs_$values', $values)
              `,
            },
          },
        ],
      },

      tabs: {
        type: 'void',
        'x-component': 'FormTab',
        'x-component-props': {
          class: 'config-tabs',
          formTab: '{{formTab}}',
        },
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_basic_settings'),
            },
            properties: {
              nameWrap: {
                type: 'void',
                title: i18n.t('public_node_name'),
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  asterisk: true,
                  feedbackLayout: 'none',
                },
                'x-component': 'FormFlex',
                'x-component-props': {
                  gap: 8,
                  align: 'start',
                },
                properties: {
                  name: {
                    type: 'string',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      style: {
                        flex: 1,
                      },
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                      onChange: `{{() => { $values.attrs.hasNameEdited = true }}}`,
                    },
                  },

                  clipboardButton: {
                    type: 'void',
                    'x-component': 'ClipboardButton',
                    'x-component-props': {
                      tooltip: i18n.t('packages_dag_copy_node_id'),
                      finishTooltip: i18n.t('packages_dag_nodes_table_yifuzhi'),
                      content: '{{$values.id}}',
                    },
                  },
                },
              },
              leftNodeId: {
                type: 'string',
                display: 'none',
              },
              rightNodeId: {
                type: 'string',
                display: 'none',
              },

              joinType: {
                title: i18n.t('public_connection_type'),
                type: 'string',
                required: true,
                default: 'left',
                enum: [
                  {
                    label: i18n.t('packages_dag_nodes_join_zuolianjie'),
                    value: 'left',
                  } /*,
                  {
                    label: '右连接',
                    value: 'right'
                  },
                  {
                    label: '内连接',
                    value: 'inner'
                  },
                  {
                    label: '全连接',
                    value: 'full'
                  }*/,
                ],
                'x-decorator': 'FormItem',
                'x-component': 'Select',
              },

              joinExpressions: {
                title: i18n.t('packages_dag_nodes_join_lianjieziduanshe'),
                type: 'array',
                required: true,
                default: [{ left: '', right: '', expression: '=' }],
                items: {
                  type: 'object',
                  properties: {
                    left: {
                      title: i18n.t('packages_dag_nodes_join_zuoce'),
                      type: 'string',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-decorator-props': {
                        labelStyle: {
                          display: 'none',
                        },
                      },
                      'x-component': 'FieldSelect',
                      'x-component-props': {
                        filterable: true,
                      },
                    },
                    right: {
                      title: i18n.t('packages_dag_nodes_join_youce'),
                      type: 'string',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-decorator-props': {
                        labelStyle: {
                          display: 'none',
                        },
                      },
                      'x-component': 'FieldSelect',
                      'x-component-props': {
                        filterable: true,
                      },
                    },
                  },
                },
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  layout: 'vertical',
                },
                'x-component': 'JoinExpression',
                'x-component-props': {
                  findNodeById: '{{findNodeById}}',
                  loadNodeFieldNamesById: '{{loadNodeFieldOptions}}',
                },
                'x-reactions': [
                  {
                    dependencies: ['leftNodeId'],
                    fulfill: {
                      schema: {
                        'x-component-props.leftNodeId': '{{$deps[0]}}',
                      },
                    },
                  },
                  {
                    dependencies: ['rightNodeId'],
                    fulfill: {
                      schema: {
                        'x-component-props.rightNodeId': '{{$deps[0]}}',
                      },
                    },
                  },
                ],
              },
              externalStorageId: {
                title: i18n.t('packages_dag_nodes_aggregate_waicunpeizhi'), //外存配置
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-reactions': [
                  '{{useAsyncDataSourceByConfig({service: loadExternalStorage, withoutField: true})}}',
                  {
                    fulfill: {
                      state: {
                        value: '{{$self.value || $self.dataSource?.find(item => item.isDefault)?.value }}',
                      },
                    },
                  },
                ],
              },

              schemaPreview: {
                type: 'void',
                'x-component': 'SchemaPreview',
              },
            },
          },
        },
      },
    },
  }
}
