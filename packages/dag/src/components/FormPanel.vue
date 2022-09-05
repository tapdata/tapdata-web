<template>
  <FormRender :form="form" :schema="schema" :scope="scope" v-bind="$attrs" />
</template>

<script>
import i18n from '@tap/i18n'

import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { createForm, onFormInputChange, onFormValuesChange, onFieldReact, isVoidField } from '@formily/core'
import { Path } from '@formily/path'
import { validateBySchema } from '@tap/form/src/shared/validate'
import { debounce } from 'lodash'
import FormRender from './FormRender'

const mapEnum = dataSource => (item, index) => {
  const label = dataSource[index] || dataSource[item.value] || item.label
  return {
    ...item,
    value: item?.value ?? null,
    label: label?.label ?? label
  }
}

export default {
  name: 'FormPanel',

  props: {
    scope: {}
  },

  components: { FormRender },

  data() {
    return {
      form: createForm(),

      formProps: {
        colon: false,
        shallow: false,
        labelAlign: 'left',
        // labelWidth: '120',
        layout: 'vertical',
        // layout: 'horizontal',
        feedbackLayout: 'terse'
      },

      schema: null
    }
  },

  computed: {
    ...mapState('dataflow', ['activeNodeId', 'transformStatus']),

    ...mapGetters('dataflow', [
      'activeNode',
      'nodeById',
      'activeConnection',
      'activeType',
      'hasNodeError',
      'allEdges',
      'stateIsReadonly',
      'getMessage'
    ]),

    node() {
      return this.activeNode
    },

    ins() {
      return this.node?.__Ctor
    }
  },

  watch: {
    stateIsReadonly(v) {
      // eslint-disable-next-line no-console
      console.log(i18n.t('packages_dag_components_formpanel_jiantingsta'), v)
      this.form.setState({ disabled: v })
    },

    async activeNodeId(n, o) {
      const formSchema = this.$store.getters['dataflow/formSchema'] || {}
      if (!this.ins) return
      await this.setSchema(this.ins.formSchema || formSchema.node)

      // 如果节点存在错误状态，走一遍校验，可以让用户看到错误信息
      // 脏代码。节点错误原先是布尔值，又增加字符串类型
      // 布尔值代表表单校验，字符串目前仅是任务增量、全量校验
      if (this.hasNodeError(n) && typeof this.hasNodeError(n) !== 'string') {
        await this.validate()
      }

      // 校验上一个节点配置
      if (o) {
        const node = this.nodeById(o)
        try {
          if (node) {
            const result = await validateBySchema(node.__Ctor.formSchema, node, this.scope)
            // eslint-disable-next-line no-console
            console.log(i18n.t('packages_dag_components_formpanel_shangyigejihuo'), result)
          }

          if (this.hasNodeError(o) && typeof this.hasNodeError(o) !== 'string') {
            this.clearNodeError(o)
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
          this.setNodeError(o)
        }
      }

      this.setNodeInputsWatcher(
        this.$watch('node.$inputs', v => {
          if (!this.node || !v) return
          const $inputs = this.form.getFieldState('$inputs')
          // eslint-disable-next-line no-console
          console.log('🤖️ node.$inputs', this.node.name, v)
          if ($inputs && $inputs.value.join(',') !== v.join(',')) {
            // eslint-disable-next-line no-console
            console.log(i18n.t('packages_dag_components_formpanel_gengxininp'), $inputs.value)
            this.form.setValuesIn('$inputs', [...v])
            this.$emit('update:InputsOrOutputs')
          }
        })
      )
      this.setNodeOutputsWatcher(
        this.$watch('node.$outputs', v => {
          if (!this.node || !v) return
          const $outputs = this.form.getFieldState('$outputs')
          // eslint-disable-next-line no-console
          console.log('🤖️ node.$outputs', this.node.name, v)
          if ($outputs && $outputs.value.join(',') !== v.join(',')) {
            // eslint-disable-next-line no-console
            console.log(i18n.t('packages_dag_components_formpanel_gengxinout'), $outputs.value, v)
            this.form.setValuesIn('$outputs', [...v])
            this.$emit('update:InputsOrOutputs')
          }
        })
      )
    },

    // 监听连线变动
    'allEdges.length'() {
      if (!this.node) return
      if (this.form.getFieldState('isSource')) {
        // 节点关心isSource
        this.form.setFieldState('isSource', state => {
          this.scope.isSource(state)
        })
      }
      if (this.form.getFieldState('isTarget')) {
        // 节点关心isTarget
        this.form.setFieldState('isTarget', state => {
          this.scope.isTarget(state)
        })
      }
      if (this.form.getFieldState('sourceNode')) {
        // 节点关心sourceNode
        this.form.setFieldState('sourceNode', state => {
          this.scope.getSourceNode(state)
        })
      }
    }
  },

  beforeDestroy() {
    this.form.onUnmount()
  },

  methods: {
    ...mapMutations('dataflow', [
      'setNodeValue',
      'updateNodeProperties',
      'setNodeError',
      'clearNodeError',
      'setNodeInputsWatcher',
      'setNodeOutputsWatcher'
    ]),

    ...mapActions('dataflow', ['updateDag']),

    /**
     * 校验表单
     * @returns {Promise<void>}
     */
    async validate() {
      const id = this.activeNodeId
      if (!id) return
      try {
        await this.form.validate()
        this.clearNodeError(id)
      } catch (e) {
        this.setNodeError(id)
      }
    },

    // 设置schema
    async setSchema(schema, values) {
      this.schema = null

      await this.$nextTick()

      this.form = createForm({
        disabled: this.stateIsReadonly,
        values: values || this.node,
        effects: this.useEffects
      })
      if (schema.schema && schema.form) {
        // 临时判断从自定义节点过来的schema
        // 表单数据存储到form对象
        this.schema = {
          type: 'object',
          properties: {
            // 自定节点附加属性
            sourceNode: {
              type: 'array',
              'x-visible': false,
              'x-reactions': '{{getSourceNode}}'
            },
            form: JSON.parse(JSON.stringify(schema.schema))
          }
        }
      } else {
        this.schema = JSON.parse(JSON.stringify(schema))
      }
    },

    getSettingSchema() {
      return {
        type: 'object',
        properties: {
          layout: {
            type: 'void',
            'x-component': 'FormLayout',
            'x-component-props': {
              colon: false,
              layout: 'vertical',
              feedbackLayout: 'terse',
              wrapperWidth: 300
            },
            properties: {
              flowEngineVersion: {
                title: this.$t('packages_dag_dataFlow_flowEngineVersion'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                default: 'Data_Flow_Engine_V1',
                enum: [
                  {
                    label: this.$t('packages_dag_dataFlow_flowEngineV1'),
                    value: 'Data_Flow_Engine_V1'
                  },
                  {
                    label: this.$t('packages_dag_dataFlow_jetFlowEngineV2'),
                    value: 'Jet_Flow_Engine_V2'
                  }
                ]
              },
              sync_type: {
                title: i18n.t('packages_dag_task_setting_sync_type'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                // default: 'initial_sync+cdc',
                enum: [
                  {
                    label: i18n.t('packages_dag_components_formpanel_quanliangzengliang'),
                    value: 'initial_sync+cdc'
                  },
                  {
                    label: i18n.t('packages_dag_task_setting_initial_sync'),
                    value: 'initial_sync'
                  },
                  {
                    label: i18n.t('packages_dag_task_setting_cdc'),
                    value: 'cdc'
                  }
                ],
                'x-reactions': {
                  target: '*(isSerialMode, cdcFetchSize)',
                  fulfill: {
                    state: {
                      visible: '{{$self.value !== "initial_sync"}}'
                    }
                  }
                }
              },
              cdcEngineFilter: {
                title: i18n.t('packages_dag_task_setting_cdc_engine_filter'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              stopOnError: {
                title: i18n.t('packages_dag_task_setting_stop_on_error'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
                // default: true
              },
              needToCreateIndex: {
                title: i18n.t('packages_dag_task_setting_automatic_index'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
                // default: true
              },
              isOpenAutoDDL: {
                title: i18n.t('packages_dag_components_formpanel_zidongchuliD'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              noPrimaryKey: {
                title: i18n.t('packages_dag_components_formpanel_zhichiwuzhujian'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              isSerialMode: {
                title: i18n.t('packages_dag_components_formpanel_zengliangshujuchu'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: i18n.t('packages_dag_components_formpanel_piliang'),
                    value: false
                  },
                  {
                    label: i18n.t('packages_dag_components_formpanel_zhutiao'),
                    value: true
                  }
                ]
              },
              cdcFetchSize: {
                title: i18n.t('packages_dag_components_formpanel_zengliangpicidu'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 1000
                }
                // default: 1
              },
              distinctWriteType: {
                title: i18n.t('packages_dag_task_setting_distinct_write_type'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: this.$t('packages_dag_dataFlow_setting_intellect'),
                    value: 'intellect'
                  },
                  {
                    label: this.$t('packages_dag_dataFlow_setting_compel'),
                    value: 'compel'
                  }
                ]
                // default: 'intellect'
              },
              emailWaring: {
                title: i18n.t('packages_dag_components_formpanel_fasongyoujian'),
                type: 'object',
                'x-decorator': 'FormItem',
                properties: {
                  paused: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: i18n.t('packages_dag_components_formpanel_dangrenwutingzhi')
                      }
                    }
                  },
                  error: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: i18n.t('packages_dag_components_formpanel_dangrenwuchucuo')
                      }
                    }
                  },
                  edited: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: i18n.t('packages_dag_components_formpanel_dangrenwubeibian')
                      }
                    }
                  },
                  started: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: i18n.t('packages_dag_components_formpanel_dangrenwukaiqi')
                      }
                    }
                  }
                }
              },
              readShareLogMode: {
                title: i18n.t('packages_dag_task_setting_share_cdc_mode'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: i18n.t('packages_dag_components_formpanel_liushiduqu'),
                    value: 'STREAMING'
                  },
                  {
                    label: i18n.t('packages_dag_components_formpanel_lunxunduqu'),
                    value: 'POLLING'
                  }
                ]
                // default: 'STREAMING'
              },
              increment: {
                title: i18n.t('packages_dag_task_setting_automatic_index'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] === "initial_sync"}}'
                    }
                  }
                }
              },
              isSchedule: {
                title: i18n.t('packages_dag_task_setting_is_schedule'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] === "initial_sync" ? "visible" : "hidden"}}'
                    }
                  }
                }
                // default: false
              },
              cronExpression: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: i18n.t('packages_dag_task_setting_cron_expression')
                },
                'x-reactions': {
                  dependencies: ['sync_type', 'isSchedule'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] === "initial_sync" && $deps[1] ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              readCdcInterval: {
                title: i18n.t('packages_dag_components_formpanel_zengliangtongbujian'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  append: 'ms'
                }
              },
              readBatchSize: {
                title: i18n.t('packages_dag_components_formpanel_meiciduqushu'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-content': {
                  append: 'row'
                }
                // default: 100
              },
              processorConcurrency: {
                title: i18n.t('packages_dag_task_setting_processorThreadNum'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 100
                }
                // default: 1
              },
              cdcConcurrency: {
                title: i18n.t('packages_dag_task_setting_cdc_concurrency'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                // default: false,
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] !== "initial_sync" ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              transformerConcurrency: {
                title: i18n.t('packages_dag_task_setting_transformer_concurrency'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 100
                },
                'x-reactions': {
                  dependencies: ['sync_type', 'cdcConcurrency'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0] !== "cdc" || ($deps[0] === "cdc" && $deps[1])}}'
                    }
                  }
                }
                // default: 8
              },
              syncPoints: {
                title: i18n.t('packages_dag_task_setting_sync_point'),
                type: 'array',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayItems',
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0] === "cdc"}}'
                    }
                  }
                },
                items: [
                  {
                    type: 'object',
                    properties: {
                      row: {
                        type: 'void',
                        'x-component': 'Row',
                        'x-component-props': {
                          type: 'flex',
                          gap: '10px'
                        },
                        properties: {
                          type: {
                            type: 'string',
                            'x-decorator': 'Col',
                            'x-decorator-props': {
                              span: 8
                            },
                            'x-component': 'Select',
                            'x-component-props': {
                              placeholder: i18n.t('packages_dag_components_formpanel_qingxuanze')
                            },
                            enum: [
                              {
                                label: this.$t('packages_dag_dataFlow_SyncInfo_localTZType'),
                                value: 'localTZ'
                              },
                              {
                                label: this.$t('packages_dag_dataFlow_SyncInfo_connTZType'),
                                value: 'connTZ'
                              },
                              {
                                label: this.$t('packages_dag_dataFlow_SyncInfo_currentType'),
                                value: 'current'
                              }
                            ]
                          },
                          date: {
                            type: 'string',
                            'x-decorator': 'Col',
                            'x-decorator-props': {
                              span: 14
                            },
                            'x-component': 'DatePicker',
                            'x-component-props': {
                              type: 'datetime',
                              format: 'yyyy-MM-dd HH:mm:ss'
                            }
                          }
                        }
                      }
                    }
                  }
                ]
                /*default: [
                  {
                    connectionId: '',
                    type: 'current', // localTZ: 本地时区； connTZ：连接时区
                    time: '',
                    date: '',
                    name: '',
                    timezone: '+08:00' // 当type为localTZ时有该字段
                  }
                ]*/
              },
              cdcShareFilterOnServer: {
                title: i18n.t('packages_dag_components_formpanel_gongxiangwajueri'),
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              maxTransactionLength: {
                title: i18n.t('packages_dag_components_formpanel_shiwuzuidashi'),
                type: 'number',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber'
              },
              lagTime: {
                title: i18n.t('packages_dag_components_formpanel_zengliangzhihoupan'),
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'Space',
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0] !== "initial_sync"}}'
                    }
                  }
                },
                properties: {
                  lagTimeFalg: {
                    type: 'boolean',
                    'x-component': 'Switch'
                  },
                  userSetLagTime: {
                    type: 'number',
                    'x-component': 'InputNumber',
                    /*'x-component-props': {
                      append: '秒'
                    },*/
                    'x-reactions': {
                      dependencies: ['lagTimeFalg'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === true}}'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    updateNodePropsDebounce(form) {
      clearTimeout(this.updateTimer)
      this.updateTimer = setTimeout(() => {
        const node = this.nodeById(form.values.id)
        if (node && JSON.stringify(form.values) !== JSON.stringify(node)) {
          this.updateNodeProps(form)
        }
      }, 60)
    },

    // 更新节点属性
    updateNodeProps(form) {
      clearTimeout(this.updateTimer)
      /*if (!this.node || form.values.id !== this.node.id) {
        console.log('节点已经切换', form.values.name, '->', this.node.name) // eslint-disable-line
        return
      }*/

      const formValues = JSON.parse(JSON.stringify(form.values))
      // const formValues = { ...form.values }
      const filterProps = ['id', 'isSource', 'isTarget', 'attrs.position', 'sourceNode', '$inputs', '$outputs'] // 排除属性的更新
      filterProps.forEach(path => {
        Path.setIn(formValues, path, undefined)
      })

      console.log('updateNodeProps', formValues) // eslint-disable-line
      this.updateNodeProperties({
        id: form.values.id,
        properties: JSON.parse(JSON.stringify(formValues))
      })
      this.updateDag()
      this.confirmNodeHasError()
    },

    // 绑定表单事件
    useEffects() {
      onFormValuesChange(form => {
        if (this.stateIsReadonly) return
        // eslint-disable-next-line no-console
        // console.groupCollapsed(`🚗onFormValuesChange:${Date.now()}`)
        // eslint-disable-next-line no-console
        // console.trace(JSON.parse(JSON.stringify(form.values)))
        // eslint-disable-next-line no-console
        // console.groupEnd()
        // if (!this.node || form.values.id !== this.node.id) {
        //   console.log('节点已经切换', form.values.name, '->', this.node.name) // eslint-disable-line
        // }
        console.log(`🚗onFormValuesChange`, JSON.parse(JSON.stringify(form.values)))
        this.updateNodePropsDebounce(form)
      })

      onFormInputChange(form => {
        if (this.stateIsReadonly) return
        // eslint-disable-next-line no-console
        console.log('🚄onFormInputChange', JSON.parse(JSON.stringify(form.values)))
        this.updateNodeProps(form)
      })
      onFieldReact('*', field => {
        const path = field.path.toString().replace(/\.[\d+]/g, '')
        const takeMessage = prop => {
          const token = `${path}${prop ? `.${prop}` : ''}`
          return this.getMessage(token, this.ins.locales)
        }
        const title = takeMessage('title') || takeMessage()
        const description = takeMessage('description')
        const tooltip = takeMessage('tooltip')
        const dataSource = takeMessage('dataSource')
        const placeholder = takeMessage('placeholder')

        if (title) {
          field.title = title
        }
        if (description) {
          field.description = description
        }
        if (tooltip) {
          field.decorator[1] = field.decorator[1] || []
          field.decorator[1].tooltip = tooltip
        }
        if (placeholder) {
          field.component[1] = field.component[1] || []
          field.component[1].placeholder = placeholder
        }
        if (dataSource?.length && !isVoidField(field)) {
          if (field.dataSource?.length) {
            field.dataSource = field.dataSource.map(mapEnum(dataSource))
          } else {
            field.dataSource = dataSource.slice()
          }
        }
        /*if (!isVoidField(field)) {
          if (dataSource?.length && !isVoidField(field)) {
            if (field.dataSource?.length) {
              field.dataSource = field.dataSource.map(mapEnum(dataSource))
            } else {
              field.dataSource = dataSource.slice()
            }
          } else {
            field.dataSource = field.dataSource?.filter?.(Boolean)
          }
        }*/
      })
    },

    confirmNodeHasError() {
      // 节点已经没有错误，清除节点的告警图标
      const res = this.hasNodeError(this.activeNodeId)
      if (res && typeof res === 'boolean' && !this.form.errors.length) {
        this.clearNodeError(this.activeNodeId)
      }
    }
  }
}
</script>
