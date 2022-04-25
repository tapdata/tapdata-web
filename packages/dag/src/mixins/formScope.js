import { Connections, MetadataInstances } from '@daas/api'
import { action } from '@formily/reactive'
import { mapGetters, mapState } from 'vuex'
import { isPlainObj } from '@daas/shared'
import { merge } from 'lodash'

const connections = new Connections()
const metadataApi = new MetadataInstances()

export default {
  data() {
    return {
      scope: {
        $index: null, // 数组索引，防止使用该值，在表单校验(validateBySchema)时出错

        findNodeById: id => {
          return this.$store.state.dataflow.NodeMap[id]
        },

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
            service({ field }, ...serviceParams).then(
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
         * 可配置的异步加载
         * @param config
         * @param serviceParams
         * @returns {(function(*): void)|*}
         */
        useAsyncDataSourceByConfig: (config, ...serviceParams) => {
          // withoutField: 不往service方法传field参数
          const { service, fieldName = 'dataSource', withoutField = false } = config
          return field => {
            field.loading = true
            let fetch = withoutField ? service(...serviceParams) : service(field, ...serviceParams)
            fetch.then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },

        useRemoteQuery: (service, fieldName = 'dataSource', ...serviceParams) => {
          return field => {
            const handle = keyword => {
              field.loading = true
              service({ field, keyword }, ...serviceParams).then(
                action.bound(data => {
                  if (fieldName === 'value') {
                    field.setValue(data)
                  } else field[fieldName] = data
                  field.loading = false
                })
              )
            }

            if (!field.componentProps.remoteMethod) {
              field.setComponentProps({
                remoteMethod: value => {
                  handle(value)
                }
              })
            }
            handle()
          }
        },

        /**
         * 加载数据库
         * @param field
         * @param databaseType 数据库类型，String或Array
         * @returns {Promise<*[]|*>}
         */
        loadDatabase: async ({ field }, databaseType = field.form.values.databaseType) => {
          try {
            const { isSource, isTarget } = field.form.values
            const filter = {
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
            }

            // 过滤连接类型
            if (isSource && isTarget) {
              filter.where.connection_type = 'source_and_target'
            } else if (isSource) {
              filter.where.connection_type = {
                like: 'source',
                options: 'i'
              }
            } else if (isTarget) {
              filter.where.connection_type = {
                like: 'target',
                options: 'i'
              }
            }

            let result = await connections.get({
              filter: JSON.stringify(filter)
            })
            return (result.items || result).map(item => {
              return {
                id: item.id,
                name: item.name,
                label: `${item.name} (${this.$t('connection.status.' + item.status) || item.status})`,
                value: item.id,
                databaseType: item.database_type,
                connectionType: item.connection_type
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
        loadDatabaseInfo: async ({ field }, connectionId = field.query('connectionId').get('value')) => {
          if (!connectionId) return
          return await connections.customQuery([connectionId], {
            schema: true
          })
        },

        /**
         * 加载数据库的表，只返回表名的集合
         * @param field
         * @param keyword
         * @param connectionId
         * @returns {Promise<*|AxiosResponse<any>>}
         */
        loadDatabaseTable: async ({ field, keyword }, connectionId = field.query('connectionId').get('value')) => {
          if (!connectionId) return
          const filter = {
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
          }

          if (keyword) {
            filter.where.original_name = {
              like: keyword,
              options: 'i'
            }
          }

          const data = await metadataApi.get({ filter: JSON.stringify(filter) })
          return data.items.map(item => item.original_name)
        },

        loadDatabases: async filter => {
          try {
            const { isSource, isTarget } = filter
            const _filter = {
              where: {},
              fields: {
                name: 1,
                id: 1,
                database_type: 1,
                connection_type: 1,
                status: 1
              },
              order: ['status DESC', 'name ASC']
            }
            // 过滤连接类型
            if (isSource && isTarget) {
              _filter.where.connection_type = 'source_and_target'
            } else if (isSource) {
              _filter.where.connection_type = {
                like: 'source',
                options: 'i'
              }
            } else if (isTarget) {
              _filter.where.connection_type = {
                like: 'target',
                options: 'i'
              }
            }
            let result = await connections.get({
              filter: JSON.stringify(merge(filter, _filter))
            })

            result.items = result.items.map(item => {
              return {
                id: item.id,
                name: item.name,
                label: `${item.name} (${this.$t('connection.status.' + item.status) || item.status})`,
                value: item.id,
                databaseType: item.database_type,
                connectionType: item.connection_type
              }
            })

            return result
          } catch (e) {
            console.log('catch', e) // eslint-disable-line
            return { items: [], total: 0 }
          }
        },

        loadTable: async (filter, config) => {
          filter.where &&
            Object.assign(filter.where, {
              meta_type: {
                in: ['collection', 'table', 'view'] //,
              },
              is_deleted: false
            })
          Object.assign(filter, {
            fields: {
              original_name: true
            }
          })
          if (!filter.where.original_name) {
            filter.where.original_name = {
              // regexp: '^[^\\s]+$'
              neq: ''
            }
          }
          const data = await metadataApi.get({ filter: JSON.stringify(filter) }, config)
          data.items = data.items.map(item => item.original_name)
          return data
        },

        useHandleWithForm: (handle, form) => {
          return (...args) => {
            handle(form, ...args)
          }
        },

        handlerSyncDatabaseChange: (form, item) => {
          const field = form.query('grid.leftCell.connectionIdWrap.clipboardButton').take()
          field.setComponentProps({
            content: item.name
          })
          const connectionType = form.getValuesIn('attrs.connectionType')
          if (connectionType !== item.connectionType) {
            form.setValuesIn('attrs.connectionType', item.connectionType)
          }
        },

        /**
         * 加载表的详情，返回表的数据对象
         * @param field
         * @param connectionId
         * @param tableName
         * @returns {Promise<AxiosResponse<any>>}
         */
        loadTableInfo: async (
          { field },
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
          { field },
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
        loadCollections: async ({ field }, connectionId = field.query('connectionId').get('value')) => {
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

        getSourceNode: field => {
          const id = field.form.values.id
          const edges = this.$store.getters['dataflow/allEdges']
          const nodes = this.$store.getters['dataflow/allNodes']
          const sourceArr = edges.filter(({ target }) => target === id)
          field.value = sourceArr.map(({ source }) => {
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
        loadSourceNodeField: async ({ field }, dataType = 'array') => {
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
            return result.reduce((arr, [item]) => {
              if (item.fields) {
                arr.push(item.fields)
              }
              return arr
            }, [])
          }
          const data = {}
          result.forEach(([item], i) => {
            if (item) data[sourceArr[i].source] = item.fields
          })
          return data
        },

        /**
         * 加载节点的字段选项列表
         * @param nodeId
         * @returns {Promise<{}|*>}
         */
        loadNodeFieldOptions: async nodeId => {
          const fields = await this.scope.loadNodeFieldsById(nodeId)
          return fields.map(item => ({
            label: item.field_name,
            value: item.field_name,
            isPrimaryKey: item.primary_key_position > 0
          }))
        },

        /**
         * 加载节点的字段名列表（默认是第一个源节点）
         * @param field
         * @param nodeId
         * @returns {Promise<{}|*>}
         */
        loadNodeFieldNames: async ({ field }, nodeId, defaultValueType) => {
          if (!nodeId) {
            const id = field.form.values.id
            const allEdges = this.$store.getters['dataflow/allEdges']
            const edge = allEdges.find(({ target }) => target === id)
            if (!edge) return
            nodeId = edge.source
          }

          let fields = await this.scope.loadNodeFieldsById(nodeId)
          let primaryKeys = []
          let result = []
          for (let i = 0; i < fields.length; i++) {
            const f = fields[i]
            if (f.primary_key_position > 0) {
              primaryKeys.push(f.field_name)
            }
            result.push(f.field_name)
          }
          if (field.value && !field.value.length && defaultValueType === 'primaryKey') {
            field.setInitialValue(primaryKeys)
            field.validate()
          }

          return result
        },
        getMergeItemsFromSourceNode(field, inputs) {
          let mergeList = field.value || []
          let list = []
          inputs.forEach(sourceId => {
            let item = mergeList.find(mit => mit.sourceId === sourceId)
            if (!item) {
              list.push({
                tableName: null,
                sourceId,
                mergeType: 'updateOrInsert',
                tablePath: '',
                joinKeys: []
              })
            } else {
              list.push(item)
            }
          })
          field.value = list
        },

        /**
         * 获取源节点的字段，和sourceNode搭配使用
         * @param field
         * @param nodeId
         * @returns {Promise<*[]>}
         */
        loadSourceNodeFieldNames: async ({ field }, nodeId) => {
          const sourceNode = field.query('sourceNode').get('value')

          if (!sourceNode?.length) return []

          nodeId = sourceNode[0].value

          try {
            const data = await metadataApi.nodeSchema(nodeId)
            return (data?.[0]?.fields || []).map(item => item.field_name)
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('nodeSchema', e)
            return []
          }
        },

        /**
         * 返回的是字符串数组
         * @param nodeId
         * @returns {Promise<*>}
         */
        loadNodeFieldNamesById: async nodeId => {
          const fields = await this.scope.loadNodeFieldsById(nodeId)
          return fields.map(item => item.field_name)
        },

        /**
         * 返回的是数组包对象
         * @param nodeId
         * @returns {Promise<*|*[]>}
         */
        loadNodeFieldsById: async nodeId => {
          if (!nodeId) return []
          try {
            const data = await metadataApi.nodeSchema(nodeId)
            const fields = data?.[0]?.fields || []
            fields.sort((a, b) => {
              const aIsPrimaryKey = a.primary_key_position > 0
              const bIsPrimaryKey = b.primary_key_position > 0

              if (aIsPrimaryKey !== bIsPrimaryKey) {
                return aIsPrimaryKey ? -1 : 1
              } else {
                return a.field_name.localeCompare(b.field_name)
              }
            })
            return fields
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('nodeSchema', e)
            return []
          }
        },

        loadNodeFieldsPrimaryKey: async ({ field }, nodeId) => {
          if (!nodeId) return []
          try {
            const data = await metadataApi.nodeSchema(nodeId)
            const fields = data?.[0]?.fields || []
            const keyMap = {}
            fields.sort((a, b) => {
              const aIsPrimaryKey = a.primary_key_position > 0
              const bIsPrimaryKey = b.primary_key_position > 0

              aIsPrimaryKey && (keyMap[a.field_name] = true)
              bIsPrimaryKey && (keyMap[b.field_name] = true)

              if (aIsPrimaryKey !== bIsPrimaryKey) {
                return aIsPrimaryKey ? -1 : 1
              } else {
                return a.field_name.localeCompare(b.field_name)
              }
            })
            console.log('keyMap', keyMap) // eslint-disable-line
            field.setState({
              dataSource: Object.keys(keyMap)
            })
            return fields.map(item => item.field_name)
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('nodeSchema', e)
            return []
          }
        },

        /**
         * 在dag更新接口请求完之后运行
         * @param service
         * @param fieldName
         * @param serviceParams
         * @returns {(function(*): void)|*}
         */
        useAfterPatchAsyncDataSource: (service, fieldName = 'dataSource', ...serviceParams) => {
          let withoutField
          if (isPlainObj(service)) {
            // 第一个参数是个对象配置
            let config = service
            serviceParams.unshift(fieldName)
            service = config.service
            fieldName = config.fieldName || 'dataSource'
            withoutField = config.withoutField // 不往service方法传递field对象
          }

          return field => {
            field.loading = true
            let watcher
            let callback = () => {
              const fetch = withoutField ? service(...serviceParams) : service({ field }, ...serviceParams)
              fetch.then(
                action.bound(data => {
                  if (fieldName === 'value') {
                    field.setValue(data)
                  } else field[fieldName] = data
                  field.loading = false
                })
              )
            }
            if (this.stateIsReadonly) {
              watcher?.()
              callback()
            } else {
              watcher = this.$watch('editVersion', () => {
                watcher()
                callback()
              })
            }
          }
        }
      }
    }
  },

  computed: {
    ...mapState('dataflow', ['editVersion']),
    ...mapGetters('dataflow', ['stateIsReadonly'])
  }
}
