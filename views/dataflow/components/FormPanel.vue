<template>
  <div class="attr-panel">
    <div class="attr-panel-body overflow-auto">
      <Form
        :form="form"
        :colon="false"
        layout="vertical"
        label-align="left"
        feedbackLayout="terse"
        @autoSubmit="log"
        @autoSubmitFailed="log"
      >
        <FormProvider v-if="schema" :form="form">
          <SchemaField
            :schema="schema"
            :scope="{
              useAsyncDataSource,
              loadDatabase,
              loadDatabaseInfo,
              loadDatabaseTable,
              loadTableField,
              loadTableInfo,
              loadCollections,
              loadDropOptions,
              loadWriteModelOptions,
              sourceNode,
              sourceConnectionId: sourceNode ? sourceNode.connectionId : null
            }"
          />
        </FormProvider>
      </Form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ConnectionsApi from 'web-core/api/Connections'
import MetadataApi from 'web-core/api/MetadataInstances'
import * as components from 'web-core/components/form'
import { action } from '@formily/reactive'
import { createSchemaField, FormProvider } from '@formily/vue'
import {
  Form,
  FormItem,
  FormTab,
  PreviewText,
  ArrayTable,
  Switch,
  Input,
  InputNumber,
  Checkbox,
  Radio,
  Space,
  FormGrid
} from '@formily/element'
import { createForm, onFormInputChange, onFormValuesChange } from '@formily/core'
import 'web-core/components/form/styles/index.scss'

const { SchemaField } = createSchemaField({
  components: {
    FormItem,
    FormTab,
    ArrayTable,
    PreviewText,
    Switch,
    Input,
    InputNumber,
    Checkbox,
    Radio,
    Space,
    FormGrid,
    ...components
  }
})

const connections = new ConnectionsApi()
const metadataApi = new MetadataApi()

