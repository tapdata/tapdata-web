<template>
  <section class="verify-form-wrap section-wrap flex-fill bg-white" v-loading="loading">
    <div class="section-wrap-box position-relative p-6">
      <div class="verify-form-title">
        {{
          $route.params.id ? $t('packages_business_verification_edit') : $t('packages_business_verification_newVerify')
        }}
      </div>

      <SchemaToForm
        v-if="!!formSchema"
        :value="form"
        ref="schemaToForm"
        :schema="formSchema"
        :scope="schemaScope"
        :colon="true"
        class="w-100"
        label-width="120"
      ></SchemaToForm>
      <div v-if="!!errorMessageLevel" class="color-danger mt-2" v-html="jointErrorMessage"></div>
      <div class="mt-4">
        <ElButton @click="goBack()">{{ $t('public_button_back') }}</ElButton>
        <ElButton type="primary" :disabled="saveDisabled" @click="save(true)">{{ $t('public_button_save') }}</ElButton>
      </div>
    </div>
  </section>
</template>

<script>
import { cloneDeep, merge } from 'lodash'
import { action } from '@formily/reactive'

import i18n from '@tap/i18n'
import { taskApi, inspectApi, metadataInstancesApi, clusterApi, connectionsApi, externalStorageApi } from '@tap/api'
import { SchemaToForm } from '@tap/form'
import Time from '@tap/shared/src/time'

import { DATA_NODE_TYPES, META_INSTANCE_FIELDS, TABLE_PARAMS } from './components/const'
import { CONNECTION_STATUS_MAP } from '../../shared'
import { uuid } from '@tap/shared'
import { statusMap, inspectMethod as inspectMethodMap } from './const'
const FILTER_DATABASE_TYPES = ['Doris']

