import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class UnwindProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'unwind_processor'

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
              path: {
                type: 'string',
                title: i18n.t('packages_dag_unwind_path'),
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'FieldSelect',
                'x-reactions': `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true}, $values.$inputs[0])}}`,
              },
              includeArrayIndex: {
                type: 'string',
                title: i18n.t('packages_dag_unwind_includeArrayIndex'),
                'x-decorator': 'FormItem',
                'x-component': 'Input',
              },
              preserveNullAndEmptyArrays: {
                type: 'boolean',
                title: i18n.t('packages_dag_unwind_preserveNullAndEmptyArrays'),
                'x-component': 'Switch',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  tooltip: i18n.t('packages_dag_unwind_preserveNullAndEmptyArrays_tips'),
                },
              },
              unwindModel: {
                type: 'string',
                title: i18n.t('packages_dag_unwind_unwindModel'),
                default: 'EMBEDDED',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    value: 'EMBEDDED',
                    label: i18n.t('packages_dag_unwind_embedded'),
                  },
                  {
                    value: 'FLATTEN',
                    label: i18n.t('packages_dag_unwind_flatten'),
                  },
                ],
                'x-reactions': {
                  target: '*(arrayModel, joiner)',
                  fulfill: {
                    state: {
                      visible: '{{$self.value === "FLATTEN"}}',
                    },
                  },
                },
              },
              arrayModel: {
                type: 'string',
                title: i18n.t('packages_dag_unwind_arrayModel'),
                default: 'OBJECT',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    value: 'MIX',
                    label: i18n.t('packages_dag_unwind_arrayModel_mix'),
                  },
                  {
                    value: 'OBJECT',
                    label: i18n.t('packages_dag_unwind_arrayModel_object'),
                  },
                  {
                    value: 'BASIC',
                    label: i18n.t('packages_dag_unwind_arrayModel_basic'),
                  },
                ],
              },
              joiner: {
                type: 'string',
                title: i18n.t('packages_dag_unwind_joiner'),
                default: '-',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  maxlength: 10,
                },
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
