<template>
  <div class="attr-panel">
    <div class="attr-panel-body overflow-auto">
      <Form :form="form" :colon="false" layout="vertical" feedbackLayout="terse">
        <FormProvider v-if="!!schema" :form="form">
          <SchemaField :schema="schema" :scope="scope" />
        </FormProvider>
      </Form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import * as components from 'web-core/components/form'
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
  FormGrid,
  ArrayTabs,
  FormLayout,
  ArrayItems
} from '@formily/element'
import { createForm, onFormInputChange, onFormValuesChange } from '@formily/core'
import { action } from '@formily/reactive'
import { validateBySchema } from 'web-core/components/form/utils/validate'
import ConnectionsApi from 'web-core/api/Connections'
import MetadataApi from 'web-core/api/MetadataInstances'
// import 'web-core/components/form/styles/index.scss'

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
    ArrayTabs,
    FormLayout,
    ArrayItems,
    ...components
  }
})

const connections = new ConnectionsApi()
const metadataApi = new MetadataApi()

export default {
  name: 'FormPanel',

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

        /**
         * 加载源节点的schema, 返回的是二维数组，数组的长度取决于源节点的个数
         * @param field
         * @param dataType 数据类型 array | object
         * @returns {Promise<{}>}
         */
        loadSourceNodeField: async (field, dataType = 'array') => {
          // eslint-disable-next-line no-console
          const id = field.form.values.id
          const allEdges = this.$store.getters['dataflow/allEdges']
          const sourceArr = allEdges.filter(({ target }) => target === id)
          if (!sourceArr.length) return
          // eslint-disable-next-line no-console
          console.log('loadSourceNodeField🚗', id, sourceArr, field.form.values)
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
        }
      }
    }
  },

  components: { Form, FormProvider, SchemaField },

  computed: {
    ...mapState('dataflow', ['activeNodeId', 'transformStatus']),

    ...mapGetters('dataflow', ['activeNode', 'nodeById', 'activeConnection', 'activeType', 'hasNodeError', 'allEdges']),

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
      const node = this.activeNode
      const formSchema = this.$store.getters['dataflow/formSchema'] || {}
      /*if (this.lastActiveNodeType === node.type) {
        // 判断上一次的激活节点类型，相同表示schema也一样，不需要重置form
        if (this.lastActiveDBType !== node.databaseType) {
          await this.form.reset() // 将表单重置，防止没有设置default的被覆盖；这里有个问题：子级别的default被清空无效了
        }
        console.log('setValue', node)
        this.form.setValues(node) // 新填充
      } else {
        await this.setSchema(this.ins.formSchema || formSchema.node)
      }*/
      await this.setSchema(this.ins.formSchema || formSchema.node)

      this.lastActiveNodeType = node.type // 缓存节点类型
      this.lastActiveDBType = node.databaseType
      this.hasNodeError(n) && this.form.validate()

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
        // console.log('上一个激活的节点校验结果', result)
      }
    },

    // 监听连线变动
    'allEdges.length'() {
      if (!this.node) return
      // eslint-disable-next-line no-console
      console.log('开始设置isSource， isTarget', this.form.getFieldState('isSource'), this.form.query('isSource'))
      if (this.form.getFieldState('isSource')) {
        // 节点关心isSource
        this.form.setFieldState('isSource', state => {
          state.value = this.allEdges.some(({ source }) => source === this.node.id)
        })
      }
      if (this.form.getFieldState('isTarget')) {
        // 节点关心isTarget
        this.form.setFieldState('isTarget', state => {
          state.value = this.allEdges.some(({ target }) => target === this.node.id)
        })
      }
      if (this.form.getFieldState('sourceNode')) {
        // 节点关心sourceNode
        this.form.setFieldState('sourceNode', state => {
          this.scope.getSourceNode(state)
          /*const id = this.node.id
          const edges = this.$store.getters['dataflow/allEdges']
          const nodes = this.$store.getters['dataflow/allNodes']
          const sourceArr = edges.filter(({ target }) => target === id)
          state.value = sourceArr.map(({ source }) => {
            return {
              value: source,
              label: nodes.find(node => node.id === source).name
            }
          })*/
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
        values: values || this.node,
        effects: this.useEffects,
        editable: !this.isMonitor
      })
      this.schema = JSON.parse(JSON.stringify(schema))
    },

    // 更新节点属性
    updateNodeProps(form) {
      const filterProps = ['id', 'isSource', 'isTarget'] // 排除属性的更新
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
        console.log('onFormInputChange', JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
        this.$nextTick(() => {
          this.updateNodeProps(form)
          this.updateDag()
        })
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
