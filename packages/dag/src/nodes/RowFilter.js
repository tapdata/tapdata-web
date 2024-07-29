import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class RowFilter extends NodeType {
  constructor() {
    super()
  }

  type = 'row_filter_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
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
              action: {
                title: i18n.t('packages_dag_nodes_rowfilter_zhixingdongzuo'),
                type: 'string',
                required: true,
                default: 'retain',
                enum: [
                  {
                    label: i18n.t('packages_dag_nodes_jointcache_baoliupipeishu'),
                    value: 'retain',
                  },
                  {
                    label: i18n.t('packages_dag_nodes_rowfilter_diuqipipeishu'),
                    value: 'discard',
                  },
                ],
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-decorator-props': {
                  wrapperWidth: 240,
                },
              },
              expression: {
                title: i18n.t('packages_dag_nodes_rowfilter_tiaojianbiaodashi'),
                type: 'string',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'JsEditor',
                'x-component-props': {
                  options: { showPrintMargin: false, useWrapMode: true },
                  onInit: '{{editor => addEditorFieldCompletion(editor, $values.id, $values.$inputs)}}',
                },
              },
              example: {
                type: 'void',
                'x-component': 'ExpressionExample',
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