export default {
  name: 'FormPanel',

  props: {
    isMonitor: Boolean
  },

  data() {
    return {
      form: createForm(),

      schema: null,

      lastActiveKey: null,

      lastActiveNodeType: null
    }
  },

  components: { Form, FormProvider, SchemaField },

  computed: {
    ...mapGetters('dataflow', ['activeNode', 'nodeById', 'activeConnection', 'activeType']),

    node() {
      return this.activeConnection ? this.nodeById(this.activeConnection.targetId) : this.activeNode
    },

    sourceNode() {
      return this.activeConnection ? this.nodeById(this.activeConnection.sourceId) : null
    },

    ins() {
      return this.node?.__Ctor
    },

    // 联合唯一key,用来做监听，切换schema
    uniteKey() {
      console.log('activeType', this.activeType, this.node) // eslint-disable-line
      return `${this.node?.id || ''}_${this.activeConnection?.sourceId || ''}_${this.activeType}`
    },

    formProps() {
      const props = {
        size: 'mini',
        labelPosition: 'top'
      }

      if (this.activeType === 'settings') {
        props.labelPosition = 'right'
        props.labelWidth = '162px'
      }

      return props
    }
  },

  watch: {
    // 切换节点和连线的FormSchema
    uniteKey: {
      immediate: true,
      async handler() {
        if (this.activeType && this.lastActiveKey !== this.uniteKey) {
          // this.activeType 存在表示显示Panel, this.lastActiveKey !== this.uniteKey 表示不同的节点切换
          const formSchema = this.$store.getters['dataflow/formSchema'] || {}
          switch (this.activeType) {
            case 'node':
              if (this.lastActiveNodeType === this.node.type) {
                // 判断上一次的激活节点类型，相同表示schema也一样，不需要重置form
                await this.form.reset() // 将表单重置，防止没有设置default的被覆盖；这里有个问题：子级别的default被清空无效了
                this.form.setValues(this.node) // 新填充
              } else {
                await this.setSchema(this.ins.formSchema || formSchema.node)
              }
              this.lastActiveNodeType = this.node?.type // 缓存
              this.watchInputAndOutput()
              break
            case 'connection':
              await this.setSchema(this.ins.linkFormSchema || formSchema.link)
              this.lastActiveNodeType = null
              break
            case 'settings':
              console.log('this.getSettingSchema()', this.getSettingSchema()) // eslint-disable-line
              await this.setSchema(this.getSettingSchema(), this.$store.getters['dataflow/dataflowSettings'])
              this.lastActiveNodeType = null
              break
          }
          this.lastActiveKey = this.uniteKey // 缓存
        } else if (!this.activeType) {
          // 关闭Panel
          this.unWatchInputAndOutput()
        } else if (this.lastActiveKey === this.uniteKey && this.activeType === 'node') {
          // 如果是相同节点，切换激活状态需要同步上下游
          this.form.setValuesIn('inputLanes', this.node.inputLanes)
          this.form.setValuesIn('outputLanes', this.node.outputLanes)
          this.watchInputAndOutput()
        }
      }
    }
  },

  beforeDestroy() {
    this.form.onUnmount()
  },

  methods: {
    ...mapMutations('dataflow', ['setNodeValue', 'updateNodeProperties', 'setDataflowSettings']),

    // 设置schema
    async setSchema(schema, values) {
      console.log('setSchema!!!!!***', schema)
      this.schema = null

      await this.$nextTick()

      this.form = createForm({
        values: values || this.node,
        effects: this.useEffects,
        editable: !this.isMonitor
      })
      this.schema = schema
    },

    getSettingSchema() {
      return {
        type: 'object',
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
            title: '自动创建索引',
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
            'x-decorator': 'ElFormItem',
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
    },

    // 更新节点属性
    updateNodeProps(form) {
      const filterProps = ['position', 'id'] // 排除属性的更新
      this.updateNodeProperties({
        id: this.node.id,
        properties: JSON.parse(
          JSON.stringify(form.values, (key, value) => (filterProps.includes(key) ? undefined : value))
        )
      })
    },

    // 绑定表单事件
    useEffects() {
      onFormValuesChange(form => {
        console.log('onFormValuesChange', JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
      })
      onFormInputChange(form => {
        console.log('onFormInputChange') // eslint-disable-line
        this.$nextTick(() => {
          if (this.activeType !== 'settings') {
            this.updateNodeProps(form)
          } else {
            this.setDataflowSettings(JSON.parse(JSON.stringify(form.values)))
          }
        })
      })
    },

    /**
     * 统一的异步数据源方法
     * @param service
     * @param fieldName 数据设置指定的字段
     * @param serviceParams 缺省参数，传递给service方法
     * @returns {(function(*=): void)|*}
     */
    useAsyncDataSource(service, fieldName = 'dataSource', ...serviceParams) {
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
    async loadDatabase(field, databaseType = field.form.values.databaseType) {
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
    async loadDatabaseInfo(field, connectionId = field.query('connectionId').get('value')) {
      if (!connectionId) return
      let result = await connections.customQuery([connectionId], {
        schema: true
      })
      return result
    },

    /**
     * 加载数据库的表，只返回表名的集合
     * @param field
     * @param connectionId
     * @returns {Promise<*|AxiosResponse<any>>}
     */
    async loadDatabaseTable(field, connectionId = field.query('connectionId').get('value')) {
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
      const tables = await metadataApi.get(params)
      return tables.map(item => item.original_name)
    },

    /**
     * 加载表的详情，返回表的数据对象
     * @param field
     * @param connectionId
     * @param tableName
     * @returns {Promise<AxiosResponse<any>>}
     */
    async loadTableInfo(
      field,
      connectionId = field.query('connectionId').get('value'),
      tableName = field.query('tableName').get('value')
    ) {
      if (!connectionId || !tableName) return
      console.log('loadTableInfo', field, id) // eslint-disable-line
      const params = {
        filter: JSON.stringify({
          where: {
            'source.id': connectionId,
            original_name: tableName,
            is_deleted: false
          }
        })
      }
      const table = await metadataApi.get(params)
      return table
    },

    /**
     * 加载表字段，返回字段名的集合
     * @param field
     * @param connectionId
     * @param tableName
     * @returns {Promise<*>}
     */
    async loadTableField(
      field,
      connectionId = field.query('connectionId').get('value'),
      tableName = field.query('tableName').get('value')
    ) {
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
      const tableData = await metadataApi.findOne(params)
      return tableData.fields.map(item => item.field_name)
    },

    // 加载数据集
    async loadCollections(field, connectionId = field.query('connectionId').get('value')) {
      if (!connectionId) return
      let result = await connections.get([connectionId])
      const tables = result.data?.schema?.tables || []
      return tables
    },

    /**
     * 对目标端已存在的结构和数据的处理，下拉选项
     * @param field
     */
    loadDropOptions(field) {
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
    loadWriteModelOptions(field) {
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

    log(value) {
      // eslint-disable-next-line no-console
      console.log('Form', value)
    },

    /**
     * 构建监听方法
     * @param type
     */
    buildInputOrOutWatch(type) {
      this.form.getFieldState(type) &&
        this.stopWatchInputAndOutput.push(
          this.$watch(`node.${type}`, (n /*, o*/) => {
            // console.log('🚗buildInputOrOutWatch', type, n, o)
            // 输入输出发生变化，同步给form
            // const nStr = n ? (Array.isArray(n) ? n.join(',') : n) : ''
            // const oStr = o ? (Array.isArray(o) ? o.join(',') : o) : ''

            if (/*nStr !== oStr && */ this.form.getFieldState(type)) {
              // console.log('🚗buildInputOrOutWatch', type, '可以同步')
              this.form.setValuesIn(type, n)
            }
          })
        )
    },

    /**
     * 监听inputLanes和outputLanes
     */
    watchInputAndOutput() {
      // console.log('watchInputAndOutput')
      this.stopWatchInputAndOutput?.length && this.unWatchInputAndOutput()
      this.stopWatchInputAndOutput = []
      this.buildInputOrOutWatch('inputLanes')
      this.buildInputOrOutWatch('outputLanes')
    },

    /**
     * 取消监听inputLanes和outputLanes
     */
    unWatchInputAndOutput() {
      if (!this.stopWatchInputAndOutput?.length) return
      this.stopWatchInputAndOutput.forEach(fn => fn())
      this.stopWatchInputAndOutput = []
    }
  }
}
</script>

<style lang="scss" scoped>
$radius: 4px;
$headerH: 48px;
$padding: 16px;
//$headerBg: #f5f7fa;
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
    .el-form {
      &-item {
        margin-bottom: 10px;

        &__label {
          line-height: 30px;
          //padding: 0;
          font-size: 12px;
        }

        .el-checkbox__label,
        .el-radio__label,
        .el-switch__label {
          font-size: 12px;
        }

        &__content {
          //width: 100%;
          line-height: 30px;

          .el-select {
            width: 100%;
          }

          .el-input__inner {
            width: 100%;
            height: 30px;
            line-height: 30px;
            //border-radius: $radius; //TODO: 和drs不兼容，后面需要统一样式
          }

          //TODO: 和drs不兼容，后面需要统一样式
          // .ElButton--mini,
          // .ElButton--small {
          //border-radius: $radius;
          // }

          .el-input__inner::-webkit-input-placeholder {
            font-size: 12px;
          }

          .el-textarea__inner {
            font-size: 12px;
          }

          .el-input__icon {
            line-height: 30px;
          }
        }
      }
    }

    .e-form {
      height: 100%;
      .database-tableBox {
        padding-top: 10px;
        height: calc(100% - 140px);
        box-sizing: border-box;
        .box-text {
          display: flex;
          padding-bottom: 10px;
          justify-content: space-between;
          font-size: 12px;
          color: #333;
          h3 {
            color: #606266;
          }
          .box-btn {
            color: #48b6e2;
            cursor: pointer;
            .e-button {
              padding: 4px 10px;
              color: #666;
              background-color: #f5f5f5;
            }
          }
        }
      }
    }

    .el-form-item {
      position: relative;
      margin-bottom: 10px;
    }

    .database-info {
      .info-box {
        padding: 10px 20px;
        box-sizing: border-box;
        overflow: hidden;
        font-size: 12px;
        color: #666;
        border: 1px solid #dedee4;
        li {
          padding-bottom: 8px;
        }
        .label {
          display: inline-block;
          width: 100px;
          text-align: right;
          color: #999;
        }
        .text {
          padding-left: 10px;
        }
      }
      .info-table {
        margin-top: 10px;
        border: 1px solid #dedee4;
        &-header {
          height: 28px;
          padding: 0 10px;
          line-height: 28px;
          font-size: 12px;
          color: #333;
          border-bottom: 1px solid #dedee4;
          background-color: $headerBg;
          span {
            color: #999;
          }
        }
        .table-box {
          overflow-y: auto;
        }
        .list-item {
          width: 100%;
          height: 36px;
          line-height: 36px;
          margin: 0 !important;
          padding: 0 15px;
          font-size: 12px;
          overflow: hidden;
          box-sizing: border-box;
          .iconfont {
            color: #4aaf47;
          }

          &:hover {
            background-color: #f0f7ff;

            .list-item-text {
              color: map-get($color, primary);
            }

            .el-checkbox {
              opacity: 1;
              visibility: visible;
            }

            .el-button--text {
              opacity: 1;
              visibility: visible;
            }
          }
        }
      }
    }

    .database-tableBox {
      .el-checkbox__label {
        height: 30px;
        font-size: 12px !important;
        padding-right: 6px;
      }
      .el-transfer {
        height: 640px;
        .el-transfer-panel {
          width: 298px;
          .el-transfer-panel__body {
            .box {
              display: inline-block;
              .nameStyle {
                display: none;
                color: #48b6e2;
                float: right;
                font-size: 12px;
                padding-left: 10px;
              }
              .text {
                width: 230px;
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
          .el-transfer-panel__header {
            height: 28px;
            line-height: 28px;
            background: #f5f5f5;
            .el-checkbox {
              height: 28px;
              line-height: 28px;
              overflow: hidden;
            }
          }
          .el-transfer-panel__filter {
            margin: 10px;
            .el-input__inner {
              border-radius: 3px;
            }
          }
          .el-transfer__button {
            border-radius: 3px;
          }
          .el-transfer__button.is-disabled,
          .el-transfer__button.is-disabled:hover {
            background-color: #f5f5f5;
          }
        }
        .el-transfer-panel:nth-child(3) {
          .el-transfer-panel__body {
            .el-transfer-panel__item .el-checkbox__label:hover {
              .box .nameStyle {
                display: block;
              }
              .active {
                color: rgb(253, 176, 28) !important;
              }
            }
          }
        }
        .el-transfer__buttons {
          padding: 0 20px;
        }
      }
      .el-transfer-panel__item:hover {
        color: #666 !important;
      }
      .transfer {
        height: calc(100% - 32px) !important;
        overflow: auto;
      }
      .el-transfer,
      .el-transfer-panel {
        height: 100% !important;
      }
      .el-transfer-panel__body {
        height: calc(100% - 38px) !important;
      }
      .el-checkbox-group {
        height: calc(100% - 32px);
        padding-bottom: 5px;
        box-sizing: border-box;
      }
      .el-transfer-panel__item {
        width: 100%;
        margin-right: 10px !important;
        box-sizing: border-box;
      }
    }

    .sync-object-item-wrap {
      .el-transfer__buttons {
        display: inline-flex;
        flex-direction: column;
        padding: 0 20px;
        .el-button {
          padding: 9px 15px;
          font-size: 12px;
          border-radius: 3px;
          &:last-child {
            margin-left: 0;
          }
        }
      }

      .el-transfer .el-transfer-panel {
        .el-transfer-panel__header {
          height: 28px;

          .el-checkbox {
            height: 28px;
            line-height: 28px;
            overflow: hidden;
          }
        }

        .el-transfer-panel__filter {
          margin: 10px;
          .el-input__inner {
            border-radius: 3px;
          }
        }
      }

      .el-checkbox__label {
        height: 30px;
        font-size: 12px !important;
        padding-right: 6px;
      }
    }

    .el-transfer {
      display: flex;
      align-items: center;

      &-panel {
        flex: 1;
      }
    }
  }
}
</style>
