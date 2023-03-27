import i18n from '@tap/i18n'
import { action } from '@formily/reactive'
import { mapGetters, mapState } from 'vuex'
import { merge, isEqual } from 'lodash'
import { connectionsApi, metadataInstancesApi, clusterApi, proxyApi } from '@tap/api'
import { externalStorageApi } from '@tap/api'
import { isPlainObj } from '@tap/shared'

export default {
  data() {
    function addDeclaredCompleter(editor, tools, params1) {
      const tapType = [
        'TapNumber',
        'TapString',
        'TapBoolean',
        'TapBinary',
        'TapDate',
        'TapDateTime',
        'TapTime',
        'TapYear',
        'TapRaw',
        'TapArray',
        'TapMap'
      ]
      const fieldMethods = ['addField', 'removeField', 'updateField', 'upsertField']
      const CompleterList = [
        ...tapType.map(type => ({
          name: type,
          value: type,
          meta: 'TapType'
        })),
        ...fieldMethods.map(method => ({
          caption: `TapModelDeclare.${method}`,
          snippet: `TapModelDeclare.${method}(${params1}, '\${1}', '\${2}')`,
          parametersDesc: `${params1}, fieldName: String, type: TapType`,
          meta: 'function',
          type: 'snippet',
          originType: true
        })),
        {
          caption: `TapModelDeclare.addIndex`,
          snippet: `TapModelDeclare.addIndex(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true
        },
        {
          caption: `TapModelDeclare.removeIndex`,
          snippet: `TapModelDeclare.removeIndex(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true
        },
        {
          caption: `TapModelDeclare.setPk`,
          snippet: `TapModelDeclare.setPk(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true
        },
        {
          caption: `TapModelDeclare.setPk`,
          snippet: `TapModelDeclare.setPk(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true
        },
        {
          name: params1,
          value: params1,
          meta: 'local'
        }
      ]
      const idx = editor.completers?.findIndex(item => item.id === 'jsDeclare') || -1
      if (~idx) editor.completers.splice(idx, 1)
      tools.addCompleter({
        id: 'jsDeclare',
        getCompletions: (editor, session, pos, prefix, callback) => {
          if (prefix.length === 0) {
            return callback(null, [])
          } else {
            return callback(null, CompleterList)
          }
        }
      })
    }

    return {
      scope: {
        $index: null, // 数组索引，防止使用该值，在表单校验(validateBySchema)时出错

        $agents: [],

        $agentMap: {},

        $isDaas: process.env.VUE_APP_PLATFORM === 'DAAS', //区分云版、企业版

        $hasPdkConfig: pdkHash => {
          return !!this.$store.state.dataflow.pdkPropertiesMap[pdkHash]
        },

        findNodeById: id => {
          return this.$store.state.dataflow.NodeMap[id]
        },

        findParentNode: id => {
          let node = this.scope.findNodeById(id)
          let parentId = node.$inputs?.[0]
          let parent
          while (parentId) {
            parent = this.scope.findNodeById(parentId)
            if (!parent) {
              console.error(i18n.t('packages_dag_mixins_formscope_liuyipar'), parentId) // eslint-disable-line
            }
            parentId = parent?.$inputs?.[0]
          }
          return parent
        },

        findParentNodes: (id, ifMyself) => {
          let node = this.scope.findNodeById(id)
          const parents = []
          let parentIds = node.$inputs || []
          if (ifMyself && !parentIds.length) return [node]
          parentIds.forEach(pid => {
            let parent = this.scope.findNodeById(pid)
            if (parent) {
              if (parent.$inputs?.length) {
                parent.$inputs.forEach(ppid => {
                  parents.push(...this.scope.findParentNodes(ppid, true))
                })
              } else {
                parents.push(parent)
              }
            }
          })

          return parents

          /*let node = this.scope.findNodeById(id)
          let parentIds = node.$inputs
          let parent
          let parents = []
          if (parentIds.length > 1) {
            parentIds.forEach(pid => {
              const result = this.scope.findParentNodes(pid)
              parents.push(...result)
            })
          } else {
            let parentId = parentIds[0]
            while (parentId) {
              parent = this.scope.findNodeById(parentId)
              if (!parent) {
                console.error('留意parent找不到', parentId) // eslint-disable-line
              }
              parentId = parent?.$inputs?.[0]
            }
            if
            return parent
          }*/
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
                status: 1,
                accessNodeType: 1,
                accessNodeProcessId: 1,
                accessNodeProcessIdList: 1,
                pdkType: 1,
                pdkHash: 1,
                capabilities: 1
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
            let result = await connectionsApi.get({
              filter: JSON.stringify(merge(filter, _filter))
            })

            result.items = result.items.map(item => {
              return {
                id: item.id,
                name: item.name,
                label: `${item.name} ${
                  item.status ? `(${this.$t('packages_dag_connection_status_' + item.status) || item.status})` : ''
                }`,
                value: item.id,
                databaseType: item.database_type,
                connectionType: item.connection_type,
                accessNodeProcessId: item.accessNodeProcessId
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
              is_deleted: false,
              sourceType: 'SOURCE'
            })
          Object.assign(filter, {
            fields: {
              original_name: true
            },
            order: ['original_name ASC']
          })
          if (!filter.where.original_name) {
            filter.where.original_name = {
              // regexp: '^[^\\s]+$'
              neq: ''
            }
          }
          const data = await metadataInstancesApi.get({ filter: JSON.stringify(filter) }, config)
          data.items = data.items.map(item => item.original_name)
          const table = filter.where.original_name?.like
          if (table && !data.items.includes(table)) {
            const res = await metadataInstancesApi.checkTableExist({
              connectionId: filter.where['source.id'],
              tableName: table
            })
            if (res?.exist) {
              data.items.unshift(table)
            }
          }
          return data
        },

        loadCommandList: async (filter, val) => {
          try {
            const { $values = {}, command, where = {}, page, size } = filter
            const { nodeConfig, connectionId, attrs = {} } = $values
            const search = where.label?.like
            let params = {
              pdkHash: attrs.pdkHash,
              connectionId,
              nodeConfig,
              command,
              type: 'node',
              action: search ? 'search' : 'list',
              argMap: {
                key: search,
                page,
                size: size || 1000
              }
            }
            let result = await proxyApi.command(params)
            if (!result.items) {
              return { items: [], total: 0 }
            }
            return result
          } catch (e) {
            console.log('catch', e) // eslint-disable-line
            return { items: [], total: 0 }
          }
        },

        /**
         * 将form对象作为handle方法第一个参数
         * @param handle
         * @param form
         * @returns {(function(...[*]): void)|*}
         */
        useHandleWithForm: (handle, form) => {
          return (...args) => {
            handle(form, ...args)
          }
        },

        /**
         * 同步连接上的属性
         * @param form
         * @param item
         */
        handlerSyncDatabaseChange: (form, item) => {
          const field = form.query('connectionIdWrap.clipboardButton').take()
          field?.setComponentProps({
            content: item.name
          })
          const connectionType = form.getValuesIn('attrs.connectionType')
          const accessNodeProcessId = form.getValuesIn('attrs.accessNodeProcessId')
          const connectionName = form.getValuesIn('attrs.connectionName')

          connectionType !== item.connectionType && form.setValuesIn('attrs.connectionType', item.connectionType)
          accessNodeProcessId !== item.accessNodeProcessId &&
            form.setValuesIn('attrs.accessNodeProcessId', item.accessNodeProcessId)
          connectionName !== item.name && form.setValuesIn('attrs.connectionName', item.name)
        },

        /**
         * 加载节点的字段选项列表
         * @param nodeId
         * @returns {Promise<{}|*>}
         */
        loadNodeFieldOptions: async nodeId => {
          const fields = await this.scope.loadNodeFieldsById(nodeId)
          return fields
            .map(item => ({
              label: item.field_name,
              value: item.field_name,
              isPrimaryKey: item.primary_key_position > 0,
              indicesUnique: !!item.indicesUnique,
              type: item.data_type
            }))
            .filter(item => !item.is_deleted)
        },

        /**
         * 返回的是数组包对象
         * @param nodeId
         * @returns {Promise<*|*[]>}
         */
        loadNodeFieldsById: async nodeId => {
          if (!nodeId) return []
          try {
            await this.afterTaskSaved()
            const data = await metadataInstancesApi.nodeSchema(nodeId)
            let fields = data?.[0]?.fields || []
            const indices = (data?.[0]?.indices || []).filter(t => t.unique)
            let columns = []
            indices.forEach(el => {
              columns = [...columns, ...el.columns.map(t => t.columnName)]
            })
            fields.forEach(el => {
              if (columns.includes(el.field_name)) {
                el.indicesUnique = true
              }
            })
            return fields
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('nodeSchema', e)
            return []
          }
        },
        //传参获取远程数据
        getCommandAndSetValue: async ($form, others) => {
          const getState = $form.getState()
          const formValues = getState?.values || {}
          console.log('formValues', formValues, others)
          const { nodeId } = others
          let params = {
            nodeId
          }
          let fields = [
            {
              targetFieldName: 'form_id',
              sourceFieldName: 'form_id',
              sourceFieldType: 'INT32',
              type: 'auto',
              defaultValue: '',
              useDefaultValue: true,
              isShow: true,
              migrateType: 'system',
              primary_key_position: 0
            },
            {
              targetFieldName: 'form_version',
              sourceFieldName: 'form_version',
              sourceFieldType: 'STRING',
              type: 'auto',
              defaultValue: '',
              useDefaultValue: true,
              isShow: true,
              migrateType: 'system',
              primary_key_position: 0
            },
            {
              targetFieldName: 'id',
              sourceFieldName: 'id',
              sourceFieldType: 'INT32',
              type: 'auto',
              defaultValue: '',
              useDefaultValue: true,
              isShow: true,
              migrateType: 'system',
              primary_key_position: 1
            },
            {
              targetFieldName: 'task_id',
              sourceFieldName: 'task_id',
              sourceFieldType: 'INT32',
              type: 'auto',
              defaultValue: '',
              useDefaultValue: true,
              isShow: true,
              migrateType: 'system',
              primary_key_position: 0
            }
          ]
          $form.setValuesIn('loadSchemaTree', fields)
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
        },

        useDmlPolicy(field) {
          const capabilities = field.query('attrs.capabilities').get('value')
          let insertPolicy
          let updatePolicy
          if (capabilities) {
            insertPolicy = capabilities.find(({ id }) => id === 'dml_insert_policy')
            updatePolicy = capabilities.find(({ id }) => id === 'dml_update_policy')
          }
          const insertField = field.query('dmlPolicy.insertPolicy').take()
          const updateField = field.query('dmlPolicy.updatePolicy').take()

          const func = (policy, policyField) => {
            if (!policy || !policy.alternatives) {
              setTimeout(() => {
                policyField.setPattern('readPretty')
              }, 50)
              policyField.setValue(policyField.initialValue)
            } else {
              const values = policyField.dataSource.map(item => item.value)
              const alternatives = policy.alternatives.filter(key => values.includes(key))
              if (alternatives.length <= 1) {
                setTimeout(() => {
                  policyField.setPattern('readPretty')
                }, 50)
                policyField.setValue(alternatives[0] || policyField.initialValue)
              } else if (!field.form.disabled) {
                policyField.setPattern('editable')
              }
            }
          }

          insertField && func(insertPolicy, insertField)
          updateField && func(updatePolicy, updateField)
        },

        useSyncConnection: async field => {
          const id = field.value
          const form = field.form
          const connection = await connectionsApi.get(id)
          const connectionType = form.getValuesIn('attrs.connectionType') || ''
          const accessNodeProcessId = form.getValuesIn('attrs.accessNodeProcessId') || ''
          const connectionName = form.getValuesIn('attrs.connectionName')
          const capabilities = form.getValuesIn('attrs.capabilities')

          connectionType !== connection.connection_type &&
            form.setValuesIn('attrs.connectionType', connection.connectionType)
          accessNodeProcessId !== connection.accessNodeProcessId &&
            form.setValuesIn('attrs.accessNodeProcessId', connection.accessNodeProcessId)
          connectionName !== connection.name && form.setValuesIn('attrs.connectionName', connection.name)
          !isEqual(capabilities, connection.capabilities) &&
            form.setValuesIn('attrs.capabilities', connection.capabilities)
        },

        getPdkProperties: node => {
          const { pdkHash } = node.attrs
          return this.$store.state.dataflow.pdkPropertiesMap[pdkHash]
        },

        addDeclaredCompleterForMigrate: (editor, tools) => {
          addDeclaredCompleter(editor, tools, 'schemaApplyResultList')
        },

        addDeclaredCompleterForSync: (editor, tools) => {
          addDeclaredCompleter(editor, tools, 'tapTable')
        },

        async loadExternalStorage() {
          try {
            const { items = [] } = await externalStorageApi.get()
            return items.map(item => {
              return {
                label: item.name,
                value: item.id,
                isDefault: item.defaultStorage
              }
            })
          } catch (e) {
            return []
          }
        }
      }
    }
  },

  computed: {
    ...mapState('dataflow', ['editVersion', 'taskSaving']),
    ...mapGetters('dataflow', ['stateIsReadonly'])
  },

  async created() {
    this.scope.$settings = this.dataflow
    await this.loadAccessNode()
  },

  methods: {
    async loadAccessNode() {
      const data = await clusterApi.findAccessNodeInfo()
      this.scope.$agents = data.map(item => {
        return {
          value: item.processId,
          label: `${item.hostName}（${item.ip}）`
        }
      })
      this.scope.$agentMap = data.reduce((obj, item) => ((obj[item.processId] = item), obj), {})
    },

    /**
     * 等待任务保存完
     * @returns {Promise<unknown>}
     */
    afterTaskSaved() {
      return new Promise(resolve => {
        if (this.taskSaving) {
          this.$watch('taskSaving', () => {
            resolve()
          })
        } else {
          resolve()
        }
      })
    }
  }
}
