<template>
  <FormRender :form="form" :schema="schema" :scope="scope" />
</template>

<script>
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
      console.log('监听：stateIsReadonly', v) // eslint-disable-line
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
            console.log('上一个激活的节点校验结果', result)
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
            console.log('👷 更新$inputs', $inputs.value)
            this.form.setValuesIn('$inputs', [...v])
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
            console.log('👷 更新$outputs', $outputs.value, v)
            this.form.setValuesIn('$outputs', [...v])
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
                title: this.$t('dataFlow.flowEngineVersion'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                default: 'Data_Flow_Engine_V1',
                enum: [
                  {
                    label: this.$t('dataFlow.flowEngineV1'),
                    value: 'Data_Flow_Engine_V1'
                  },
                  {
                    label: this.$t('dataFlow.jetFlowEngineV2'),
                    value: 'Jet_Flow_Engine_V2'
                  }
                ]
              },
              sync_type: {
                title: '同步类型',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                // default: 'initial_sync+cdc',
                enum: [
                  {
                    label: '全量+增量',
                    value: 'initial_sync+cdc'
                  },
                  {
                    label: '全量',
                    value: 'initial_sync'
                  },
                  {
                    label: '增量',
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
                title: '启用引擎过滤',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              stopOnError: {
                title: '遇到错误停止',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
                // default: true
              },
              needToCreateIndex: {
                title: '自动创建索引',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
                // default: true
              },
              isOpenAutoDDL: {
                title: '自动处理DDL',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              noPrimaryKey: {
                title: '支持无主键同步',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              isSerialMode: {
                title: '增量数据处理机制',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: '批量',
                    value: false
                  },
                  {
                    label: '逐条',
                    value: true
                  }
                ]
              },
              cdcFetchSize: {
                title: '增量批次读取条数',
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
                title: '去重写入机制',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: this.$t('dataFlow.setting.intellect'),
                    value: 'intellect'
                  },
                  {
                    label: this.$t('dataFlow.setting.compel'),
                    value: 'compel'
                  }
                ]
                // default: 'intellect'
              },
              emailWaring: {
                title: '发送邮件',
                type: 'object',
                'x-decorator': 'FormItem',
                properties: {
                  paused: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: '当任务停止'
                      }
                    }
                  },
                  error: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: '当任务出错'
                      }
                    }
                  },
                  edited: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: '当任务被编辑'
                      }
                    }
                  },
                  started: {
                    type: 'boolean',
                    'x-component': 'Checkbox',
                    'x-component-props': {
                      option: {
                        label: '当任务开启'
                      }
                    }
                  }
                }
              },
              readShareLogMode: {
                title: '共享增量读取的模式',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: '流式读取',
                    value: 'STREAMING'
                  },
                  {
                    label: '轮询读取',
                    value: 'POLLING'
                  }
                ]
                // default: 'STREAMING'
              },
              increment: {
                title: '自动创建索引',
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
                title: '定期调度任务',
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
                  placeholder: '请输入调度表达式'
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
                title: '增量同步间隔',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  append: 'ms'
                }
              },
              readBatchSize: {
                title: '每次读取数量',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-content': {
                  append: 'row'
                }
                // default: 100
              },
              processorConcurrency: {
                title: '处理器线程数',
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
                title: '增量同步并发写入',
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
                title: '目标写入线程数',
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
                title: '增量采集开始时刻',
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
                              placeholder: '请选择'
                            },
                            enum: [
                              {
                                label: this.$t('dataFlow.SyncInfo.localTZType'),
                                value: 'localTZ'
                              },
                              {
                                label: this.$t('dataFlow.SyncInfo.connTZType'),
                                value: 'connTZ'
                              },
                              {
                                label: this.$t('dataFlow.SyncInfo.currentType'),
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
                title: '共享挖掘日志过滤',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              maxTransactionLength: {
                title: '事务最大时长(小时)',
                type: 'number',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber'
              },
              lagTime: {
                title: '增量滞后判断时间设置(秒)',
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

    // 更新节点属性
    updateNodeProps: debounce(function (form) {
      if (!this.node) return
      const formValues = JSON.parse(JSON.stringify(form.values))
      // const formValues = { ...form.values }
      const filterProps = ['id', 'isSource', 'isTarget', 'attrs.position', 'sourceNode', '$inputs', '$outputs'] // 排除属性的更新
      filterProps.forEach(path => {
        Path.setIn(formValues, path, undefined)
      })

      this.updateNodeProperties({
        id: this.node.id,
        properties: JSON.parse(JSON.stringify(formValues))
      })
      this.updateDag()
      this.confirmNodeHasError()
    }, 100),

    // 绑定表单事件
    useEffects() {
      onFormValuesChange(form => {
        if (this.stateIsReadonly) return
        console.groupCollapsed(`🚗onFormValuesChange:${Date.now()}`) // eslint-disable-line
        console.trace(JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
        console.groupEnd()
        this.updateNodeProps(form)
      })
      onFormInputChange(form => {
        if (this.stateIsReadonly) return
        console.log('onFormInputChange', JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
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