export default {
  components: {
    SchemaToForm,
  },
  data() {
    let self = this
    let requiredValidator = (msg, check) => {
      return (rule, value, callback) => {
        let valid = check ? check() : true
        if (valid && !value) {
          callback(new Error(msg))
        } else {
          callback()
        }
      }
    }
    let checkMode = () => {
      return self.form.mode === 'cron'
    }

    const notSupport = {
      row_count: ['Clickhouse', 'Kafka'],
      field: ['Kafka'],
      jointField: ['Kafka'],
      hash: []
    }
    return {
      loading: false,
      timeUnitOptions: ['second', 'minute', 'hour', 'day', 'week', 'month'],
      isDbClone: false,
      form: {
        flowId: '',
        name: '',
        mode: 'manual',
        inspectDifferenceMode: 'All',
        inspectMethod: 'row_count',
        cdcBeginDate: '',
        cdcEndDate: '',
        cdcDuration: '',
        timing: {
          intervals: 24 * 60,
          intervalsUnit: 'minute',
          start: Time.now(),
          end: Time.now() + 24 * 60 * 60 * 1000,
        },
        limit: {
          keep: 100,
        },
        enabled: true,
        tasks: [],
        taskMode: 'pipeline',
        errorNotifys: ['SYSTEM', 'EMAIL'],
        inconsistentNotifys: ['SYSTEM', 'EMAIL'],
        alarmSettings: [
          {
            type: 'INSPECT',
            key: 'INSPECT_TASK_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_COUNT_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialRows: 0,
            },
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_VALUE_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialValues: 0,
            },
          },
        ],
      },
      rules: {
        flowId: [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksDataFlow')),
          },
        ],
        name: [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksJobName')),
          },
        ],
        'timing.start': [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksTime'), checkMode),
          },
        ],
        'timing.intervals': [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksVerifyInterval'), checkMode),
          },
        ],
        cdcBeginDate: [
          {
            validator: requiredValidator(i18n.t('packages_business_verification_form_qingshurukaishi'), () => {
              return self.form.inspectMethod === 'cdcCount'
            }),
          },
        ],
      },
      edges: [],
      allStages: [],
      flowOptions: [],
      notSupport,
      inspectMethodMap,
      typTipMap: {
        row_count:
          this.$t('packages_business_verification_fastCountTip') +
          this.$t('packages_dag_components_node_zanbuzhichi') +
          notSupport['row_count'].join(),
        field:
          this.$t('packages_business_verification_contentVerifyTip') +
          this.$t('packages_dag_components_node_zanbuzhichi') +
          notSupport['field'].join(),
        jointField:
          this.$t('packages_business_verification_jointFieldTip') +
          this.$t('packages_dag_components_node_zanbuzhichi') +
          notSupport['jointField'].join(),
        hash: this.$t('packages_business_verification_hashTip')
      },
      jointErrorMessage: '',
      errorMessageLevel: '',
      autoAddTableLoading: false,
      schemaScope: null,
      formSchema: null,
    }
  },
  computed: {
    saveDisabled() {
      return this.errorMessageLevel === 'error' || this.autoAddTableLoading || this.loading
    },
  },
  created() {
    // 设置form.taskMode
    let taskMode = this.$route.query.taskMode
    if (taskMode) {
      this.form.taskMode = taskMode
    }

    this.getFlowOptions()
    this.loadFormSchema()
    if (this.$route.params.id) {
      this.setData(this.$route.params.id)
    }
  },
  methods: {
    loadFormSchema() {
      const self = this
      this.schemaScope = {
        $t: i18n.t,
        $inspectMethodMap: inspectMethodMap,
        $notSupport: {
          row_count: ['Clickhouse', 'Kafka'],
          field: ['Kafka'],
          jointField: ['Kafka'],
          hash: [],
        },
        $verifyTypeTip: {
          row_count: i18n.t('packages_business_verification_fastCountTip'),
          field: i18n.t('packages_business_verification_contentVerifyTip'),
          jointField: i18n.t('packages_business_verification_jointFieldTip'),
          hash: this.$t('packages_business_verification_hashTip'),
        },
        useAsyncDataSourceByConfig: (config, ...serviceParams) => {
          const { service, fieldName = 'dataSource', withoutField = false } = config
          return (field) => {
            field.loading = true
            let fetch = withoutField ? service(...serviceParams) : service(field, ...serviceParams)
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
        async loadTasksOptions($values) {
          if ($values.taskMode !== 'pipeline') {
            return []
          }
          try {
            let filter = {
              where: {
                status: {
                  inq: ['running', 'stop', 'complete'], //TODO 测试代码，提交代码需要回复
                },
              },
              fields: {
                id: true,
                name: true,
                status: true,
                syncType: true,
              },
              order: 'createTime DESC',
              limit: 999,
              skip: 0,
            }

            const result = await taskApi.get({ filter: JSON.stringify(filter) })
            return (
              result.items.map((t) => {
                t.label = t.name
                t.value = t.id
                return t
              }) || []
            )
          } catch (e) {
            return []
          }
        },
        async loadNodesOptions($values) {
          if (!$values.flowId) {
            return []
          }
          try {
            const data = await taskApi.getId($values.flowId)
            let { edges = [], nodes = [] } = data.dag || {}
            let filterNodes = nodes?.filter((t) => ['table', 'database'].includes(t.type))
            const result = filterNodes.map((t) => {
              const findTargetNodeId = self.schemaScope.getLinkNode(t.id, edges)
              if (['table', 'database'].includes(t.type)) {
                t.nodeFrom = findTargetNodeId === t.id ? 'source' : 'target'
              }
              t.connectionName = t.attrs?.connectionName
              t.value = t.id
              t.label = `${t.name} / ${t.connectionName}`
              return t
            })
            return result
          } catch (e) {
            return { items: [], total: 0 }
          }
        },
        async loadConnectionsOptions() {
          try {
            const _filter = {
              limit: 1000,
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
            let result = await connectionsApi.get({
              filter: JSON.stringify(merge({}, _filter)),
            })
            result.items = result.items.map((item) => {
              const connectionId = item.id
              const connectionName = item.name
              const databaseType = item.database_type
              const capabilities = item.capabilities
              return {
                id: connectionId,
                name: connectionName,
                label: `${connectionName} ${
                  item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''
                }`,
                value: connectionId,
                databaseType: databaseType,
                attrs: { connectionId, connectionName, databaseType, capabilities },
              }
            })
            return result.items
          } catch (e) {
            return []
          }
        },
        async loadTableOptions(filter = {}) {
          const { connectionId, nodeId } = filter
          if (!connectionId) {
            return { items: [], total: 0 }
          }
          if (nodeId) {
            return self.schemaScope.getTablesInTask(nodeId, connectionId, filter)
          }
          try {
            const size = filter.size || 20
            const page = filter.page || 1
            let params = {
              where: {
                meta_type: 'table',
                sourceType: 'SOURCE',
                is_deleted: false,
                'source.id': connectionId,
              },
              skip: (page - 1) * size,
              limit: size,
              order: 'createTime DESC',
            }
            const keyword = filter.where?.name?.like
            if (keyword) {
              params.where.name = filter.where.name
            }
            const res = await metadataInstancesApi.tapTables({
              filter: JSON.stringify(params),
            })
            let result = {}
            result.items = res.items.map((t) => t.name)
            result.total = res.total
            return result
          } catch (e) {
            return { items: [], total: 0 }
          }
        },
        async getTablesInTask(nodeId, connectionId, filter = {}) {
          let { isDbClone, nodesOptions = [] } = filter
          let params = {
            nodeId,
            fields: ['original_name', 'fields', 'qualified_name'],
            page: filter?.page || 1,
            pageSize: filter?.size || 20,
          }
          const keyword = filter.where?.name?.like
          if (keyword) {
            params.tableFilter = keyword
          }

          let res = await metadataInstancesApi.nodeSchemaPage(params)

          let tableList =
            res.items?.map((t) => {
              t.value = t.name
              t.label = t.name
              return t
            }) || []
          let tableNames = tableList
          if (isDbClone) {
            const findNode = nodesOptions.find((t) => t.id === nodeId)
            if (findNode.nodeFrom === 'target') {
              const { tablePrefix, tableSuffix, tableNameTransform } = findNode
              tableNames.forEach((t) => {
                let name = (tablePrefix || '') + t.value + (tableSuffix || '')
                t.label = tableNameTransform ? name[tableNameTransform]() : name
                t.value = t.label
              })
            }
          }
          if (keyword) {
            tableNames = tableNames.filter((t) => t.value.toLowerCase().includes(keyword.toLowerCase()))
          }
          return { items: tableNames, total: tableNames.length }
        },
        async loadTableFieldList(item = {}) {
          const { isDbClone, nodesOptions, nodeId, table } = item
          if (!item.connectionId || !item.table) {
            return {
              items: [],
              total: 0,
            }
          }
          try {
            let fields = item.fields
            if (!fields?.length) {
              // 任务有字段改名逻辑，需要走推演的接口
              if (nodesOptions.length) {
                const nodeTableInfo = await metadataInstancesApi.nodeSchemaPage({
                  nodeId: nodeId,
                  fields: ['original_name', 'fields', 'qualified_name'],
                  tableFilter: table,
                })
                fields = nodeTableInfo.items[0]?.fields || []
              } else {
                const params = {
                  where: {
                    meta_type: 'table',
                    sourceType: 'SOURCE',
                    original_name: item.table,
                    'source._id': item.connectionId,
                  },
                  limit: 1,
                }
                const data = await metadataInstancesApi.tapTables({
                  filter: JSON.stringify(params),
                })
                fields = Object.values(data.items[0]?.nameFieldMap || {})
              }
            }
            const result = fields.map((t) => {
              return {
                id: t.id,
                label: t.fieldName || t.field_name,
                value: t.fieldName || t.field_name,
                field_name: t.fieldName || t.field_name,
                primary_key_position: t.primaryKey,
                data_type: t.dataType || t.data_type,
                primaryKey: t.primaryKey,
                unique: t.unique,
              }
            })
            if (result.length) {
              item.fields = result
            }
            return {
              items: result,
              total: result.length,
            }
          } catch (e) {
            return {
              items: [],
              total: 0,
            }
          }
        },
        // 获取节点连线的上游nodeId或下游nodeId, findTarget为,false 则是查询源头
        getLinkNode(value, data = [], findTarget = false) {
          const f = data.find((t) => t[findTarget ? 'source' : 'target'] === value)
          return f ? this.getLinkNode(f[!findTarget ? 'source' : 'target'], data, findTarget) : value
        },
        onChangeTask($values, $form) {
          const findTask = $values.tasksOptions.find((t) => t.value === $values.flowId)
          $values.tasks = []
          $values.name = (findTask.name || '') + ' - ' + self.schemaScope.$inspectMethodMap[$values.inspectMethod]
          $values.$isDbClone = findTask.syncType === 'migrate'
          // 加载节点列表
          // 加载 dag
        },
        onChangeInspectMethod($values, val) {
          if ($values.taskMode === 'pipeline') {
            const findTask = $values.tasksOptions.find((t) => t.value === $values.flowId)
            $values.name = (findTask.name || '') + ' - ' + self.schemaScope.$inspectMethodMap[$values.inspectMethod]
          }
        },
        onChangeSourceNode(val, $values, $record, key, $self) {
          const findNode = $values.nodesOptions.find((t) => t.id === val) || {}
          const { connectionId, connectionName, databaseType } = findNode
          $record[key].table = ''
          $record[key].connectionId = connectionId
          $record[key].connectionName = connectionName
          $record[key].nodeName = name
          $record[key].databaseType = databaseType
        },
        getPrimaryKeyField(data = []) {
          let sortField = (list) => {
            return (
              list?.sort((a, b) => {
                return a.field_name > b.field_name ? -1 : 1
              }) || []
            )
          }
          return sortField(data)
            .filter((f) => !!f.primaryKey)
            .map((t) => t.field_name)
        },
        getPrimaryKeyFieldStr(data = []) {
          let sortField = (list) => {
            return (
              list?.sort((a, b) => {
                return a.field_name > b.field_name ? -1 : 1
              }) || []
            )
          }
          return sortField(data)
            .filter((f) => !!f.primaryKey)
            .map((t) => t.field_name)
            .join(',')
        },
        async onSetSelectedTable(val = {}, $values, $record, key) {
          // 填充索引字段
          $record[key].fields = val?.fields || []
          $record[key].sortColumnList = self.schemaScope.getPrimaryKeyField(val?.fields)
          $record[key].sortColumn = $record[key].sortColumnList.join()
          if ($record.modeType === 'custom' && !$record.source.columns?.length) {
            $record.source.columns = []
            $record.target.columns = []
          }
          // 非任务类型，则跳过填充
          if ($values.taskMode !== 'pipeline' || key !== 'source') return
          // 存在主从合并节点，多个源节点，跳过填充逻辑
          if ($values.nodesOptions.filter((t) => t.nodeFrom === 'source').length > 1) return

          // 填充右侧目标的数据，按照两个节点处理（源节点、目标节点）
          const otherKey = key === 'source' ? 'target' : 'source'
          const findNode = $values.nodesOptions.find((t) => t.id === $record[key].nodeId) || {} // 获取当前节点
          const currentIsSource = findNode.nodeFrom === 'source' // 当前节点是否任务的源节点
          const otherNode = $values.nodesOptions.find((t) => t.id !== $record[key].nodeId) || {}
          const { id, name, connectionId, connectionName, databaseType } = otherNode
          if (!$record[otherKey]) {
            $record[otherKey] = {}
          }
          let otherInfo = {
            nodeId: id,
            nodeName: name,
            connectionId: connectionId,
            connectionName: connectionName,
            databaseType: databaseType,
          }

          // 数据复制
          if (otherNode.type === 'database') {
            if (currentIsSource) {
              // otherNode是任务的目标节点
              const { tableNameRelation = {}, updateConditionFieldMap = {} } = otherNode.syncObjects?.[0] || {}
              otherInfo.table = tableNameRelation[$record[key].table]
              otherInfo.sortColumnList = updateConditionFieldMap[$record[key].table] || []
            } else {
              const { tableNameRelation = {}, updateConditionFieldMap = {} } = findNode.syncObjects?.[0] || {}
              otherInfo.table = Object.keys(tableNameRelation).find((k) => tableNameRelation[k] === $record[key].table)
              otherInfo.sortColumnList =
                Object.keys(updateConditionFieldMap).find((k) => updateConditionFieldMap[k] === $record[key].table) ||
                []
            }
          } else if (otherNode.type === 'table') {
            // 数据开发
            otherInfo.table = otherNode.tableName
            if (currentIsSource) {
              // otherNode是任务的目标节点
              otherInfo.sortColumnList = otherNode.updateConditionFields || []
            } else {
              otherInfo.sortColumnList = findNode.updateConditionFields || []
            }
          }

          // 如果没有获取到数据，则取左侧的索引字段
          if (!otherInfo.sortColumnList?.length) {
            otherInfo.sortColumnList = cloneDeep($record[key].sortColumnList) // 字段改名后，名字还是一样的吗；前端无法获取到顺序和个数
          }

          // 加载右侧的字段列表
          const otherTableInfo = await metadataInstancesApi.nodeSchemaPage({
            nodeId: id,
            fields: ['original_name', 'fields', 'qualified_name'],
            tableFilter: otherInfo.table,
          })

          otherInfo.sortColumn = otherInfo.sortColumnList.join()
          otherInfo.fields = otherTableInfo.items[0]?.fields || []

          Object.assign($record[otherKey], otherInfo)
        },
        onClickAddItem($values) {
          if ($values.taskMode === 'pipeline' && !$values.flowId) {
            self.$message.error('请先选择任务')
            return
          }
          $values.tasks.push({})
        },
        getItemOptions() {
          return {
            id: uuid(),
            source: Object.assign({}, TABLE_PARAMS),
            target: Object.assign({}, TABLE_PARAMS),
            showAdvancedVerification: false,
            script: '', //后台使用 需要拼接function头尾
            webScript: '', //前端使用 用于页面展示
            jsEngineName: 'graal.js',
            modeType: 'all', // 待校验模型的类型
          }
        },
        fillTableInfo(
          sourceNode = {},
          targetNode = {},
          sourceTable = {},
          targetTable = {},
          sourceUpdateConditionFields = [],
          targetUpdateConditionFields = [],
        ) {
          let item = self.schemaScope.getItemOptions()
          // 填充source
          item.source.nodeId = sourceNode.id
          item.source.nodeName = sourceNode.name
          item.source.databaseType = sourceNode.databaseType
          item.source.connectionId = sourceNode.connectionId
          item.source.connectionName = sourceNode.connectionName
          item.source.table = sourceTable.original_name
          item.source.capabilities = sourceNode.attrs?.capabilities || []
          item.source.fields = sourceTable.fields || []
          item.source.sortColumnList = sourceUpdateConditionFields?.length
            ? sourceUpdateConditionFields
            : self.schemaScope.getPrimaryKeyField(item.source.fields)
          item.source.sortColumn = item.source.sortColumnList.join()
          // 填充target
          item.target.nodeId = targetNode.id
          item.target.nodeName = targetNode.name
          item.target.databaseType = targetNode.databaseType
          item.target.connectionId = targetNode.connectionId
          item.target.connectionName = targetNode.connectionName
          item.target.table = targetTable.original_name
          item.target.capabilities = targetNode.attrs?.capabilities || []
          item.target.fields = targetTable.fields
          item.target.sortColumnList = targetUpdateConditionFields?.length
            ? targetUpdateConditionFields
            : self.schemaScope.getPrimaryKeyField(item.target.fields)
          item.target.sortColumn = item.target.sortColumnList.join()
          return item
        },
        async onClickAutoAddItem($values) {
          let connectionIds = []
          let tableNames = []
          const nodeList = $values.nodesOptions
          nodeList.forEach((m) => {
            connectionIds.push(m.connectionId)
            if ($values.$isDbClone) {
              if (m.syncObjects?.[0]) {
                tableNames.push(...m.syncObjects[0].objectNames)
              } else {
                tableNames.push(...m.tableNames)
              }
            } else {
              tableNames.push(m.tableName)
            }
          })
          // 自动添加表
          const where = {
            meta_type: {
              inq: DATA_NODE_TYPES,
            },
            'source.id': {
              inq: Array.from(new Set(connectionIds)),
            },
            original_name: {
              inq: Array.from(new Set(tableNames)),
            },
          }

          const data = await metadataInstancesApi.findInspect({
            where,
            fields: META_INSTANCE_FIELDS,
          })
          const sourceNodeList = nodeList.filter((t) => t.nodeFrom === 'source') //主从合并会存在多个源
          const targetNode = nodeList.find((t) => t.nodeFrom === 'target')
          if (!sourceNodeList.length || !targetNode) {
            self.$message.error(i18n.t('packages_business_components_conditionbox_suoxuanrenwuque'))
            return
          }
          let result = [] // 记录匹配后的信息
          sourceNodeList.forEach((node) => {
            // 数据复制存在多个表
            if ($values.$isDbClone) {
              const updateConditionFieldMap = targetNode.updateConditionFieldMap || {}
              const tableNameRelation = targetNode.syncObjects?.[0]?.tableNameRelation || {}
              for (let key in tableNameRelation) {
                const updateConditionList = updateConditionFieldMap[key] || []
                let findTable = data.find((t) => t.source.id === node.connectionId && t.original_name === key)
                let findTargetTable = data.find(
                  (t) => t.source.id === targetNode.connectionId && t.original_name === tableNameRelation[key],
                )
                const sourceUpdateConditionFields = [] //Object.keys(updateConditionFieldMap).find((k) => updateConditionFieldMap[k] === tableNameRelation[key]) // 怎么获取到源节点的字段数据
                result.push(
                  self.schemaScope.fillTableInfo(
                    node,
                    targetNode,
                    findTable,
                    findTargetTable,
                    sourceUpdateConditionFields,
                    updateConditionList,
                  ),
                )
              }
            } else {
              // 数据转换是单表
              let findTable = data.find((t) => t.source.id === node.connectionId && t.original_name === node.tableName)
              let findTargetTable = data.find(
                (t) => t.source.id === targetNode.connectionId && t.original_name === targetNode.tableName,
              )
              const { updateConditionFields = [] } = findTargetTable || {}
              const sourceUpdateConditionFields = [] // 怎么获取到源节点的字段数据
              result.push(
                self.schemaScope.fillTableInfo(
                  node,
                  targetNode,
                  findTable,
                  findTargetTable,
                  sourceUpdateConditionFields,
                  updateConditionFields,
                ),
              )
            }
          })
          $values.tasks = result
        },
        onChangeModeType(val, $record) {
          if (val === 'custom') {
            $record.source.columns = []
            $record.target.columns = []
          }
        },
      }
      // TODO hash 校验待适配
      this.formSchema = {
        type: 'object',
        properties: {
          $isDbClone: {
            type: 'boolean',
            'x-display': 'hidden',
            default: false,
          },
          tasksOptions: {
            type: 'array',
            'x-display': 'hidden',
            'x-reactions': [
              `{{useAsyncDataSourceByConfig({service: loadTasksOptions, withoutField: true, fieldName: 'value'}, $values)}}`,
              {
                target: '.flowId',
                fulfill: {
                  state: {
                    loading: '{{$self.loading}}',
                    dataSource: '{{$self.value}}',
                  },
                },
              },
            ],
          },
          nodesOptions: {
            type: 'array',
            'x-display': 'hidden',
            'x-reactions': [
              {
                dependencies: ['.flowId'],
                fulfill: {
                  state: {
                    display: '{{!!$deps[0] ? "visible":"hidden"}}',
                  },
                },
              },
              `{{useAsyncDataSourceByConfig({service: loadNodesOptions, withoutField: true, fieldName: 'value'}, $values, $values.flowId)}}`,
              {
                target: '*(tasks.*.source.nodeId,tasks.*.target.nodeId)',
                fulfill: {
                  state: {
                    loading: '{{$self.loading}}',
                    dataSource: '{{$self.value}}',
                  },
                },
              },
            ],
          },
          connectionsOptions: {
            type: 'array',
            'x-display': 'hidden',
            'x-reactions': [
              `{{useAsyncDataSourceByConfig({service: loadConnectionsOptions, withoutField: true, fieldName: 'value'}, $values)}}`,
              {
                target: '*(tasks.*.source.connectionId,tasks.*.target.connectionId)',
                fulfill: {
                  state: {
                    loading: '{{$self.loading}}',
                    dataSource: '{{$self.value}}',
                  },
                },
              },
            ],
          },
          flowId: {
            title: i18n.t('packages_business_verification_chooseJob'),
            type: 'string',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              onChange: `{{ () => onChangeTask($values, $form) }}`,
            },
            'x-reactions': [
              {
                fulfill: {
                  state: {
                    display: `{{$values.taskMode === 'pipeline' ? "visible":"hidden"}}`,
                  },
                },
              },
            ],
          },
          name: {
            title: i18n.t('packages_business_verification_task_name'),
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
          inspectMethod: {
            title: i18n.t('packages_business_verification_type'),
            type: 'string',
            default: 'row_count',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              tooltip: `{{ $verifyTypeTip[$self.value] + $t('packages_dag_components_node_zanbuzhichi') + $notSupport[$self.value].join() }}`,
            },
            'x-component': 'Radio.Group',
            'x-component-props': {
              optionType: 'button',
              onChange: `{{ (val) => onChangeInspectMethod($values, val) }}`,
            },
            enum: [
              {
                label: inspectMethodMap.row_count,
                value: 'row_count',
              },
              {
                label: inspectMethodMap.field,
                value: 'field',
              },
              {
                label: inspectMethodMap.jointField,
                value: 'jointField',
              },
              {
                label: inspectMethodMap.hash,
                value: 'hash',
              },
            ],
          },
          collapse: {
            type: 'void',
            'x-component': 'FormCollapse',
            'x-component-props': {
              class: 'advanced-collapse',
            },
            properties: {
              tab1: {
                type: 'void',
                'x-component': 'FormCollapse.Item',
                'x-component-props': {
                  title: i18n.t('packages_business_verification_form_gaojipeizhi'),
                },
                properties: {
                  inspectDifferenceMode: {
                    title: i18n.t('packages_business_verification_form_jieguoshuchu'),
                    type: 'string',
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    default: 'All',
                    enum: [
                      {
                        label: i18n.t('packages_business_verification_form_shuchusuoyoubu'),
                        value: 'All',
                      },
                      {
                        label: i18n.t('packages_business_verification_form_zhishuchulaiyuan'),
                        value: 'OnSourceExists',
                      },
                    ],
                    'x-reactions': {
                      fulfill: {
                        state: {
                          display: `{{$values.inspectMethod !== 'hash'?'visible':'hidden'}}`,
                        },
                      },
                    },
                  },
                  mode: {
                    title: i18n.t('packages_business_verification_frequency'),
                    type: 'string',
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    default: 'manual',
                    enum: [
                      {
                        label: i18n.t('packages_business_verification_single'),
                        value: 'manual',
                      },
                      {
                        label: i18n.t('packages_business_verification_repeating'),
                        value: 'cron',
                      },
                    ],
                  },
                  alarmContainer: {
                    type: 'void',
                    'x-decorator': 'FormItem',
                    title: i18n.t('packages_business_verification_form_task_alarm'),
                    properties: {
                      alarmSettings: {
                        type: 'array',
                        title: i18n.t('packages_business_verification_form_task_alarm_when_error'),
                      },
                      space0: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          style: {
                            'margin-bottom': 0,
                          },
                        },
                        'x-component': 'Space',
                        properties: {
                          'alarmSettings.0.open': {
                            type: 'boolean',
                            'x-decorator': 'FormItem',
                            'x-component': 'Checkbox',
                            'x-component-props': {
                              label: i18n.t('packages_business_verification_form_task_alarm_when_error'),
                              onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM","EMAIL"]))}}`,
                            },
                          },
                          'alarmSettings.0.notify': {
                            type: 'array',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'ml-6',
                            },
                            'x-component': 'Checkbox.Group',
                            'x-component-props': {
                              onChange: `{{val=>($values.alarmSettings[0].open=!!val.length)}}`,
                            },
                            enum: [
                              {
                                label: i18n.t('packages_business_verification_form_xitongtongzhi'),
                                value: 'SYSTEM',
                              },
                              {
                                label: i18n.t('packages_business_verification_form_youjiantongzhi'),
                                value: 'EMAIL',
                              },
                            ],
                          },
                        },
                      },
                      space1: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          style: {
                            'margin-bottom': 0,
                          },
                        },
                        'x-component': 'Space',
                        'x-reactions': {
                          fulfill: {
                            state: {
                              display: `{{$values.inspectMethod === 'row_count'?'visible':'hidden'}}`,
                            },
                          },
                        },
                        properties: {
                          'alarmSettings.1.open': {
                            type: 'boolean',
                            'x-decorator': 'FormItem',
                            'x-component': 'Checkbox',
                            'x-component-props': {
                              label: i18n.t(
                                'packages_business_verification_form_task_alarm_when_diff_result_over_count1',
                              ),
                              onChange: `{{val=>(val && !$values.alarmSettings[1].notify.length && ($values.alarmSettings[1].notify=["SYSTEM","EMAIL"]))}}`,
                            },
                          },
                          'alarmSettings.1.params.maxDifferentialRows': {
                            type: 'number',
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 0,
                            },
                            default: 0,
                          },
                          alarmSettings1paramsLabel: {
                            type: 'void',
                            'x-component': 'Text',
                            'x-decorator': 'FormItem',
                            'x-component-props': {
                              content: i18n.t(
                                'packages_business_verification_form_task_alarm_when_diff_result_over_count2',
                              ),
                              className: 'pt-1',
                            },
                          },
                          'alarmSettings.1.notify': {
                            type: 'array',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'ml-6',
                            },
                            'x-component': 'Checkbox.Group',
                            'x-component-props': {
                              onChange: `{{val=>($values.alarmSettings[1].open=!!val.length)}}`,
                            },
                            // default: ['SYSTEM', 'EMAIL'],
                            enum: [
                              {
                                label: i18n.t('packages_business_verification_form_xitongtongzhi'),
                                value: 'SYSTEM',
                              },
                              {
                                label: i18n.t('packages_business_verification_form_youjiantongzhi'),
                                value: 'EMAIL',
                              },
                            ],
                          },
                        },
                      },
                      space2: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          style: {
                            'margin-bottom': 0,
                          },
                        },
                        'x-component': 'Space',
                        'x-reactions': {
                          fulfill: {
                            state: {
                              display: `{{['field', 'jointField'].includes($values.inspectMethod)?'visible':'hidden'}}`,
                            },
                          },
                        },
                        properties: {
                          'alarmSettings.2.open': {
                            type: 'boolean',
                            default: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'Checkbox',
                            'x-component-props': {
                              label: i18n.t(
                                'packages_business_verification_form_task_alarm_when_result_table_over_count1',
                              ),
                              onChange: `{{val=>(val && !$values.alarmSettings[2].notify.length && ($values.alarmSettings[2].notify=["SYSTEM","EMAIL"]))}}`,
                            },
                          },
                          'alarmSettings.2.params.maxDifferentialValues': {
                            type: 'number',
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 0,
                            },
                            default: 0,
                          },
                          alarmSettings2paramsLabel: {
                            type: 'void',
                            'x-component': 'Text',
                            'x-decorator': 'FormItem',
                            'x-component-props': {
                              content: i18n.t(
                                'packages_business_verification_form_task_alarm_when_diff_result_over_count2',
                              ),
                              className: 'pt-1',
                            },
                          },
                          'alarmSettings.2.notify': {
                            type: 'array',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'ml-6',
                            },
                            'x-component': 'Checkbox.Group',
                            'x-component-props': {
                              onChange: `{{val=>($values.alarmSettings[2].open=!!val.length)}}`,
                            },
                            // default: ['SYSTEM', 'EMAIL'],
                            enum: [
                              {
                                label: i18n.t('packages_business_verification_form_xitongtongzhi'),
                                value: 'SYSTEM',
                              },
                              {
                                label: i18n.t('packages_business_verification_form_youjiantongzhi'),
                                value: 'EMAIL',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                  'limit.keep': {
                    title: i18n.t('packages_business_verification_form_label_error_save_count'),
                    type: 'string',
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    default: 'manual',
                    enum: [
                      {
                        label: '100(rows)',
                        value: 100,
                      },
                      {
                        label: '1000(rows)',
                        value: 1000,
                      },
                      {
                        label: '10000(rows)',
                        value: 10000,
                      },
                    ],
                    'x-reactions': {
                      fulfill: {
                        state: {
                          display: `{{$values.inspectMethod !== 'hash'?'visible':'hidden'}}`,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          tasks: {
            type: 'array',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              className: 'mb-3',
            },
            'x-component': 'ArrayItems',
            title: '校验表配置',
            items: {
              type: 'object',
              'x-decorator': 'ArrayItems.Item',
              'x-decorator-props': {
                className: 'border mb-4 pt-3 pl-3',
              },
              properties: {
                gridWrap: {
                  type: 'void',
                  'x-component': 'FormGrid',
                  'x-component-props': {
                    minColumns: 2,
                    maxColumns: 2,
                    columnGap: 16,
                  },
                  properties: {
                    source: {
                      type: 'object',
                      'x-component': 'FormGrid.GridColumn',
                      properties: {
                        connectionId: {
                          type: 'string',
                          title: i18n.t('packages_business_components_conditionbox_daijiaoyanlianjie'),
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  display: `{{$values.taskMode !== 'pipeline'?'visible':'hidden'}}`,
                                },
                              },
                            },
                          ],
                        },
                        nodeId: {
                          type: 'string',
                          title: i18n.t('packages_business_components_conditionbox_daijiaoyanlianjie'),
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          'x-component-props': {
                            onChange: '{{ (val) => onChangeSourceNode(val, $values, $records[$index], "source") }}',
                          },
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  display: `{{$values.taskMode === 'pipeline'?'visible':'hidden'}}`,
                                },
                              },
                            },
                          ],
                        },
                        table: {
                          type: 'string',
                          title: i18n.t('packages_business_components_conditionbox_laiyuanbiao'),
                          'x-decorator': 'FormItem',
                          'x-component': 'AsyncSelect',
                          'x-component-props': {
                            method: `{{loadTableOptions}}`,
                            params: {
                              connectionId: '{{$records[$index].source && $records[$index].source.connectionId}}',
                              nodeId: '{{$records[$index].source && $records[$index].source.nodeId}}',
                              isDbClone: '{{$values.$isDbClone}}',
                              nodesOptions: '{{$values.nodesOptions}}',
                            },
                            itemQuery: 'name',
                            lazy: true,
                            onSetSelected:
                              '{{ (val) => onSetSelectedTable(val, $values, $records[$index], "source") }}',
                          },
                        },
                        sortColumnList: {
                          type: 'array',
                          title: i18n.t('packages_business_verification_indexField'),
                          'x-decorator': 'FormItem',
                          'x-component': 'AsyncSelect',
                          'x-component-props': {
                            method: `{{loadTableFieldList}}`,
                            multiple: true,
                            collapseTags: true,
                            collapseTagsTooltip: true,
                            params: {
                              nodeId: '{{$records[$index].source && $records[$index].source.nodeId}}',
                              connectionId: '{{$records[$index].source && $records[$index].source.connectionId}}',
                              table: '{{$records[$index].source && $records[$index].source.table}}',
                              isDbClone: '{{$values.$isDbClone}}',
                              nodesOptions: '{{$values.nodesOptions}}',
                              onChange: '{{ (val) => { $values.source.sortColumn = val.join()} }}',
                            },
                            itemQuery: 'name',
                            lazy: true,
                          },
                          'x-reactions': {
                            fulfill: {
                              state: {
                                display: `{{$values.inspectMethod !== 'row_count'?'visible':'hidden'}}`,
                              },
                            },
                          },
                        },
                        enableCustomCommand: {
                          title: i18n.t('packages_business_components_conditionbox_laiyuanbiaoshuju'),
                          type: 'boolean',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            className: 'item-control-horizontal',
                            layout: 'horizontal',
                            tooltip: '',
                          },
                          'x-component': 'Switch',
                          default: false,
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  visible: `{{$records[$index].source && $records[$index].source.capabilities && $records[$index].source.capabilities.some(item => item.id === 'execute_command_function')}}`,
                                },
                              },
                            },
                          ],
                        },
                        customCommand: {
                          type: 'object',
                          properties: {
                            command: {
                              title: ' ',
                              'x-decorator-props': {
                                colon: false,
                              },
                              type: 'string',
                              default: 'executeQuery',
                              'x-decorator': 'FormItem',
                              'x-component': 'Radio.Group',
                              enum: [
                                { label: i18n.t('public_query'), value: 'executeQuery' },
                                { label: i18n.t('public_aggregate'), value: 'aggregate' },
                              ],
                              'x-reactions': {
                                fulfill: {
                                  state: {
                                    display:
                                      '{{$records[$index].source && $records[$index].source.databaseType.toLowerCase().includes("mongo")?"visible":"hidden"}}',
                                  },
                                },
                              },
                            },
                            params: {
                              type: 'object',
                              properties: {
                                mongoQuery: {
                                  title: ' ',
                                  'x-decorator-props': {
                                    colon: false,
                                  },
                                  type: 'void',
                                  'x-reactions': {
                                    fulfill: {
                                      state: {
                                        visible:
                                          '{{$records[$index].source && $records[$index].source.databaseType && $records[$index].source.databaseType.toLowerCase().includes("mongo") &&$records[$index].source.customCommand.command==="executeQuery"}}',
                                      },
                                    },
                                  },
                                  properties: {
                                    op: {
                                      type: 'string',
                                      default: 'find',
                                    },
                                    collection: {
                                      type: 'string',
                                      'x-reactions': {
                                        fulfill: {
                                          state: {
                                            value: '{{$values.tableName}}',
                                          },
                                        },
                                      },
                                    },
                                    filter: {
                                      title: ' ',
                                      'x-decorator-props': {
                                        colon: false,
                                      },
                                      type: 'string',
                                      'x-decorator': 'FormItem',
                                      description: i18n.t('packages_dag_nodes_table_jinzhichiqu'),
                                      'x-component': 'JsonEditor',
                                      'x-component-props': {
                                        options: { showPrintMargin: false, useWrapMode: true },
                                      },
                                    },
                                  },
                                },
                                mongoAgg: {
                                  title: ' ',
                                  'x-decorator-props': {
                                    colon: false,
                                  },
                                  type: 'void',
                                  'x-reactions': {
                                    fulfill: {
                                      state: {
                                        visible:
                                          '{{$records[$index].source && $records[$index].source.databaseType && $records[$index].source.databaseType.toLowerCase().includes("mongo") && $records[$index].source.customCommand.command==="aggregate"}}',
                                      },
                                    },
                                  },
                                  properties: {
                                    collection: {
                                      type: 'string',
                                      'x-reactions': {
                                        fulfill: {
                                          state: {
                                            value: '{{!!$records[$index].source && $records[$index].source.tableName}}',
                                          },
                                        },
                                      },
                                    },
                                    pipeline: {
                                      type: 'string',
                                      title: ' ',
                                      'x-decorator-props': {
                                        colon: false,
                                      },
                                      'x-decorator': 'FormItem',
                                      description: i18n.t('packages_dag_nodes_table_shiligro'),
                                      'x-component': 'JsonEditor',
                                      'x-component-props': {
                                        options: { showPrintMargin: false, useWrapMode: true },
                                      },
                                    },
                                  },
                                },
                                sql: {
                                  title: ' ',
                                  'x-decorator-props': {
                                    colon: false,
                                  },
                                  type: 'string',
                                  'x-decorator': 'FormItem',
                                  'x-component': 'SqlEditor',
                                  'x-component-props': {
                                    options: { showPrintMargin: false, useWrapMode: true },
                                  },
                                  'x-reactions': {
                                    fulfill: {
                                      state: {
                                        visible:
                                          '{{!!$records[$index].source && $records[$index].source.enableCustomCommand && $records[$index].source.databaseType && !$records[$index].source.databaseType.toLowerCase().includes("mongo")}}',
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  visible: `{{!!$records[$index].source && $records[$index].source.enableCustomCommand}}`,
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    target: {
                      type: 'object',
                      'x-component': 'FormGrid.GridColumn',
                      properties: {
                        connectionId: {
                          type: 'string',
                          title: '>',
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  display: `{{$values.taskMode !== 'pipeline'?'visible':'hidden'}}`,
                                },
                              },
                            },
                          ],
                        },
                        nodeId: {
                          type: 'string',
                          title: '>',
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          'x-component-props': {
                            onChange: '{{ (val) => onChangeSourceNode(val, $values, $records[$index], "target") }}',
                          },
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  display: `{{$values.taskMode === 'pipeline'?'visible':'hidden'}}`,
                                },
                              },
                            },
                          ],
                        },
                        table: {
                          type: 'string',
                          title: i18n.t('packages_business_components_conditionbox_mubiaobiao'),
                          'x-decorator': 'FormItem',
                          'x-component': 'AsyncSelect',
                          'x-component-props': {
                            method: `{{loadTableOptions}}`,
                            params: {
                              connectionId: '{{$records[$index].target && $records[$index].target.connectionId}}',
                              nodeId: '{{$records[$index].target && $records[$index].target.nodeId}}',
                              isDbClone: '{{$values.$isDbClone}}',
                              nodesOptions: '{{$values.nodesOptions}}',
                            },
                            itemQuery: 'name',
                            lazy: true,
                            onSetSelected:
                              '{{ (val) => onSetSelectedTable(val, $values, $records[$index], "target") }}',
                          },
                        },
                        sortColumnList: {
                          type: 'array',
                          title: i18n.t('packages_business_verification_indexField'),
                          'x-decorator': 'FormItem',
                          'x-component': 'AsyncSelect',
                          'x-component-props': {
                            method: `{{loadTableFieldList}}`,
                            multiple: true,
                            collapseTags: true,
                            collapseTagsTooltip: true,
                            params: {
                              nodeId: '{{$records[$index].target && $records[$index].target.nodeId}}',
                              connectionId: '{{$records[$index].target && $records[$index].target.connectionId}}',
                              table: '{{$records[$index].target && $records[$index].target.table}}',
                              isDbClone: '{{$values.$isDbClone}}',
                              nodesOptions: '{{$values.nodesOptions}}',
                              onChange: '{{ (val) => { $values.target.sortColumn = val.join() } }}',
                            },
                            itemQuery: 'name',
                            lazy: true,
                          },
                          'x-reactions': {
                            fulfill: {
                              state: {
                                display: `{{$values.inspectMethod !== 'row_count'?'visible':'hidden'}}`,
                              },
                            },
                          },
                        },
                        enableCustomCommand: {
                          title: i18n.t('packages_business_components_conditionbox_mubiaobiaoshuju'),
                          type: 'boolean',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            className: 'item-control-horizontal',
                            layout: 'horizontal',
                            tooltip: '',
                          },
                          'x-component': 'Switch',
                          default: false,
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  visible: `{{$records[$index].target && $records[$index].target.capabilities && $records[$index].target.capabilities.some(item => item.id === 'execute_command_function')}}`,
                                },
                              },
                            },
                          ],
                        },
                        customCommand: {
                          type: 'object',
                          properties: {
                            command: {
                              title: ' ',
                              'x-decorator-props': {
                                colon: false,
                              },
                              type: 'string',
                              default: 'executeQuery',
                              'x-decorator': 'FormItem',
                              'x-component': 'Radio.Group',
                              enum: [
                                { label: i18n.t('public_query'), value: 'executeQuery' },
                                { label: i18n.t('public_aggregate'), value: 'aggregate' },
                              ],
                              'x-reactions': {
                                fulfill: {
                                  state: {
                                    display:
                                      '{{$records[$index].target && $records[$index].target.databaseType && $records[$index].target.databaseType.toLowerCase().includes("mongo")?"visible":"hidden"}}',
                                  },
                                },
                              },
                            },
                            params: {
                              type: 'object',
                              properties: {
                                mongoQuery: {
                                  title: ' ',
                                  'x-decorator-props': {
                                    colon: false,
                                  },
                                  type: 'void',
                                  'x-reactions': {
                                    fulfill: {
                                      state: {
                                        visible:
                                          '{{$records[$index].target && $records[$index].target.databaseType && $records[$index].target.databaseType.toLowerCase().includes("mongo") && $records[$index].target.customCommand.command==="executeQuery"}}',
                                      },
                                    },
                                  },
                                  properties: {
                                    op: {
                                      type: 'string',
                                      default: 'find',
                                    },
                                    collection: {
                                      type: 'string',
                                      'x-reactions': {
                                        fulfill: {
                                          state: {
                                            value: '{{$values.tableName}}',
                                          },
                                        },
                                      },
                                    },
                                    filter: {
                                      title: ' ',
                                      'x-decorator-props': {
                                        colon: false,
                                      },
                                      type: 'string',
                                      'x-decorator': 'FormItem',
                                      description: i18n.t('packages_dag_nodes_table_jinzhichiqu'),
                                      'x-component': 'JsonEditor',
                                      'x-component-props': {
                                        options: { showPrintMargin: false, useWrapMode: true },
                                      },
                                    },
                                  },
                                },
                                mongoAgg: {
                                  title: ' ',
                                  'x-decorator-props': {
                                    colon: false,
                                  },
                                  type: 'void',
                                  'x-reactions': {
                                    fulfill: {
                                      state: {
                                        visible:
                                          '{{$records[$index].target && $records[$index].target.databaseType && $records[$index].target.databaseType.toLowerCase().includes("mongo") && $records[$index].target.customCommand.command==="aggregate"}}',
                                      },
                                    },
                                  },
                                  properties: {
                                    collection: {
                                      type: 'string',
                                      'x-reactions': {
                                        fulfill: {
                                          state: {
                                            value: '{{$records[$index].target && $records[$index].target.tableName}}',
                                          },
                                        },
                                      },
                                    },
                                    pipeline: {
                                      title: ' ',
                                      'x-decorator-props': {
                                        colon: false,
                                      },
                                      type: 'string',
                                      'x-decorator': 'FormItem',
                                      description: i18n.t('packages_dag_nodes_table_shiligro'),
                                      'x-component': 'JsonEditor',
                                      'x-component-props': {
                                        options: { showPrintMargin: false, useWrapMode: true },
                                      },
                                    },
                                  },
                                },
                                sql: {
                                  title: ' ',
                                  'x-decorator-props': {
                                    colon: false,
                                  },
                                  type: 'string',
                                  'x-decorator': 'FormItem',
                                  'x-component': 'SqlEditor',
                                  'x-component-props': {
                                    options: { showPrintMargin: false, useWrapMode: true },
                                  },
                                  'x-reactions': {
                                    fulfill: {
                                      state: {
                                        visible:
                                          '{{$records[$index].target && $records[$index].target.enableCustomCommand && $records[$index].target.databaseType && !$records[$index].target.databaseType.toLowerCase().includes("mongo")}}',
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  visible: `{{$records[$index].target && $records[$index].target.enableCustomCommand}}`,
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                },
                space4: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    className: 'mb-0',
                  },
                  'x-component': 'Space',
                  'x-reactions': {
                    fulfill: {
                      state: {
                        display: `{{$values.inspectMethod === 'field'?'visible':'hidden'}}`,
                      },
                    },
                  },
                  properties: {
                    modeType: {
                      type: 'string',
                      title: i18n.t('packages_business_components_fieldbox_daijiaoyanmoxing'),
                      'x-decorator': 'FormItem',
                      'x-component': 'Radio.Group',
                      'x-component-props': {
                        onChange: `{{val=>onChangeModeType(val,$records[$index])}}`,
                        disabled: '{{!$records[$index].source.table || !$records[$index].target.table}}',
                      },
                      default: 'all',
                      enum: [
                        {
                          label: i18n.t('packages_business_components_fieldbox_quanziduan'),
                          value: 'all',
                        },
                        {
                          label: i18n.t('packages_business_connections_databaseform_zidingyi'),
                          value: 'custom',
                        },
                      ],
                    },
                    modeTypeDialog: {
                      type: 'void',
                      'x-decorator': 'FormItem',
                      'x-component': 'VerifyFieldsDialog',
                      'x-component-props': {
                        option: '{{ $records[$index] }}',
                        onChange:
                          '{{ function (val) {$records[$index].source.columns=JSON.parse(JSON.stringify(val.map(t=>t.source)));$records[$index].target.columns=val.map(t=>t.target)} }}',
                      },
                      'x-reactions': {
                        fulfill: {
                          state: {
                            display: `{{$records[$index].modeType === 'custom'?'visible':'hidden'}}`,
                          },
                        },
                      },
                    },
                  },
                },
                showAdvancedVerification: {
                  type: 'boolean',
                  'x-component': 'Checkbox',
                  'x-component-props': {
                    label: i18n.t('packages_business_verification_advanceVerify'),
                  },
                  default: false,
                  'x-reactions': {
                    fulfill: {
                      state: {
                        display: `{{$values.inspectMethod === 'field'?'visible':'hidden'}}`,
                      },
                    },
                  },
                },
                webScript: {
                  title: i18n.t('packages_business_verification_JSVerifyLogic'),
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'JsEditorDialog',
                  'x-component-props': {
                    height: 500,
                    onChange: '{{()=>{$records[$index].jsEngineName = "graal.js"}}}',
                  },
                  default: false,
                  'x-reactions': {
                    fulfill: {
                      state: {
                        display: `{{$records[$index].showAdvancedVerification && $values.inspectMethod === 'field'?'visible':'hidden'}}`,
                      },
                    },
                  },
                },
                remove: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.Remove',
                },
              },
            },
          },
          tasksButton: {
            type: 'void',
            properties: {
              space0: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'Space',
                properties: {
                  add: {
                    type: 'void',
                    'x-component': 'Button',
                    'x-component-props': {
                      onClick: '{{ () => onClickAddItem($values) }}',
                    },
                    'x-content': '添加表',
                  },
                  autoAdd: {
                    type: 'void',
                    'x-component': 'Button',
                    'x-component-props': {
                      type: 'primary',
                      disabled: '{{ !!$values.tasks.length || !$values.flowId }}',
                      onClick: '{{ () => onClickAutoAddItem($values) }}',
                    },
                    'x-content': '自动添加表',
                    'x-reactions': [
                      {
                        fulfill: {
                          state: {
                            display: `{{$values.taskMode === 'pipeline'?'visible':'hidden'}}`,
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      }
    },
    async setData(id) {
      try {
        const connectionsOptions = await this.schemaScope.loadConnectionsOptions()

        const data = await inspectApi.findOne({
          filter: JSON.stringify({
            where: {
              id: id,
            },
          }),
        })
        // TODO需要精简不需要的属性
        data.tasks.forEach((el) => {
          if (el.webScript) {
            // el.webScript = 'function validate(sourceRow){' + el.webScript + '}'
            el.webScript = el.webScript.replace('function validate(sourceRow){', '').replace(/\}$/, '')
          }
          el.source.capabilities =
            connectionsOptions.find((t) => t.value === el.source.connectionId)?.attrs?.capabilities || []
          el.source.fields = []
          el.source.sortColumnList = el.source.sortColumn.split(',')
          el.target.capabilities =
            connectionsOptions.find((t) => t.value === el.target.connectionId)?.attrs?.capabilities || []
          el.target.fields = []
          el.target.sortColumnList = el.target.sortColumn.split(',')
        })

        this.$nextTick(() => {
          const schemaFormInstance = this.$refs.schemaToForm.getForm?.()
          schemaFormInstance.setValues(data)
        })
      } catch (e) {
        console.log('error', e)
      }
    },
    //获取dataflow数据
    getFlowOptions() {
      this.loading = true
      const self = this
      let id = this.$route.params.id
      let where = {
        status: {
          inq: ['running', 'stop', 'complete'],
        },
      }
      taskApi
        .get({
          filter: JSON.stringify({
            where: where,
            fields: {
              id: true,
              name: true,
              status: true,
            },
            order: 'createTime DESC',
            limit: 999,
            skip: 0,
          }),
        })
        .then(async (data) => {
          let list = data?.items || []
          this.flowOptions = list
          let flow = this.flowOptions.find((item) => item.id === this.form.flowId) || {}
          this.form.name = this.form.name || flow.name || ''
          this.form['dataFlowName'] = flow.name
          if (id) {
            const details = await this.getData(id)
            if (this.form.taskMode === 'pipeline') {
              await this.getFlowStages(details.flowId)
            }
            this.form = Object.assign({}, this.form, details)
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    //获取表单数据
    async getData(id) {
      try {
        const data = await inspectApi.findOne({
          filter: JSON.stringify({
            where: {
              id: id,
            },
          }),
        })
        if (data) {
          const _self = this
          const haveTaskId = data.tasks.some((t) => !!t.taskId)
          // 加载数据源的Capabilities
          let capabilitiesMap = {}
          if (haveTaskId) {
            capabilitiesMap = _self.$refs.conditionBox.getMatchCapabilitiesMap()
          } else {
            capabilitiesMap = await _self.$refs.conditionBox.getCapabilities([
              ...data.tasks.map((t) => t.source.connectionId),
              ...data.tasks.map((t) => t.target.connectionId),
            ])
          }
          data.tasks = data.tasks.map((t) => {
            t.source = Object.assign({}, TABLE_PARAMS, t.source)
            t.target = Object.assign({}, TABLE_PARAMS, t.target)
            t.source.capabilities = capabilitiesMap[t.source.connectionId]
            t.target.capabilities = capabilitiesMap[t.target.connectionId]
            if (t.source.nodeId) {
              t.source.currentLabel = `${t.source.nodeName} / ${t.source.connectionName}`
              t.target.currentLabel = `${t.target.nodeName} / ${t.target.connectionName}`
            }
            t.id = t.taskId
            return t
          })

          if (!data.timing) {
            data.timing = this.form.timing
          }
          data.taskMode = data.flowId ? 'pipeline' : 'random'
          // 历史数据，默认不打开；新数据默认打开
          const { alarmSettings = [] } = data
          data.alarmSettings =
            this.form.alarmSettings?.map((t) => {
              const f = alarmSettings.find((item) => item.key === t.key)
              if (f) return Object.assign(t, f)
              t.notify = []
              t.open = false
              return t
            }) || []

          return data
        }
      } catch (e) {
        return {}
      }
    },
    async getFlowStages(id, cb) {
      this.loading = true
      try {
        id = id || this.form.flowId
        const data = await taskApi.getId(id)
        this.isDbClone = data.syncType === 'migrate'
        let edges = data.dag?.edges || []
        let nodes = data.dag?.nodes || []
        const findOne = this.flowOptions.find((t) => t.id === id)
        if (!findOne) {
          this.flowOptions.unshift({
            id: data.id,
            name: data.name,
          })
        }
        if (!edges.length) {
          if (cb) {
            setTimeout(() => {
              cb()
              this.loading = false
            }, 800)
          } else {
            this.loading = false
          }
          return { items: [], total: 0 }
        }
        let stages = []
        nodes.forEach((n) => {
          let outputLanes = []
          let inputLanes = []
          edges.forEach((e) => {
            if (e.source === n.id) {
              outputLanes.push(e.target)
            }
            if (e.target === n.id) {
              inputLanes.push(e.source)
            }
          })
          stages.push(
            Object.assign({}, n, {
              outputLanes,
              inputLanes,
            }),
          )
        })

        this.edges = edges
        this.allStages = stages
        if (cb) {
          setTimeout(() => {
            cb()
            this.loading = false
          }, 800)
        } else {
          this.loading = false
        }
      } catch (e) {
        this.loading = false
      }
    },
    goBack() {
      this.$confirm(
        this.$t('packages_business_verification_backConfirmMessage'),
        this.$t('packages_business_verification_backConfirmTitle'),
        {
          type: 'warning',
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        this.$router.back()
      })
    },
    save(saveOnly = false) {
      const schemaFormInstance = this.$refs.schemaToForm.getForm?.()
      schemaFormInstance?.validate().then(() => {
        const formValues = this.$refs.schemaToForm.getFormValues()
        // TODO需要精简不需要的属性
        delete formValues.tasksOptions
        delete formValues.nodesOptions
        delete formValues.connectionsOptions

        let { tasks } = formValues
        // 自动过滤出完整数据，以及索引字段数量不相等的情况
        tasks = tasks.filter(t => {
          if (t.webScript) {
            t.webScript = 'function validate(sourceRow){' + t.webScript + '}'
          }
          delete t.source.capabilities
          delete t.source.fields
          delete t.source.sortColumnList
          delete t.target.capabilities
          delete t.target.fields
          delete t.target.sortColumnList

          if (this.form.inspectMethod === 'row_count' || this.form.inspectMethod === 'hash') {
            return t.source.table && t.target.table
          }

          return (
            t.source.sortColumn && t.source.sortColumn.split(',').length === t.target.sortColumn.split(',').length
          )
        })

        // 检查校验类型是否支持
        const notSupportList = this.notSupport[this.form.inspectMethod]
        let notSupportStr = ''

        for (const t of tasks) {
          if (notSupportList.includes(t.source.databaseType)) {
            notSupportStr = t.source.databaseType
            break
          }
          if (notSupportList.includes(t.target.databaseType)) {
            notSupportStr = t.target.databaseType
            break
          }

          // hash 不支持异构数据库
          if (this.form.inspectMethod === 'hash' && t.source.databaseType !== t.target.databaseType) {
            notSupportStr = this.$t('packages_business_heterogeneous_database')
            break
          }
        }

        if (notSupportStr)
          return this.$message.error(
            this.inspectMethodMap[this.form.inspectMethod] +
            ', ' +
            this.$t('packages_dag_components_node_zanbuzhichi') +
            notSupportStr
          )

        if (!tasks.length) {
          return this.$message.error(this.$t('packages_business_verification_tasksVerifyCondition'))
        }

        const alarmSettingsKeys =
          formValues.inspectMethod === 'row_count'
            ? ['INSPECT_TASK_ERROR', 'INSPECT_COUNT_ERROR']
            : ['INSPECT_TASK_ERROR', 'INSPECT_VALUE_ERROR']
        const alarmSettings = formValues.alarmSettings.filter((t) => alarmSettingsKeys.includes(t.key))

        inspectApi[formValues.id ? 'patch' : 'post'](
          Object.assign({}, formValues, {
            fullMatchKeep: formValues.keep,
            status: saveOnly ? 'waiting' : 'scheduling',
            ping_time: 0,
            tasks: formValues.tasks,
            platformInfo: {
              agentType: 'private',
            },
            byFirstCheckId: '',
            browserTimezoneOffset: new Date().getTimezoneOffset(),
            alarmSettings,
          }),
        ).then(() => {
          this.$message.success(this.$t('public_message_save_ok'))
          this.$router.back() // back 保留上个路由的参数
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.verify-form-wrap {
  height: 100%;
  overflow: hidden;
  .section-wrap-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20px;
    border-radius: 4px;
    background-color: #fff;
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
  }
}
.verify-form-title {
  margin-bottom: 24px;
  line-height: 22px;
  font-size: 14px;
  color: map-get($fontColor, dark);
}
.form-item {
  margin-bottom: 32px;
}
.form-select {
  width: 276px;
}
.form-input {
  width: 505px;
}

:deep(.js-wrap) {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  .jsBox {
    display: flex;
    flex-direction: column;
    flex: 1;
    .js-fixText {
      line-height: 25px;}

    .js-fixContent {
      margin-left: 60px;
    }
  }
  .example {
    width: 300px;}

  .js-editor {
    border: 1px solid map-get($borderColor, light);
  }
}

.el-form {
  :deep(.el-form-item__error) {
    margin-top: 8px;
  }
}
</style>
