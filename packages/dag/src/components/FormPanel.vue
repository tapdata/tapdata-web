<template>
  <div class="attr-panel">
    <div class="attr-panel-body overflow-auto">
      <Form class-name="form-wrap" :form="form" :colon="false" layout="horizontal" label-align="left" label-width="120">
        <SchemaField v-if="!!schema" :schema="schema" :scope="scope" />
      </Form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import * as components from '@daas/form'
import { createSchemaField } from '@formily/vue'
import { createForm, onFormInputChange, onFormValuesChange } from '@formily/core'
import { action } from '@formily/reactive'
import { validateBySchema } from '@daas/form/src/shared/validate'
import { Connections, MetadataInstances } from '@daas/api'
import { debounce } from 'lodash'

const { SchemaField } = createSchemaField({
  components: {
    ...components
  }
})

const connections = new Connections()
const metadataApi = new MetadataInstances()

export default {
  name: 'FormPanel',

  components: { Form: components.Form, SchemaField },

  data() {
    return {
      form: createForm(),

      schema: null,

      scope: {
        /**
         * 统一的异步数据源方法
         * @param service
         * @param fieldName 数据设置指定的字段
         * @param serviceParams 缺省参数，传递给service方法
         * @returns {(function(*=): void)|*}
         */
        useAsyncDataSource: (service, fieldName = 'dataSource', ...serviceParams) => {
          return field => {
            field.loading = true
            service(field, ...serviceParams).then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },

        /**
         * 加载数据库
         * @param field
         * @param databaseType 数据库类型，String或Array
         * @returns {Promise<*[]|*>}
         */
        loadDatabase: async (field, databaseType = field.form.values.databaseType) => {
          try {
            let result = await connections.get({
              filter: JSON.stringify({
                where: {
                  database_type: databaseType
                    ? {
                        $in: Array.isArray(databaseType) ? databaseType : [databaseType]
                      }
                    : {
                        $nin: ['file', 'dummy', 'gridfs', 'rest api', 'custom_connection']
                      }
                },
                fields: {
                  name: 1,
                  id: 1,
                  database_type: 1,
                  connection_type: 1,
                  status: 1
                },
                order: ['status DESC', 'name ASC']
              })
            })
            return (result.items || result).map(item => {
              return {
                id: item.id,
                name: item.name,
                label: `${item.name} (${this.$t('connection.status.' + item.status) || item.status})`,
                value: item.id,
                databaseType: item.database_type
              }
            })
          } catch (e) {
            console.log('catch', e) // eslint-disable-line
            return []
          }
        },

        /**
         * 加载数据库的详情
         * @param field
         * @param connectionId
         * @returns {Promise<AxiosResponse<any>>}
         */
        loadDatabaseInfo: async (field, connectionId = field.query('connectionId').get('value')) => {
          if (!connectionId) return
          return await connections.customQuery([connectionId], {
            schema: true
          })
        },

        /**
         * 加载数据库的表，只返回表名的集合
         * @param field
         * @param connectionId
         * @returns {Promise<*|AxiosResponse<any>>}
         */
        loadDatabaseTable: async (field, connectionId = field.query('connectionId').get('value')) => {
          if (!connectionId) return
          const params = {
            filter: JSON.stringify({
              where: {
                'source.id': connectionId,
                meta_type: {
                  in: ['collection', 'table', 'view'] //,
                },
                is_deleted: false
              },
              fields: {
                original_name: true
              }
            })
          }
          const data = await metadataApi.get(params)
          return data.items.map(item => item.original_name)
        },

        /**
         * 加载表的详情，返回表的数据对象
         * @param field
         * @param connectionId
         * @param tableName
         * @returns {Promise<AxiosResponse<any>>}
         */
        loadTableInfo: async (
          field,
          connectionId = field.query('connectionId').get('value'),
          tableName = field.query('tableName').get('value')
        ) => {
          if (!connectionId || !tableName) return
          // console.log('loadTableInfo', field, id) // eslint-disable-line
          const params = {
            filter: JSON.stringify({
              where: {
                'source.id': connectionId,
                original_name: tableName,
                is_deleted: false
              }
            })
          }
          return await metadataApi.get(params)
        },

        /**
         * 加载表字段，返回字段名的集合
         * @param field
         * @param connectionId
         * @param tableName
         * @returns {Promise<*>}
         */
        loadTableField: async (
          field,
          connectionId = field.query('connectionId').get('value'),
          tableName = field.query('tableName').get('value')
        ) => {
          if (!connectionId || !tableName) return
          const params = {
            filter: JSON.stringify({
              where: {
                'source.id': connectionId,
                original_name: tableName,
                is_deleted: false
              },
              fields: {
                fields: true
              }
            })
          }
          const data = await metadataApi.get(params)
          return data.items[0]?.fields.map(item => item.field_name) || []
          // const tableData = await metadataApi.findOne(params)
          // return tableData.fields.map(item => item.field_name)
        },

        // 加载数据集
        loadCollections: async (field, connectionId = field.query('connectionId').get('value')) => {
          if (!connectionId) return
          let result = await connections.get([connectionId])
          const tables = result.data?.schema?.tables || []
          return tables
        },

        /**
         * 对目标端已存在的结构和数据的处理，下拉选项
         * @param field
         */
        loadDropOptions: field => {
          const options = [
            {
              label: this.$t('editor.cell.link.existingSchema.keepSchema'),
              value: 'no_drop'
            },
            {
              label: this.$t('editor.cell.link.existingSchema.keepExistedData'),
              value: 'drop_data'
            }
          ]
          if (field.form.values.database_type === 'mongodb') {
            options.push({
              label: this.$t('editor.cell.link.existingSchema.removeSchema'),
              value: 'drop_schema'
            })
          }
          field.dataSource = options
        },

        /**
         * 数据写入模式
         * @param field
         */
        loadWriteModelOptions: field => {
          const options = [
            {
              label: this.$t('editor.cell.link.writeMode.append'),
              value: 'append' // insert				{source: ''} + {target: ''}  =  {source: '', target: ''}
            },
            {
              label: this.$t('editor.cell.link.writeMode.upsert'),
              value: 'upsert' // OneOne				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
            },
            {
              label: this.$t('editor.cell.link.writeMode.update'),
              value: 'update' // OneMany				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
            }
          ]
          if (field.form.values.type !== 'table') {
            // SupportEmbedArray
            options.push({
              label: this.$t('editor.cell.link.writeMode.merge_embed'),
              value: 'merge_embed' // ManyOne		{source: ''} + {target: ''}  =  {source: '', joinPath: [{target: ''}]}
            })
          }
          field.dataSource = options
        },

        isSource: field => {
          const id = field.form.values.id
          const allEdges = this.$store.getters['dataflow/allEdges']
          field.value = allEdges.some(({ source }) => source === id)
        },

        isTarget: field => {
          const id = field.form.values.id
          const allEdges = this.$store.getters['dataflow/allEdges']
          field.value = allEdges.some(({ target }) => target === id)
        },

        getSourceNode: (field, fieldName = 'value') => {
          const id = field.form.values.id
          const edges = this.$store.getters['dataflow/allEdges']
          const nodes = this.$store.getters['dataflow/allNodes']
          const sourceArr = edges.filter(({ target }) => target === id)
          field[fieldName] = sourceArr.map(({ source }) => {
            return {
              value: source,
              label: nodes.find(node => node.id === source).name
            }
          })
        },
        getTargetNode: field => {
          const id = field.form.values.id
          const edges = this.$store.getters['dataflow/allEdges']
          const nodes = this.$store.getters['dataflow/allNodes']
          const sourceArr = edges.filter(({ source }) => source === id)
          return sourceArr.map(({ target }) => {
            return {
              value: target,
              label: nodes.find(node => node.id === target).name
            }
          })
        },

        /**
         * 加载源节点的schema
         * @param field
         * @param dataType 数据类型 默认 array（二维数组） | object （key是节点ID，value是字段数组）
         * @returns {Promise<{}>}
         */
        loadSourceNodeField: async (field, dataType = 'array') => {
          const id = field.form.values.id
          const allEdges = this.$store.getters['dataflow/allEdges']
          const sourceArr = allEdges.filter(({ target }) => target === id)
          if (!sourceArr.length) return
          // eslint-disable-next-line no-console
          // console.log('loadSourceNodeField🚗', id, sourceArr, field.form.values)
          let stopWatch
          let fetch
          let result = []
          if (this.transformStatus === 'loading') {
            fetch = new Promise((resolve, reject) => {
              stopWatch = this.$watch('transformStatus', async v => {
                if (v === 'finished') {
                  const result = await Promise.all(sourceArr.map(({ source }) => metadataApi.nodeSchema(source)))
                  resolve(result)
                } else {
                  reject('推演失败')
                }
              })
            })
          } else {
            fetch = Promise.all(sourceArr.map(({ source }) => metadataApi.nodeSchema(source)))
          }

          try {
            result = await fetch
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
          }
          stopWatch?.()

          if (dataType === 'array') {
            return result.reduce((arr, item) => (item.fields && arr.push(item.fields), arr), [])
          }
          const data = {}
          result.forEach((item, i) => {
            if (item) data[sourceArr[i].source] = item.fields
          })
          return data
        },

        /**
         * 加载节点的字段选项列表（默认是第一个源节点）
         * @param field
         * @param nodeId
         * @returns {Promise<{}|*>}
         */
        loadNodeFieldOptions: async (field, nodeId) => {
          if (!nodeId) {
            const id = field.form.values.id
            const allEdges = this.$store.getters['dataflow/allEdges']
            const edge = allEdges.find(({ target }) => target === id)
            if (!edge) return
            nodeId = edge.source
          }

          let fields
          try {
            const data = await metadataApi.nodeSchema(nodeId)
            fields = data.fields
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('nodeSchema', e)
          }

          return fields
            ? fields.map(item => ({
                label: item.field_name,
                value: item.id
              }))
            : []
        },

        /**
         * 加载节点的字段名列表（默认是第一个源节点）
         * @param field
         * @param nodeId
         * @returns {Promise<{}|*>}
         */
        loadNodeFieldNames: async (field, nodeId) => {
          if (!nodeId) {
            const id = field.form.values.id
            const allEdges = this.$store.getters['dataflow/allEdges']
            const edge = allEdges.find(({ target }) => target === id)
            if (!edge) return
            nodeId = edge.source
          }

          let fields
          try {
            const data = await metadataApi.nodeSchema(nodeId)
            fields = data?.[0]?.fields || []
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('nodeSchema', e)
          }

          return fields ? fields.map(item => item.field_name) : []
        }
      }
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
      'stateIsReadonly'
    ]),

    node() {
      return this.activeConnection ? this.nodeById(this.activeConnection.targetId) : this.activeNode
    },

    sourceNode() {
      return this.activeConnection ? this.nodeById(this.activeConnection.sourceId) : null
    },

    ins() {
      return this.node?.__Ctor
    }
  },

  watch: {
    async activeNodeId(n, o) {
      const formSchema = this.$store.getters['dataflow/formSchema'] || {}

      await this.setSchema(this.ins.formSchema || formSchema.node)

      // 如果节点存在错误状态，走一遍校验，可以让用户看到错误信息
      if (this.hasNodeError(n)) {
        this.form.validate().then(() => {
          this.clearNodeError(n)
        })
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
          this.clearNodeError(o)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
          this.setNodeError(o)
        }
      }
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
    ...mapMutations('dataflow', ['setNodeValue', 'updateNodeProperties', 'setNodeError', 'clearNodeError']),

    ...mapActions('dataflow', ['updateDag']),

    // 设置schema
    async setSchema(schema, values) {
      this.schema = null

      await this.$nextTick()

      this.form = createForm({
        disabled: this.stateIsReadonly,
        values: values || this.node,
        effects: this.stateIsReadonly ? null : this.useEffects
      })
      this.schema = JSON.parse(JSON.stringify(schema))
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
      const formValues = { ...form.values }
      const filterProps = ['id', 'isSource', 'isTarget', 'attrs', 'sourceNode'] // 排除属性的更新
      filterProps.forEach(key => (formValues[key] = undefined))

      this.updateNodeProperties({
        id: this.node.id,
        properties: JSON.parse(JSON.stringify(formValues))
      })
      this.updateDag()
    }, 100),

    // 绑定表单事件
    useEffects() {
      onFormValuesChange(form => {
        console.log('onFormValuesChange', JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
        this.updateNodeProps(form)
      })
      onFormInputChange(form => {
        console.log('onFormInputChange', JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
        this.updateNodeProps(form)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$radius: 4px;
$headerH: 48px;
$padding: 16px;
$headerBg: #fff;
.attr-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  &-header {
    display: flex;
    align-items: center;
    padding: 0 $padding;
    height: $headerH;
    line-height: $headerH;
    font-size: 14px;
    //box-shadow: 0 0 4px 0 rgb(0 0 0 / 10%);
    background-color: $headerBg;

    .header-icon {
      display: inline-block;
      width: $headerH;
      height: $headerH;
      text-align: center;
      background-color: map-get($color, primary);
      cursor: pointer;
      color: #fff;
    }

    .header-txt {
      font-size: 14px;
    }
  }

  &-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: $padding;
    height: 0;

    .el-form-item.--label-w100 {
      .el-form-item__label {
        width: 100%;
      }
    }

    .el-form-item__content > .el-row {
      width: 100%;
    }
  }

  ::v-deep {
    .form-wrap {
      flex: 1;
      > form {
        height: 100%;
        > .formily-element-space {
          height: 100%;
        }
      }
    }

    // 覆盖数字输入框的宽度
    .formily-element-form-item {
      .el-input-number {
        width: 180px;
      }
      .el-input-number--small {
        width: 130px;
      }
    }
  }
}
</style>
