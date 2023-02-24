import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class MergeTable extends NodeType {
  constructor() {
    super()
  }

  type = 'merge_table_processor'

  maxOutputs = 1 // 最大输出个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        'x-display': 'hidden',
      },
      $outputs: {
        type: 'array',
        'x-display': 'hidden',
      },

      externalStorageId: {
        title: '外存配置', //外存配置
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-reactions': [
          '{{useAsyncDataSourceByConfig({service: loadExternalStorage, withoutField: true})}}',
          {
            fulfill: {
              state: {
                value:
                  '{{$self.value || $self.dataSource?.find(item => item.isDefault)?.value }}',
              },
            },
          },
        ],
      },
      name: {
        type: 'string',
        title: i18n.t('packages_dag_nodes_database_jiedianmingcheng'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },

      mergeProperties: {
        title: i18n.t('packages_dag_nodes_mergetable_zhucongpeizhi'),
        type: 'array',
        required: true,
        'x-decorator': 'FormItem',
        'x-decorator-props': {},
        'x-component': 'MergeTableTree',
        'x-component-props': {
          treeWidth: 200,
          findNodeById: '{{findNodeById}}',
          loadFieldsMethod: '{{loadNodeFieldOptions}}',
        },
        items: {
          type: 'object',
          properties: {
            itemsWrap: {
              type: 'void',
              'x-component': 'FormContent',
              properties: {
                id: {
                  type: 'string',
                  'x-display': 'hidden',
                },
                mergeType: {
                  type: 'string',
                  title: i18n.t('packages_dag_nodes_mergetable_shujuxierumo'),
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  enum: [
                    {
                      label: i18n.t(
                        'packages_dag_editor_cell_link_writeMode_update'
                      ),
                      value: 'updateWrite',
                    },
                    {
                      label: i18n.t(
                        'packages_dag_editor_cell_link_writeMode_upsert'
                      ),
                      value: 'updateOrInsert',
                    },
                    {
                      label: i18n.t(
                        'packages_dag_nodes_mergetable_gengxinjinneiqian'
                      ),
                      value: 'updateIntoArray',
                    },
                  ],
                },
                wrap: {
                  type: 'void',
                  'x-component': 'FormContent',
                  properties: {
                    targetPath: {
                      type: 'string',
                      title: i18n.t(
                        'packages_dag_nodes_mergetable_guanlianhouxieru'
                      ),
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-reactions': [
                        {
                          dependencies: ['.mergeType', '.id'],
                          fulfill: {
                            state: {
                              value: `{{ !$self.value && $self.value !== '' && ($deps[0] === "updateWrite" || $deps[0] === "updateIntoArray") ? findNodeById($deps[1]) ? findNodeById($deps[1]).name:undefined : $self.value }}`,
                            },
                          },
                        },
                        {
                          effects: ['onFieldInputValueChange'],
                          fulfill: {
                            run: `{{
                                  const arr = $self.value.split('.')
                                  if (arr.length > 2) {
                                    $self.value = arr.slice(0,2).join('.')
                                    $self.description = '${i18n.t(
                                      'packages_dag_nodes_mergetable_const_zuiduozhichiliangceng'
                                    )}'
                                  } else {
                                    $self.description = ''
                                  }
                                }}`,
                          },
                        },
                      ],
                    },
                    arrayKeys: {
                      type: 'array',
                      title: i18n.t(
                        'packages_dag_nodes_mergetable_neiqianshuzupi'
                      ),
                      'x-decorator': 'FormItem',
                      'x-component': 'FieldSelect',
                      'x-component-props': {
                        'allow-create': true,
                        multiple: true,
                        filterable: true,
                      },
                      'x-reactions': [
                        {
                          dependencies: ['.mergeType'],
                          fulfill: {
                            state: {
                              visible: '{{ $deps[0] === "updateIntoArray" }}',
                            },
                          },
                        },
                      ],
                    },
                    joinKeys: {
                      type: 'array',
                      title: i18n.t(
                        'packages_dag_nodes_mergetable_guanliantiaojian'
                      ),
                      'x-decorator': 'FormItem',
                      'x-component': 'ArrayTable',
                      items: {
                        type: 'object',
                        properties: {
                          c1: {
                            type: 'void',
                            'x-component': 'ArrayTable.Column',
                            'x-component-props': {
                              title: i18n.t(
                                'packages_dag_nodes_mergetable_dangqianbiaoziduan'
                              ),
                              align: 'center',
                              asterisk: false,
                            },
                            properties: {
                              source: {
                                type: 'string',
                                loading: true,
                                required: true,
                                'x-decorator': 'FormItem',
                                'x-component': 'FieldSelect',
                                'x-component-props': {
                                  'allow-create': true,
                                  filterable: true,
                                },
                              },
                            },
                          },
                          c2: {
                            type: 'void',
                            'x-component': 'ArrayTable.Column',
                            'x-component-props': {
                              title: i18n.t(
                                'packages_dag_nodes_mergetable_mubiaobiaoziduan'
                              ),
                              align: 'center',
                              asterisk: false,
                            },
                            properties: {
                              target: {
                                type: 'string',
                                required: true,
                                'x-decorator': 'FormItem',
                                'x-component': 'FieldSelect',
                                'x-component-props': {
                                  'allow-create': true,
                                  filterable: true,
                                },
                              },
                            },
                          },
                          c3: {
                            type: 'void',
                            'x-component': 'ArrayTable.Column',
                            'x-component-props': {
                              width: 40,
                              title: '',
                              align: 'center',
                            },
                            properties: {
                              remove: {
                                type: 'void',
                                'x-component': 'ArrayTable.Remove',
                              },
                            },
                          },
                        },
                      },
                      properties: {
                        addition: {
                          type: 'void',
                          title: '+',
                          'x-component': 'ArrayTable.Addition',
                        },
                      },
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

  allowTarget(target) {
    return !!target.attrs?.capabilities?.find(
      ({ id }) => id === 'master_slave_merge'
    )
  }
}
