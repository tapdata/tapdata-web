import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class DuckDB extends NodeType {
  type = 'duckdb_sql_processor'

  maxInputs = 1 // 最大输入个数

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
              querySql: {
                type: 'string',
                'x-component': 'MonacoSqlEditor',
                'x-component-props': {
                  class: 'mt-2',
                  height: '520px',
                },
              },
              schemaPreview: {
                type: 'void',
                'x-component': 'SchemaPreview',
              },
            },
          },
          advancedTab: {
            type: 'void',
            'x-index': 2,
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_advanced_settings'),
            },
            properties: {
              batchSize: {
                title: i18n.t('public_duckdb_batch_size'),
                type: 'number',
                default: 2000,
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  tooltip: i18n.t('public_duckdb_batch_size_tooltip'),
                },
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                },
              },
              dbPath: {
                title: i18n.t('public_duckdb_db_path'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  tooltip: i18n.t('public_duckdb_db_path_tooltip'),
                },
                'x-component': 'Input',
                'x-component-props': {
                  allowClear: true,
                },
              },
              threads: {
                title: i18n.t('public_duckdb_threads'),
                type: 'number',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  tooltip: i18n.t('public_duckdb_threads_tooltip'),
                },
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                },
              },
              memoryLimitGB: {
                title: i18n.t('public_duckdb_memory_limit_gb'),
                type: 'number',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  tooltip: i18n.t('public_duckdb_memory_limit_gb_tooltip'),
                },
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                },
                'x-content': {
                  suffix: 'GB',
                },
              },
              space: {
                type: 'void',
                'x-component': 'Space',
                'x-component-props': {
                  class: 'py-3',
                  size: 'middle',
                },
                properties: {
                  enableConcurrentProcess: {
                    title: i18n.t('packages_dag_enableConcurrentProcess'),
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'Switch',
                    'x-reactions': {
                      target: 'concurrentNum',
                      fulfill: {
                        state: {
                          visible: '{{!!$self.value}}',
                        },
                      },
                    },
                  },
                  concurrentNum: {
                    title: i18n.t('packages_dag_concurrentNum'),
                    type: 'number',
                    default: 2,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
}
