import { action } from '@formily/reactive'
import {
  alarmApi,
  clusterApi,
  connectionsApi,
  databaseTypesApi,
  externalStorageApi,
  metadataInstancesApi,
  proxyApi,
  taskApi,
} from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { FormTab } from '@tap/form'
import i18n from '@tap/i18n'
import { Cookie, isPlainObj } from '@tap/shared'
import axios from 'axios'
import { isEmpty, isEqual, merge } from 'lodash-es'
import { mapGetters, mapState } from 'vuex'

const editorKeyboard = {
  handleKeyboard({ editor }, hash, keyString, keyCode, event) {
    if (keyString === '.' && keyCode !== undefined) {
      setTimeout(() => {
        editor.execCommand('startAutocomplete')
      }, 10)
    }
  },
}

const getPrefix = (line, index) => {
  let prefix = ''
  let i = index - 1
  while (i >= 0 && /^\w+$/.test(line.charAt(i))) {
    prefix = line.charAt(i) + prefix
    i--
  }
  return prefix
}

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
        'TapMap',
      ]
      const fieldMethods = [
        'addField',
        'removeField',
        'updateField',
        'upsertField',
      ]
      const CompleterList = [
        ...tapType.map((type) => ({
          name: type,
          value: type,
          meta: 'TapType',
        })),
        ...fieldMethods.map((method) => ({
          caption: `TapModelDeclare.${method}`,
          snippet: `TapModelDeclare.${method}(${params1}, '\${1}', '\${2}')`,
          parametersDesc: `${params1}, fieldName: String, type: TapType`,
          meta: 'function',
          type: 'snippet',
          originType: true,
        })),
        {
          caption: `TapModelDeclare.addIndex`,
          snippet: `TapModelDeclare.addIndex(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true,
        },
        {
          caption: `TapModelDeclare.removeIndex`,
          snippet: `TapModelDeclare.removeIndex(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true,
        },
        {
          caption: `TapModelDeclare.setPk`,
          snippet: `TapModelDeclare.setPk(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true,
        },
        {
          caption: `TapModelDeclare.setPk`,
          snippet: `TapModelDeclare.setPk(${params1}, '\${1}')`,
          parametersDesc: `${params1}, fieldName: String`,
          meta: 'function',
          type: 'snippet',
          originType: true,
        },
        {
          name: params1,
          value: params1,
          meta: 'local',
        },
      ]
      const idx =
        editor.completers?.findIndex((item) => item.id === 'jsDeclare') || -1
      if (~idx) editor.completers.splice(idx, 1)
      tools.addCompleter({
        id: 'jsDeclare',
        getCompletions: (editor, session, pos, prefix, callback) => {
          if (prefix.length === 0) {
            return callback(null, [])
          } else {
            return callback(null, CompleterList)
          }
        },
      })
    }

    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

    return {
      scope: {
        $index: null, // 数组索引，防止使用该值，在表单校验(validateBySchema)时出错

        $agents: [],

        $agentMap: {},

        $alarmChannels: [], // 告警渠道

        $isDaas: isDaas, //区分云版、企业版

        $isMonitor: ['MigrationMonitor', 'TaskMonitor'].includes(
          this.$route.name,
        ),

        formTab: FormTab.createFormTab(),

        $hasPdkConfig: (pdkHash) => {
          return !!this.$store.state.dataflow.pdkPropertiesMap[pdkHash]
        },

        hasFeature: (feature) => {
          return !isDaas || this.$store.getters['feature/hasFeature']?.(feature)
        },

        findNodeById: (id) => {
          return this.$store.state.dataflow.NodeMap[id]
        },

        clearNodeError: (id) => {
          return this.$store.commit('dataflow/clearNodeError', id)
        },

        findParentNode: (id) => {
          const node = this.scope.findNodeById(id)
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
          const node = this.scope.findNodeById(id)
          const parents = []

          if (!node) return parents

          const parentIds = node.$inputs || []
          if (ifMyself && !parentIds.length) return [node]
          parentIds.forEach((pid) => {
            const parent = this.scope.findNodeById(pid)
            if (parent) {
              if (parent.$inputs?.length) {
                parent.$inputs.forEach((ppid) => {
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
        useAsyncDataSource: (
          service,
          fieldName = 'dataSource',
          ...serviceParams
        ) => {
          return (field) => {
            field.loading = true
            service({ field }, ...serviceParams).then(
              action.bound((data) => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              }),
            )
          }
        },

        useAsyncOptions: (service, ...serviceParams) => {
          return (field) => {
            field.loading = true
            service(...serviceParams).then(
              action.bound((data) => {
                field.dataSource = data
                field.loading = false
              }),
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
          const {
            service,
            fieldName = 'dataSource',
            withoutField = false,
          } = config
          return (field) => {
            field.loading = true
            const fetch = withoutField
              ? service(...serviceParams)
              : service(field, ...serviceParams)
            fetch.then(
              action.bound((data) => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              }),
            )
          }
        },

        loadDatabases: async (filter) => {
          try {
            const { isSource, isTarget } = filter
            const _filter = {
              where: {
                createType: {
                  $ne: 'System',
                },
              },
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
                capabilities: 1,
              },
              order: ['status DESC', 'name ASC'],
            }
            // 过滤连接类型
            if (isSource && isTarget) {
              _filter.where.connection_type = 'source_and_target'
            } else if (isSource) {
              _filter.where.connection_type = {
                like: 'source',
                options: 'i',
              }
            } else if (isTarget) {
              _filter.where.connection_type = {
                like: 'target',
                options: 'i',
              }
            }
            const result = await connectionsApi.get({
              filter: JSON.stringify(merge(filter, _filter)),
            })

            result.items = result.items.map((item) => {
              return {
                id: item.id,
                name: item.name,
                label: `${item.name} ${
                  item.status
                    ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})`
                    : ''
                }`,
                value: item.id,
                databaseType: item.database_type,
                connectionType: item.connection_type,
                accessNodeProcessId: item.accessNodeProcessId,
              }
            })

            return result
          } catch (error) {
            console.log('catch', error) // eslint-disable-line
            return { items: [], total: 0 }
          }
        },

        loadTable: async (filter, config) => {
          filter.where &&
            Object.assign(filter.where, {
              meta_type: {
                in: ['collection', 'table', 'view'], //,
              },
              is_deleted: false,
              sourceType: 'SOURCE',
            })
          Object.assign(filter, {
            fields: {
              original_name: true,
            },
            order: ['original_name ASC'],
          })
          if (filter.where?.value) {
            filter.where.original_name = filter.where?.value
            delete filter.where.value
          } else {
            filter.where.original_name = {
              // regexp: '^[^\\s]+$'
              neq: '',
            }
          }
          const data = await metadataInstancesApi.get(
            { filter: JSON.stringify(filter) },
            config,
          )
          data.items = data.items.map((item) => {
            return {
              label:
                item.original_name + (item.comment ? `(${item.comment})` : ''),
              value: item.original_name,
            }
          })
          const table = filter.where.original_name?.like
          if (table && !data.items.some((t) => t.value.includes(table))) {
            const res = await metadataInstancesApi.checkTableExist({
              connectionId: filter.where['source.id'],
              tableName: table,
            })
            if (res?.exist) {
              data.items.unshift({
                label: table,
                value: table,
              })
            }
          }
          return data
        },

        loadCommandList: async (filter, val) => {
          try {
            const { $values = {}, command, where = {}, page, size } = filter
            const { nodeConfig, connectionId, attrs = {} } = $values
            const search = where.label?.like
            const params = {
              pdkHash: attrs.pdkHash,
              connectionId,
              nodeConfig,
              command,
              type: 'node',
              action: search ? 'search' : 'list',
              argMap: {
                key: search,
                page,
                size: size || 1000,
              },
            }
            const result = await proxyApi.command(params)
            if (!result.items) {
              return { items: [], total: 0 }
            }
            return result
          } catch (error) {
            console.log('catch', error) // eslint-disable-line
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
            content: item.name,
          })
          const connectionType = form.getValuesIn('attrs.connectionType')
          const accessNodeProcessId = form.getValuesIn(
            'attrs.accessNodeProcessId',
          )
          const connectionName = form.getValuesIn('attrs.connectionName')

          connectionType !== item.connectionType &&
            form.setValuesIn('attrs.connectionType', item.connectionType)
          accessNodeProcessId !== item.accessNodeProcessId &&
            form.setValuesIn(
              'attrs.accessNodeProcessId',
              item.accessNodeProcessId,
            )
          connectionName !== item.name &&
            form.setValuesIn('attrs.connectionName', item.name)
        },

        /**
         * 加载节点的字段选项列表
         * @param nodeId
         * @returns {Promise<{}|*>}
         */
        loadNodeFieldOptions: async (nodeId) => {
          const fields = await this.scope.loadNodeFieldsById(nodeId)
          return fields
            .filter((item) => !item.is_deleted)
            .map((item) => ({
              label: item.field_name,
              value: item.field_name,
              isPrimaryKey: item.primary_key_position > 0,
              indicesUnique: !!item.indicesUnique,
              type: item.data_type,
              tapType: item.tapType,
              source: item.source,
            }))
        },

        loadDateFieldOptions: async (nodeId) => {
          const fields = await this.scope.loadNodeFieldsById(nodeId)
          const set = new Set()
          fields.forEach((f) => {
            const tapType = JSON.parse(f.tapType)
            if (tapType.type === 1 || tapType.type === 6) {
              set.add(f.data_type)
            }
          })
          return [...set]
        },

        useFieldDateType: (id) => {
          return (field) => {
            if (!id) {
              field.value = []
              return
            }

            field.loading = true
            this.scope.loadDateFieldOptions(id).then(
              action.bound((data) => {
                field.dataSource = data
                field.loading = false

                if (!field.value?.length) field.value = data
              }),
            )
          }
        },

        usePdkFieldDateType: () => {
          return async (field) => {
            const $values = field.form.values
            const [parent] = this.scope.findParentNodes($values.id)

            if (!parent) {
              field.value = []
              return
            }

            try {
              field.loading = true
              const pdk = await databaseTypesApi.pdkHash(parent.attrs.pdkHash)
              const expression = JSON.parse(pdk.expression)
              const dataTypes = []
              const dataTypeOptions = []

              Object.keys(expression).forEach((key) => {
                const { to } = expression[key]

                if (to === 'TapDateTime' || to === 'TapTime') {
                  dataTypes.push(key)
                  dataTypeOptions.push({
                    label: key.replace(/\[?\(\$[^\]]+\)\]?/, '(n)'),
                    value: key,
                  })
                }
              })
              const handleBatch = action.bound((value, dataSource) => {
                field.dataSource = dataSource
                field.loading = false

                if (!field.value?.length) field.value = value
              })
              handleBatch(dataTypes, dataTypeOptions)
            } catch (error) {
              field.loading = false
              console.error(error)
            }
          }
        },

        /**
         * 返回的是数组包对象
         * @param nodeId
         * @returns {Promise<*|*[]>}
         */
        loadNodeFieldsById: async (nodeId) => {
          if (!nodeId) return []
          try {
            await this.afterTaskSaved()
            const data = await metadataInstancesApi.nodeSchema(nodeId)
            const fields = data?.[0]?.fields || []
            const indices = (data?.[0]?.indices || []).filter((t) => t.unique)
            let columns = []
            indices.forEach((el) => {
              columns = [...columns, ...el.columns.map((t) => t.columnName)]
            })
            fields.forEach((el) => {
              if (columns.includes(el.field_name)) {
                el.indicesUnique = true
              }
            })
            return fields
          } catch (error) {
            console.error('nodeSchema', error)
            return []
          }
        },

        /**
         * 根据节点id，查询字段类型列表
         * 返回的是数组包对象
         * @param nodeId
         * @returns {Promise<*|*[]>}
         */
        loadNodeFieldTypesById: async (nodeId) => {
          if (!nodeId) return []
          try {
            await this.afterTaskSaved()
            const data = await metadataInstancesApi.nodeFilterTypeList({
              nodeId,
            })
            return data
          } catch (error) {
            console.error('nodeSchema', error)
            return []
          }
        },

        //传参获取远程数据
        getCommandAndSetValue: async ($form, others) => {
          const getState = $form.getState()
          const formValues = getState?.values || {}
          console.log('formValues', formValues, others)
          const { nodeId } = others
          const params = {
            nodeId,
          }
          const fields = [
            {
              targetFieldName: 'form_id',
              sourceFieldName: 'form_id',
              sourceFieldType: 'INT32',
              type: 'auto',
              defaultValue: '',
              useDefaultValue: true,
              isShow: true,
              migrateType: 'system',
              primary_key_position: 0,
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
              primary_key_position: 0,
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
              primary_key_position: 1,
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
              primary_key_position: 0,
            },
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
        useAfterPatchAsyncDataSource: (
          service,
          fieldName = 'dataSource',
          ...serviceParams
        ) => {
          let withoutField
          if (isPlainObj(service)) {
            // 第一个参数是个对象配置
            const config = service
            serviceParams.unshift(fieldName)
            service = config.service
            fieldName = config.fieldName || 'dataSource'
            withoutField = config.withoutField // 不往service方法传递field对象
          }

          return (field) => {
            field.loading = true
            let watcher
            const callback = () => {
              const fetch = withoutField
                ? service(...serviceParams)
                : service({ field }, ...serviceParams)
              fetch.then(
                action.bound((data) => {
                  if (fieldName === 'value') {
                    field.setValue(data)
                  } else field[fieldName] = data
                  field.loading = false
                }),
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

        useDmlPolicy: (field) => {
          const capabilities = field.query('attrs.capabilities').get('value')
          let insertPolicy
          let updatePolicy
          let deletePolicy

          if (capabilities) {
            insertPolicy = capabilities.find(
              ({ id }) => id === 'dml_insert_policy',
            )
            updatePolicy = capabilities.find(
              ({ id }) => id === 'dml_update_policy',
            )
            deletePolicy = capabilities.find(
              ({ id }) => id === 'dml_delete_policy',
            )
          }

          const insertField = field.query('dmlPolicy.insertPolicy').take()
          const updateField = field.query('dmlPolicy.updatePolicy').take()
          const deleteField = field.query('dmlPolicy.deletePolicy').take()
          // 查找上游是否包含Unwind节点
          const unwindNode = this.scope.findParentNodeByType(
            field.form.values,
            'unwind_processor',
          )
          const originNodeData = this.scope.findNodeById(field.form.values.id)

          const func = (policy, policyField) => {
            if (!policy || !policy.alternatives?.length) {
              setTimeout(() => {
                policyField.setState({ display: 'none' })
              }, 50)
              policyField.setValue(policyField.initialValue)
            } else {
              const values = policyField.dataSource.map((item) => item.value)
              const alternatives = policy.alternatives.filter((key) =>
                values.includes(key),
              )
              // 设置成特性中的选项
              if (alternatives.length) {
                policyField.dataSource = policyField.dataSource.filter((item) =>
                  policy.alternatives.includes(item.value),
                )
              }

              if (alternatives.length <= 1) {
                setTimeout(() => {
                  policyField.setPattern('readPretty')
                }, 50)
                policyField.setValue(
                  alternatives[0] || policyField.initialValue,
                )
              } else if (!field.form.disabled) {
                policyField.setPattern('editable')
              }

              if (unwindNode) {
                policyField.setPattern('readPretty')
                if (alternatives.includes('just_insert')) {
                  policyField.setValue('just_insert')
                  // 设置源数据，保证未访问过节点配置时，保存任务时校验unwind节点和目标的dmlPolicy.insertPolicy是否等于just_insert的判断通过
                  originNodeData.dmlPolicy = {
                    ...policyField.form.values.dmlPolicy,
                  }
                }
              }
            }
          }

          insertField && func(insertPolicy, insertField)
          updateField && func(updatePolicy, updateField)
          deleteField && func(deletePolicy, deleteField)

          if (
            !insertField?.visible &&
            !updateField?.visible &&
            !deleteField?.visible
          ) {
            deleteField?.parent.setDisplay('hidden')
          }
        },

        findParentNodeByType: (node, type) => {
          // let node = this.scope.findNodeById(id)
          const parentIds = node?.$inputs || []

          if (!node || !parentIds.length) return

          for (const pid of parentIds) {
            const parent = this.scope.findNodeById(pid)

            if (parent?.type === type) {
              return parent
            }

            return this.scope.findParentNodeByType(parent, type)
          }
        },

        useSyncConnection: async (field) => {
          const id = field.value
          const form = field.form
          const connection = await connectionsApi.getNoSchema(id)

          if (!connection) {
            console.error('ConnectionNotFound', id)
            return
          }

          const connectionType = form.getValuesIn('attrs.connectionType') || ''
          const accessNodeProcessId =
            form.getValuesIn('attrs.accessNodeProcessId') || ''
          const accessNodeType = form.getValuesIn('attrs.accessNodeType') || ''
          const priorityProcessId =
            form.getValuesIn('attrs.priorityProcessId') || ''
          const connectionName = form.getValuesIn('attrs.connectionName')
          const capabilities = form.getValuesIn('attrs.capabilities')
          const pdkType = form.getValuesIn('attrs.pdkType')
          const pdkHash = form.getValuesIn('attrs.pdkHash')
          const db_version = form.getValuesIn('attrs.db_version')

          pdkType !== connection.pdkType &&
            form.setValuesIn('attrs.pdkType', connection.pdkType)
          pdkHash !== connection.pdkHash &&
            form.setValuesIn('attrs.pdkHash', connection.pdkHash)
          connectionType !== connection.connection_type &&
            form.setValuesIn('attrs.connectionType', connection.connection_type)
          accessNodeProcessId !== connection.accessNodeProcessId &&
            form.setValuesIn(
              'attrs.accessNodeProcessId',
              connection.accessNodeProcessId,
            )
          accessNodeType !== connection.accessNodeType &&
            form.setValuesIn('attrs.accessNodeType', connection.accessNodeType)
          priorityProcessId !== connection.priorityProcessId &&
            form.setValuesIn(
              'attrs.priorityProcessId',
              connection.priorityProcessId,
            )
          connectionName !== connection.name &&
            form.setValuesIn('attrs.connectionName', connection.name)
          db_version !== connection.db_version &&
            form.setValuesIn('attrs.db_version', connection.db_version)
          !isEqual(capabilities, connection.capabilities) &&
            form.setValuesIn('attrs.capabilities', connection.capabilities)
        },

        getPdkProperties: (node) => {
          const { pdkHash } = node.attrs
          return this.$store.state.dataflow.pdkPropertiesMap[pdkHash]
        },

        addDeclaredCompleterForMigrate: (editor, tools) => {
          addDeclaredCompleter(editor, tools, 'schemaApplyResultList')
        },

        addDeclaredCompleterForSync: (editor, tools) => {
          addDeclaredCompleter(editor, tools, 'tapTable')
        },

        async loadExternalStorage(id) {
          try {
            const filter = {
              where: {},
            }
            if (id) {
              const ext = await externalStorageApi.get(id)
              filter.where.type = ext.type
            }
            const { items = [] } = await externalStorageApi.get({
              filter: JSON.stringify(filter),
            })
            return items.map((item) => {
              return {
                label: item.name,
                value: item.id,
                isDefault: item.defaultStorage,
                isBefore: item.id === id,
              }
            })
          } catch {
            return []
          }
        },

        /**
         * 设置主键默认值
         * 目前的场景是更新条件字段
         * @param field
         */
        setDefaultPrimaryKey(field) {
          if (
            !field.value?.length &&
            field.dataSource &&
            field.dataSource.length
          ) {
            const isPrimaryKeyList = field.dataSource.filter(
              (item) => item.isPrimaryKey,
            )
            const indicesUniqueList = field.dataSource.filter(
              (item) => item.indicesUnique,
            )
            field.setValue(
              (isPrimaryKeyList.length
                ? isPrimaryKeyList
                : indicesUniqueList
              ).map((item) => item.value),
            )
            field.validate()
          }
        },

        async addEditorFieldCompletion(editor, nodeId, $inputs, isMigrate) {
          let nodeFields = []
          if (!$inputs.length) return
          if (isMigrate) {
            const result = await metadataInstancesApi.nodeSchemaPage({
              nodeId,
              fields: [
                'original_name',
                'fields',
                'qualified_name',
                'name',
                'indices',
              ],
              page: 1,
              pageSize: 1,
            })
            nodeFields = result.items[0]?.fields || []
          } else {
            const data = await metadataInstancesApi.nodeSchema(nodeId)
            nodeFields = data?.[0]?.fields || []
          }
          nodeFields =
            nodeFields
              .filter((item) => !item.is_deleted)
              .map((f) => {
                return {
                  value: f.field_name,
                  score: 1000,
                  meta: f.data_type,
                }
              }) || []

          const idx =
            editor.completers?.findIndex(
              (item) => item.id === 'recordFields',
            ) || -1

          if (~idx) editor.completers.splice(idx, 1)

          editor.completers.push({
            id: 'recordFields',
            // 获取补全提示列表
            getCompletions(editor, session, pos, prefix, callback) {
              // 判断当前行是否包含 '.'
              const line = session.getLine(pos.row)
              const index = pos.column - 1
              const recordCompletion = [
                {
                  value: 'record',
                  score: 1000000,
                  meta: 'local',
                },
              ]
              if (index >= 0 && line.charAt(index) === '.') {
                // 获取前缀
                const prefix = getPrefix(line, index)
                if (prefix === 'record') {
                  callback(null, nodeFields)
                }
              } else {
                callback(null, recordCompletion)
              }
            },
          })
          // 绑定 '.' 按键事件
          editor.keyBinding.removeKeyboardHandler(editorKeyboard)
          editor.keyBinding.addKeyboardHandler(editorKeyboard)
        },

        validateUpdateConditionFields: async (value, rule, ctx) => {
          const { field, form } = ctx
          const $values = form.values
          let options = field.dataSource
          const nodeData = this.scope.findNodeById($values.id)

          if (!$values.$inputs[0] || !$values.tableName) {
            return
          }

          // 用户手动创建过
          // if ($values.attrs.hasCreated ) {
          if ($values.attrs.hasCreated === false) {
            if (!options || !options.length) {
              options = await this.scope.loadNodeFieldOptions($values.id)
            }

            if (options && options.length) {
              let defaultList = options.filter((item) => item.isPrimaryKey)

              if (!defaultList.length) {
                defaultList = options.filter((item) => item.indicesUnique)
              }

              if (!defaultList.length) {
                defaultList = options.filter(
                  (item) => item.source === 'virtual_hash',
                )
              }

              if (!value || !value.length) {
                nodeData.updateConditionFields = defaultList.map(
                  (item) => item.value,
                )
                $values.updateConditionFields = nodeData.updateConditionFields
              } else if (value) {
                const fieldMap = options.reduce(
                  (obj, item) => ((obj[item.value] = true), obj),
                  {},
                )
                const filterValue = value.filter((v) => fieldMap[v])

                if (value.length !== filterValue.length) {
                  nodeData.updateConditionFields = filterValue.length
                    ? filterValue
                    : defaultList.map((item) => item.value)
                  $values.updateConditionFields = nodeData.updateConditionFields
                }
              }
            }
          }

          return !$values.updateConditionFields?.length && $values.tableName
            ? i18n.t('packages_dag_mixins_formscope_gaiziduanshibi')
            : ''
        },

        validateConcurrentWritePartitionMap: async (value, rule, ctx) => {
          const { field, form } = ctx
          const $values = form.values
          if (!$values.$inputs[0]) {
            return
          }

          let flag = false
          const concurrentWritePartitionMap = JSON.parse(
            JSON.stringify($values.concurrentWritePartitionMap),
          )
          if (isEmpty(concurrentWritePartitionMap)) {
            flag = true
          }
          for (const key in concurrentWritePartitionMap) {
            if (!concurrentWritePartitionMap[key]?.length) {
              flag = true
            }
          }
          return flag
            ? i18n.t('packages_dag_mixins_formscope_gaiziduanshibi')
            : ''
        },

        validateTableNames: (value, rule, ctx) => {
          const { field, form } = ctx
          const $values = form.values

          if (!value.length) {
            this.scope.clearNodeError($values.id)
            return
          }

          const parents = this.scope.findParentNodes($values.id)

          if (parents && parents.length && parents[0].tableNames.length) {
            const tableNames = parents[0].tableNames
            const countByName = {}
            const duplicateTableNames = new Set()
            const tableNameMap = value.reduce((obj, item) => {
              obj[item.previousTableName] = item.currentTableName
              if (item.currentTableName in countByName) {
                countByName[item.currentTableName]++
                duplicateTableNames.add(item.currentTableName)
              } else {
                countByName[item.currentTableName] = 1
              }
              return obj
            }, {})
            const currentTableNames = Object.values(tableNameMap)
            // if (currentTableNames.length !== new Set(currentTableNames).size) return rule.message
            tableNames.forEach((name) => {
              if (currentTableNames.includes(name) && !tableNameMap[name]) {
                duplicateTableNames.add(name)
              }
            })
            if (duplicateTableNames.size) {
              return `${rule.message}: ${[...duplicateTableNames].join(', ')}`
            }
          }

          this.scope.clearNodeError($values.id)
        },

        async loadAlarmChannels() {
          const channels = await alarmApi.channels()
          const MAP = {
            system: {
              label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'),
              value: 'SYSTEM',
            },
            email: {
              label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'),
              value: 'EMAIL',
            },
          }
          const options = []

          if (!isDaas) {
            const isOpenid = window.__USER_INFO__?.openid
            Object.assign(MAP, {
              wechat: {
                label: i18n.t('packages_business_notify_webchat_notification'),
                value: 'WECHAT',
                disabled: !isOpenid,
              },
              sms: {
                label: i18n.t('packages_business_notify_sms_notification'),
                value: 'SMS',
              },
            })
          }

          for (const channel of channels) {
            const option = MAP[channel.type]

            if (!option) continue

            options.push(option)
          }

          return options
        },

        centerNode: (nodeId) => {
          this.$refs.paperScroller.centerNode(
            this.$store.state.dataflow.NodeMap[nodeId],
          )
          setTimeout(() => {
            this.nodeSelectedById(nodeId, false, true)
          }, 300)
        },

        /**
         * 关联条件变更开关联动
         * @param val
         * @param field
         */
        changeEnableUpdateJoinKeyValue(val, field) {
          let enableRecord = field.form.values.attrs.enableRecord
          if (!enableRecord) {
            enableRecord = field.form.values.attrs.enableRecord = {}
          }
          // 如果是一级开关
          if (
            /mergeProperties\.\d+\.enableUpdateJoinKeyValue/.test(
              field.path.entire,
            )
          ) {
            const children = field.query('.children').value()
            const toggleChildrenEnable = (children, val) => {
              for (const child of children) {
                let enable = val
                if (!enable && child.id in enableRecord) {
                  enable = enableRecord[child.id]
                }
                child.enableUpdateJoinKeyValue = enable
                if (child.children.length) {
                  toggleChildrenEnable(child.children, val)
                }
              }
            }
            toggleChildrenEnable(children, val)
          } else {
            enableRecord[field.query('.id').value()] = val
          }
        },

        getNodeTableOptions: async (nodeId) => {
          const { items = [] } = await taskApi.getNodeTableInfo({
            taskId: this.dataflow.id,
            nodeId,
            page: 1,
            pageSize: 1000000,
          })

          return items.map((item) => item.sinkObjectName)
        },

        // 数据源专属配置调用
        downloadForeignKeyConstraint: () => {
          let url = `${axios.defaults.baseURL}api/foreignKeyConstraint/load?taskId=${this.dataflow.id}`

          if (this.isDaas) {
            const accessToken = Cookie.get('access_token')
            url += `&access_token=${accessToken}`
          } else if (TAP_ACCESS_TOKEN) {
            url += `&__token=${TAP_ACCESS_TOKEN}`
          }

          window.open(url)
        },
      },
    }
  },

  computed: {
    ...mapState('dataflow', ['editVersion', 'taskSaving']),
    ...mapGetters('dataflow', ['stateIsReadonly']),
  },

  async created() {
    this.scope.$settings = this.dataflow
    this.scope.$alarmChannels = await this.scope.loadAlarmChannels()
    await this.loadAccessNode()
  },

  methods: {
    async loadAccessNode() {
      const data = await clusterApi.findAccessNodeInfo()
      const mapNode = (item) => ({
        value: item.processId,
        label: `${item.agentName || item.hostName}（${
          item.status === 'running'
            ? i18n.t('public_status_running')
            : i18n.t('public_agent_status_offline')
        }）`,
        disabled: item.status !== 'running',
        accessNodeType: item.accessNodeType,
      })
      this.scope.$agents = data.map((item) => {
        if (
          item.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
        ) {
          return {
            value: item.processId,
            label: `${item.accessNodeName}（${i18n.t('public_status_running')}：${
              item.accessNodes?.filter((ii) => ii.status === 'running')
                .length || 0
            }）`,
            accessNodeType: item.accessNodeType,
            children: item.accessNodes?.map(mapNode) || [],
          }
        }
        return mapNode(item)
      })
      this.scope.$agentMap = data.reduce(
        (obj, item) => ((obj[item.processId] = item), obj),
        {},
      )
    },

    /**
     * 等待任务保存完
     * @returns {Promise<unknown>}
     */
    afterTaskSaved() {
      return new Promise((resolve) => {
        if (this.taskSaving) {
          const unwatch = this.$watch('taskSaving', () => {
            unwatch()
            resolve()
          })
        } else {
          resolve()
        }
      })
    },
  },
}
