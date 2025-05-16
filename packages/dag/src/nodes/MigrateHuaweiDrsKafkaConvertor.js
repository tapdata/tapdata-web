import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class UnwindProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'migrate_huawei_drs_kafka_convertor'

  maxInputs = 1 // 最大输入个数
  maxOutputs = 1 // 最大输出个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none',
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

              storeType: {
                title: i18n.t('public_store_type'),
                type: 'string',
                default: 'JSON',
                enum: ['AVRO', 'JSON', 'JSON_C'],
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                'x-display': 'hidden',
              },

              fromDBType: {
                title: i18n.t('public_from_db_type'),
                type: 'string',
                default: 'MYSQL',
                enum: [
                  'MYSQL',
                  'GAUSSDB_MYSQL',
                  'GAUSSDB',
                  'ORACLE',
                  'MSSQL',
                  'POSTGRESQL',
                ],
                'x-decorator': 'FormItem',
                'x-component': 'Select',
              },

              sampleSize: {
                title: i18n.t('public_sample_size'),
                type: 'number',
                default: 10,
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                },
              },
            },
          },
          tab2: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_data_schema'),
            },
            properties: {
              schemaPanel: {
                type: 'void',
                'x-component': 'SchemaPanel',
                'x-component-props': {
                  class: 'mx-n4',
                  formTab: '{{formTab}}',
                },
              },
            },
          },
        },
      },
    },
  }
}
