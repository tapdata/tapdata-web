<template>
  <div class="joint-table" :class="{ error: !!jointErrorMessage }">
    <div class="joint-table-header">
      <div>
        <span>{{ $t('packages_business_verification_verifyCondition') }}</span>
        <span v-if="!list.length" class="ml-4 color-danger">{{
          $t('packages_business_verification_message_error_joint_table_not_set')
        }}</span>
        <span class="color-danger ml-6">{{ jointErrorMessage }}</span>
      </div>
      <div>
        <ElLink
          v-if="inspectMethod !== 'row_count' && list.some(t => !t.source.sortColumn || !t.target.sortColumn)"
          type="primary"
          :disabled="!list.length"
          class="mr-4"
          @click="handleClearIndexEmpty"
          >{{ $t('packages_business_components_conditionbox_yijianqingchusuo') }}</ElLink
        >
        <ElLink type="primary" :disabled="!list.length" @click="handleClear">{{
          $t('packages_business_verification_clear')
        }}</ElLink>
      </div>
    </div>
    <DynamicScroller
      :items="list"
      :min-item-size="30"
      id="data-verification-form"
      ref="virtualScroller"
      key-field="id"
      class="joint-table-main scroller px-2 py-1 h-100"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
          :size-dependencies="[item.id, item.source, item.target]"
        >
          <div class="joint-table-item" :class="['joint-table-item']" :key="item.id + index">
            <div class="joint-table-setting overflow-hidden">
              <div class="flex justify-content-between">
                <div class="cond-item__title flex align-items-center">
                  <span class="font-color-main fs-7">{{
                    $t('packages_business_components_conditionbox_jianyantiaojian')
                  }}</span>
                  <span class="ml-1">{{ index + 1 }}</span>
                </div>
                <div class="flex align-items-center">
                  <ElButton type="text" @click.stop="removeItem(index)">{{ $t('public_button_delete') }}</ElButton>
                </div>
              </div>
              <div class="setting-item mt-4" :key="'connection' + item.id">
                <label class="item-label"
                  >{{ $t('packages_business_components_conditionbox_daijiaoyanlianjie') }}:</label
                >
                <AsyncSelect
                  v-model="item.source.connectionId"
                  :method="getConnectionsListMethod"
                  :currentLabel="item.source.connectionName"
                  itemQuery="name"
                  lazy
                  filterable
                  class="item-select"
                  :key="'sourceConnectionId' + item.id"
                  :onSetSelected="useHandle(handleSetSelectedConnection, item.source)"
                  @change="handleChangeConnection(arguments[0], item.source)"
                >
                </AsyncSelect>
                <span class="item-icon fs-6">
                  <i class="el-icon-arrow-right"></i>
                </span>
                <AsyncSelect
                  v-model="item.target.connectionId"
                  :method="getConnectionsListMethod"
                  :currentLabel="item.target.connectionName"
                  itemQuery="name"
                  lazy
                  filterable
                  class="item-select"
                  :key="'targetConnectionId' + item.id"
                  :onSetSelected="useHandle(handleSetSelectedConnection, item.target)"
                  @change="handleChangeConnection(arguments[0], item.target)"
                >
                </AsyncSelect>
              </div>
              <div class="setting-item mt-4" :key="'table' + item.id">
                <label class="item-label">{{ $t('packages_business_components_conditionbox_laiyuanbiao') }}:</label>
                <AsyncSelect
                  v-model="item.source.table"
                  :method="getTableListMethod"
                  :params="{
                    connectionId: item.source.connectionId,
                    nodeId: item.source.nodeId
                  }"
                  itemQuery="name"
                  itemType="string"
                  lazy
                  filterable
                  class="item-select"
                  :key="'sourceTable' + item.id"
                  @change="handleChangeTable(arguments[0], item, index, 'source')"
                >
                </AsyncSelect>
                <span class="item-icon">{{ $t('packages_business_components_conditionbox_mubiaobiao') }}:</span>
                <AsyncSelect
                  v-model="item.target.table"
                  :method="getTableListMethod"
                  :params="{
                    connectionId: item.target.connectionId,
                    nodeId: item.target.nodeId
                  }"
                  itemQuery="name"
                  itemType="string"
                  lazy
                  filterable
                  class="item-select"
                  :key="'targetTable' + item.id"
                  @change="handleChangeTable(arguments[0], item, index, 'target')"
                >
                </AsyncSelect>
              </div>
              <div v-if="inspectMethod !== 'row_count'" class="setting-item mt-4">
                <label class="item-label">{{ $t('packages_business_verification_indexField') }}: </label>
                <MultiSelection
                  v-model="item.source.sortColumn"
                  class="item-select"
                  :class="{ 'empty-data': !item.source.sortColumn }"
                  :options="item.source.fields"
                  :id="'item-source-' + index"
                  @focus="handleFocus(item.source)"
                ></MultiSelection>
                <span class="item-icon"></span>
                <MultiSelection
                  v-model="item.target.sortColumn"
                  class="item-select"
                  :class="{ 'empty-data': !item.target.sortColumn }"
                  :options="item.target.fields"
                  @focus="handleFocus(item.target)"
                ></MultiSelection>
              </div>
              <div v-if="inspectMethod !== 'row_count'" class="setting-item align-items-center mt-4">
                <label class="item-label">{{ $t('packages_business_components_fieldbox_daijiaoyanmoxing') }}:</label>
                <ElRadioGroup
                  v-model="item.modeType"
                  :disabled="getModeTypeDisabled(item)"
                  @change="handleChangeModeType(arguments[0], item, index)"
                >
                  <ElRadio label="all">{{ $t('packages_business_components_fieldbox_quanziduan') }}</ElRadio>
                  <ElRadio label="custom">{{ $t('packages_business_connections_databaseform_zidingyi') }}</ElRadio>
                </ElRadioGroup>
                <ElLink
                  v-if="item.modeType === 'custom'"
                  type="primary"
                  class="ml-4"
                  @click="handleCustomFields(item, index)"
                >
                  {{ $t('packages_business_components_conditionbox_chakanzidingyi') }}
                  ({{ item.source.columns ? item.source.columns.length : 0 }})</ElLink
                >
              </div>
              <div class="setting-item mt-4">
                <ElCheckbox
                  v-model="item.showAdvancedVerification"
                  v-show="inspectMethod === 'field'"
                  @input="handleChangeAdvanced(item)"
                  >{{ $t('packages_business_verification_advanceVerify') }}</ElCheckbox
                >
              </div>
              <div class="setting-item mt-4" v-if="item.showAdvancedVerification && inspectMethod === 'field'">
                <label class="item-label">{{ $t('packages_business_verification_JSVerifyLogic') }}: </label>
                <ElButton v-if="!item.webScript || item.webScript === ''" @click="addScript(index)">{{
                  $t('packages_business_verification_addJS')
                }}</ElButton>
                <template v-else>
                  <ElLink type="primary" class="ml-4" @click="editScript(index)">{{ $t('public_button_edit') }}</ElLink>
                  <ElLink type="primary" class="ml-4" @click="removeScript(index)">{{
                    $t('public_button_delete')
                  }}</ElLink>
                </template>
              </div>
              <div
                class="setting-item mt-4"
                v-if="inspectMethod === 'field' && item.showAdvancedVerification && item.webScript"
              >
                <pre class="item-script">{{ item.webScript }}</pre>
              </div>
            </div>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div class="joint-table-footer">
      <ElButton size="mini" @click="addItem">{{ $t('packages_business_verification_addTable') }}</ElButton>
      <ElButton
        v-if="taskId"
        type="primary"
        size="mini"
        :disabled="!!list.length"
        :loading="autoAddTableLoading"
        @click="autoAddTable"
        >{{ $t('packages_business_verification_button_auto_add_table') }}</ElButton
      >
    </div>
    <ElDialog
      width="60%"
      :title="$t('packages_business_verification_JSVerifyLogic')"
      :visible.sync="dialogAddScriptVisible"
      :before-close="handleAddScriptClose"
    >
      <div class="js-wrap">
        <div class="jsBox">
          <div class="js-fixText"><span style="color: #0000ff">function </span><span> validate(sourceRow){</span></div>
          <VCodeEditor v-model="webScript" height="500" class="js-editor"></VCodeEditor>
          <div class="js-fixText">}</div>
        </div>
        <GitBook
          v-resize.left="{
            minWidth: 350,
            maxWidth: 500
          }"
          :value="doc"
          class="example ml-4 color-primary"
        ></GitBook>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleAddScriptClose">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton type="primary" size="mini" @click="submitScript">{{ $t('public_button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <FieldDialog ref="fieldDialog" @save="handleChangeFields"></FieldDialog>
  </div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { merge, cloneDeep, uniqBy } from 'lodash'

import i18n from '@tap/i18n'
import { AsyncSelect } from '@tap/form'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { uuid } from '@tap/shared'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { GitBook, VCodeEditor } from '@tap/component'
import resize from '@tap/component/src/directives/resize'

import { TABLE_PARAMS, META_INSTANCE_FIELDS, DATA_NODE_TYPES } from './const'
import MultiSelection from '../MultiSelection'
import FieldDialog from './FieldDialog'

export default {
  name: 'ConditionBox',

  directives: {
    resize
  },

  components: {
    AsyncSelect,
    DynamicScroller,
    DynamicScrollerItem,
    VCodeEditor,
    GitBook,
    MultiSelection,
    FieldDialog
  },

  props: {
    taskId: String,
    isDB: Boolean,
    inspectMethod: String,
    data: {
      type: Array,
      default: () => []
    },
    allStages: {
      type: Array,
      default: () => []
    },
    edges: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      list: [],
      jointErrorMessage: '',
      fieldsMap: {},
      autoAddTableLoading: false,
      dynamicSchemaMap: {},
      dialogAddScriptVisible: false,
      formIndex: '',
      webScript: '',
      jsEngineName: 'graal.js',
      doc: ''
    }
  },

  computed: {
    flowStages() {
      let types = this.isDB ? ['database'] : ['table']
      return this.allStages.filter(stg => types.includes(stg.type))
    }
  },

  watch: {
    taskId(v1, v2) {
      if (v1 !== v2) {
        this.clearList()
      }
    },

    data: {
      deep: true,
      handler() {
        this.loadList()
      }
    }
  },

  created() {
    this.loadDoc()
  },

  methods: {
    async getConnectionsListMethod(filter) {
      if (this.taskId) {
        return this.getConnectionsInTask(filter)
      }
      try {
        const _filter = {
          where: {
            createType: {
              $ne: 'System'
            }
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
            capabilities: 1
          },
          order: ['status DESC', 'name ASC']
        }
        let result = await connectionsApi.get({
          filter: JSON.stringify(merge(filter, _filter))
        })

        result.items = result.items.map(item => {
          const findDynamicSchema = item.capabilities.find(t => t.id === 'dynamic_schema')
          if (findDynamicSchema) {
            this.dynamicSchemaMap[item.id] = true
          }
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} ${item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''}`,
            value: item.id,
            databaseType: item.database_type
          }
        })

        return result
      } catch (e) {
        return { items: [], total: 0 }
      }
    },

    async getTableListMethod(filter = {}) {
      const { connectionId, nodeId } = filter
      if (!connectionId) {
        return { items: [], total: 0 }
      }
      if (this.taskId) {
        return this.getTablesInTask(nodeId, connectionId, filter)
      }
      try {
        const size = filter.size || 20
        const page = filter.page || 1
        let params = {
          where: {
            meta_type: 'table',
            sourceType: 'SOURCE',
            is_deleted: false,
            'source.id': connectionId
          },
          skip: (page - 1) * size,
          limit: size,
          order: 'createTime DESC'
        }
        const keyword = filter.where?.name?.like
        if (keyword) {
          params.where.name = filter.where.name
        }
        const res = await metadataInstancesApi.tapTables({
          filter: JSON.stringify(params)
        })
        let result = {}
        result.items = res.items.map(t => t.name)
        result.total = res.total
        res.items.forEach(el => {
          // 缓存起来
          this.setFieldsByItem(
            [nodeId, connectionId, el.name],
            Object.values(el.nameFieldMap || {}).map(t => {
              const { id, fieldName, primaryKeyPosition } = t
              return { id, field_name: fieldName, primary_key_position: primaryKeyPosition }
            })
          )
        })
        return result
      } catch (e) {
        return { items: [], total: 0 }
      }
    },

    async getConnectionsInTask(filter = {}) {
      const keyword = filter.where?.name?.like
      let arr
      if (keyword) {
        arr = this.flowStages.filter(t => t.attrs?.connectionName.includes(filter.where?.name?.like))
      } else {
        arr = this.flowStages
      }
      const result = uniqBy(
        arr.map(t => {
          const nodeId = t.id
          const nodeName = t.name
          const connectionId = t.connectionId
          const connectionName = t.attrs?.connectionName
          const findDynamicSchema = t.attrs?.capabilities.find(t => t.id === 'dynamic_schema')
          if (findDynamicSchema) {
            this.dynamicSchemaMap[t.connectionId] = true
          }
          return {
            attrs: { nodeId, nodeName, connectionId, connectionName },
            name: `${nodeName} / ${connectionName}`,
            value: `${nodeId}/${connectionId}`,
            label: `${nodeName} / ${connectionName}`
          }
        }),
        'value'
      )

      return { items: result, total: result.length }
    },

    async getTablesInTask(nodeId, connectionId, filter = {}) {
      if (!this.flowStages?.length || !this.taskId) {
        return { items: [], total: 0 }
      }
      const { isDB } = this

      const findNode = this.flowStages.find(t => t.id === nodeId)
      if (!findNode) {
        return { items: [], total: 0 }
      }

      let params = {
        nodeId,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: filter?.page || 1,
        pageSize: filter?.size || 20
      }
      const keyword = filter.where?.name?.like
      if (keyword) {
        params.tableFilter = keyword
      }

      let res = await metadataInstancesApi.nodeSchemaPage(params)

      const tableList = res.items?.map(t => t.name) || []
      const total = res.total
      res.items.forEach(el => {
        this.setFieldsByItem(
          [nodeId, connectionId, el.name],
          el.fields.map(t => {
            const { id, field_name, primary_key_position } = t
            return { id, field_name, primary_key_position }
          })
        )
      })
      let tableNames = tableList
      if (isDB) {
        if (!findNode.outputLanes.length) {
          const { tablePrefix, tableSuffix, tableNameTransform } = findNode
          tableNames = tableNames.map(t => {
            let name = (tablePrefix || '') + t + (tableSuffix || '')
            return tableNameTransform ? name[tableNameTransform]() : name
          })
        }
        return { items: tableNames, total: total }
      }
      if (keyword) {
        tableNames = tableNames.filter(t => t.toLowerCase().includes(keyword.toLowerCase()))
      }
      return { items: tableNames, total: tableNames.length }
    },

    /**
     * @desc 获取连线信息
     * @param1 value 节点id
     * @param2 data 整个连线数据
     * @param3 flag true连线下游、false连线上游
     * */
    getLinkData(value, data = [], flag = false) {
      const f = data.find(t => t[flag ? 'source' : 'target'] === value)
      return f ? this.getLinkData(f[!flag ? 'source' : 'target'], data, flag) : value
    },

    // 获取一条线上的源节点和目标节点
    getMatchNodeList() {
      const edgesList = cloneDeep(this.edges)
      let result = uniqBy(
        edgesList.map(t => {
          const source = this.getLinkData(t.source, edgesList)
          const target = this.getLinkData(t.target, edgesList, true)
          const key = source + '_' + target
          return {
            source,
            target,
            key
          }
        }),
        'key'
      )

      return result.map(re => {
        const el = this.flowStages.find(t => t.id === re.source)
        const targetNode = this.flowStages.find(t => t.id === re.target)
        let updateConditionFieldMap = {}
        let tableNames = []
        let tableNameRelation = {}
        if (targetNode.type === 'database') {
          tableNames = el.tableNames
          updateConditionFieldMap = targetNode.updateConditionFieldMap || {}
          tableNameRelation = targetNode.syncObjects?.[0]?.tableNameRelation || []
        } else if (targetNode.type === 'table') {
          tableNames = [targetNode.tableName]
          updateConditionFieldMap[targetNode.tableName] = targetNode.updateConditionFields || []
          tableNameRelation[el.tableName] = targetNode.tableName
        }

        return {
          source: el.id,
          sourceName: el.name,
          target: targetNode.id,
          targetName: targetNode.name,
          sourceConnectionId: el.connectionId,
          sourceConnectionName: el.attrs?.connectionName,
          targetConnectionId: targetNode.connectionId,
          targetConnectionName: targetNode.attrs?.connectionName,
          sourceDatabaseType: el.databaseType,
          targetDatabaseType: targetNode.databaseType,
          updateConditionFieldMap,
          tableNames,
          tableName: targetNode.tableName,
          tableNameRelation
        }
      })
    },

    handleClear() {
      this.$confirm(
        i18n.t('packages_business_components_conditionbox_shifouqingkongsuo'),
        i18n.t('public_message_title_prompt'),
        {
          type: 'warning'
        }
      ).then(res => {
        if (!res) {
          return
        }
        this.clearList()
      })
    },

    handleClearIndexEmpty() {
      this.$confirm(
        i18n.t('packages_business_components_conditionbox_shifouquerenqing'),
        i18n.t('public_message_title_prompt'),
        {
          type: 'warning'
        }
      ).then(res => {
        if (!res) {
          return
        }
        this.list = this.list.filter(t => t.source.sortColumn && t.target.sortColumn)
      })
    },

    clearList() {
      this.list = []
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
        modeType: 'all' // 待校验模型的类型
      }
    },

    addItem() {
      const validateMsg = this.validate()
      if (validateMsg) {
        return this.$message.error(validateMsg)
      }
      this.list.push(this.getItemOptions())
    },

    async autoAddTable() {
      if (!this.taskId || this.list.length) return
      let connectionIds = []
      let tableNames = []
      const matchNodeList = this.getMatchNodeList()
      matchNodeList.forEach(m => {
        connectionIds.push(m.sourceConnectionId)
        connectionIds.push(m.targetConnectionId)
        tableNames.push(...m.tableNames)
      })
      if (!matchNodeList.length) {
        if (this.allStages.length > this.flowStages.length)
          return this.$message.error(i18n.t('packages_business_components_conditionbox_cunzaichulijiedian_wufazidong'))
        return this.$message.error(i18n.t('packages_business_components_conditionbox_suoxuanrenwuque'))
      }
      let where = {
        meta_type: {
          inq: DATA_NODE_TYPES
        },
        'source.id': {
          inq: Array.from(new Set(connectionIds))
        },
        original_name: {
          inq: Array.from(new Set(tableNames))
        }
      }
      this.autoAddTableLoading = true
      metadataInstancesApi
        .findInspect({
          where,
          fields: META_INSTANCE_FIELDS
        })
        .then(data => {
          let list = []
          matchNodeList.forEach(m => {
            const {
              source,
              target,
              sourceName,
              targetName,
              sourceConnectionId,
              targetConnectionId,
              sourceConnectionName,
              targetConnectionName,
              sourceDatabaseType,
              targetDatabaseType,
              updateConditionFieldMap,
              tableNameRelation
            } = m

            const sourceTableList = Object.keys(tableNameRelation)
            sourceTableList.forEach((ge, geIndex) => {
              let item = this.getItemOptions()
              // 填充source
              item.source.nodeId = source
              item.source.nodeName = sourceName
              item.source.databaseType = sourceDatabaseType
              item.source.connectionId = `${source}/${sourceConnectionId}`
              item.source.connectionName = `${sourceName} / ${sourceConnectionName}`
              item.source.table = ge // findTable.original_name
              // 填充target
              item.target.nodeId = target
              item.target.nodeName = targetName
              item.target.databaseType = targetDatabaseType
              item.target.connectionId = `${target}/${targetConnectionId}`
              item.target.connectionName = `${targetName} / ${targetConnectionName}`
              item.target.table = tableNameRelation[ge] // findTargetTable.original_name

              const updateList = cloneDeep(updateConditionFieldMap[tableNameRelation[ge]] || [])
              let findTable = data.find(t => t.source.id === sourceConnectionId && t.original_name === ge)
              let findTargetTable = data.find(
                t => t.source.id === targetConnectionId && t.original_name === tableNameRelation[ge]
              )

              if (findTable) {
                let sourceSortColumn = updateList.length
                  ? updateList.join(',')
                  : this.getPrimaryKeyFieldStr(findTable.fields)
                if (updateList.length && findTargetTable?.fields) {
                  sourceSortColumn = findTargetTable.fields
                    .filter(t => updateList.includes(t.field_name))
                    .map(t => t.original_field_name)
                    .join(',')
                }
                item.source.fields = findTable.fields
                item.source.sortColumn = sourceSortColumn
              }

              if (findTargetTable) {
                const targetSortColumn = updateList.length
                  ? updateList.join(',')
                  : this.getPrimaryKeyFieldStr(findTargetTable.fields)
                item.target.fields = findTargetTable.fields
                item.target.sortColumn = targetSortColumn
              }

              list.push(item)
            })
          })
          if (!list.length) {
            return this.$message.error(i18n.t('packages_business_components_conditionbox_suoxuanrenwuque'))
          }
          this.list = list
        })
        .finally(() => {
          this.autoAddTableLoading = false
        })
    },

    removeItem(index) {
      this.list.splice(index, 1)
    },

    loadList() {
      let data = cloneDeep(this.data)
      data.forEach(el => {
        el.modeType = el.source.columns ? 'custom' : 'all'
        if (this.taskId) {
          el.source.connectionId = `${el.source.nodeId}/${el.source.connectionId}`
          el.source.connectionName = `${el.source.nodeName} / ${el.source.connectionName}`
          el.target.connectionId = `${el.target.nodeId}/${el.target.connectionId}`
          el.target.connectionName = `${el.target.nodeName} / ${el.target.connectionName}`
        }
      })
      this.list = data
    },

    getList() {
      let list = cloneDeep(this.list)
      if (this.taskId) {
        list.forEach(el => {
          if (el.modeType === 'all') {
            el.source.columns = null
            el.target.columns = null
          }
          el.source.connectionId = el.source.connectionId?.split('/')?.[1]
          el.source.connectionName = el.source.connectionName?.split(' / ')?.[1]
          el.target.connectionId = el.target.connectionId?.split('/')?.[1]
          el.target.connectionName = el.target.connectionName?.split(' / ')?.[1]
        })
      }
      return list
    },

    handleChangeConnection(val, item) {
      item.table = '' // 重选连接，清空表
      item.sortColumn = '' // 重选连接，清空表
      if (!this.taskId) {
        return
      }
      const result = val.split('/')
      if (result.length === 1) {
        return
      }
      const findNodeId = result[0]
      item.nodeId = findNodeId
    },

    handleSetSelectedConnection(item, val) {
      item.connectionName = val?.currentLabel || val?.name
      if (this.taskId) {
        item.nodeName = item.connectionName?.split(' / ')?.[0]
      }
      item.databaseType = val?.databaseType
    },

    getReverseNodeInfo(data = {}) {
      const {
        source,
        target,
        sourceName,
        targetName,
        sourceConnectionId,
        targetConnectionId,
        sourceConnectionName,
        targetConnectionName,
        sourceDatabaseType,
        targetDatabaseType,
        updateConditionFieldMap,
        tableNames,
        tableName
      } = data
      return {
        source: target,
        target: source,
        sourceName: targetName,
        targetName: sourceName,
        sourceConnectionId: targetConnectionId,
        targetConnectionId: sourceConnectionId,
        sourceConnectionName: targetConnectionName,
        targetConnectionName: sourceConnectionName,
        sourceDatabaseType: targetDatabaseType,
        targetDatabaseType: sourceDatabaseType,
        updateConditionFieldMap,
        tableNames,
        tableName
      }
    },

    handleChangeTable(val, item, index, type) {
      const fields = this.getFieldsByItem(item, type)
      item[type].fields = fields
      item[type].sortColumn = this.getPrimaryKeyFieldStr(fields)

      if (item.modeType === 'custom') {
        item.source.columns = []
        item.target.columns = []
      }

      // 绑定任务，则自动填充目标信息
      if (!this.taskId) {
        return
      }

      // 获取连线信息
      const matchNodeList = this.getMatchNodeList()
      let matchNode = matchNodeList.find(t => [t.source, t.target].includes(item[type].nodeId))
      if (!matchNode) {
        return
      }

      if (matchNode.target === item[type].nodeId) {
        matchNode = this.getReverseNodeInfo(matchNode)
      }
      const {
        target,
        targetName,
        targetConnectionId,
        targetConnectionName,
        sourceDatabaseType,
        targetDatabaseType,
        updateConditionFieldMap,
        tableName,
        tableNameRelation
      } = matchNode

      // 自动填充索引字段
      let updateList = updateConditionFieldMap[val] || {}
      item[type].sortColumn = updateList.length ? updateList.join(',') : this.getPrimaryKeyFieldStr(fields)

      if (type === 'target') {
        item.target.databaseType = targetDatabaseType
        return
      }
      // 自动填充目标连接和表
      item.source.databaseType = sourceDatabaseType

      item.target.nodeId = target
      item.target.nodeName = targetName
      item.target.connectionId = `${target}/${targetConnectionId}`
      item.target.connectionName = `${targetName} / ${targetConnectionName}`
      item.target.table = tableName ? tableName : tableNameRelation[val]

      // 加载目标的字段
      const params = {
        nodeId: target,
        tableFilter: item.target.table,
        page: 1,
        pageSize: 1
      }
      metadataInstancesApi.nodeSchemaPage(params).then(data => {
        item.target.fields =
          data.items?.[0]?.fields.map(t => {
            const { id, field_name, primary_key_position } = t
            return { id, field_name, primary_key_position }
          }) || []
        // 设置主键
        item.target.sortColumn = updateList.length
          ? updateList.join(',')
          : this.getPrimaryKeyFieldStr(item.target.fields)

        const key = [target || '', targetConnectionId, item.target.table].join()
        this.fieldsMap[key] = item.target.fields
      })
    },

    handleChangeAdvanced(item) {
      item.target.targeFilterFalg = false
      item.target.where = ''
    },

    addScript(index) {
      this.formIndex = index
      this.webScript = ''
      this.jsEngineName = 'graal.js'
      this.dialogAddScriptVisible = true
    },

    handleAddScriptClose() {
      this.webScript = ''
      this.formIndex = ''
      this.jsEngineName = 'graal.js'
      this.dialogAddScriptVisible = false
    },

    submitScript() {
      let task = this.list
      let formIndex = this.formIndex
      task[formIndex].webScript = this.webScript
      task[formIndex].jsEngineName = this.jsEngineName
      this.jsEngineName = ''
      this.webScript = ''
      this.formIndex = ''
      this.dialogAddScriptVisible = false
    },

    editScript(index) {
      this.formIndex = index
      let task = this.list
      let script = JSON.parse(JSON.stringify(task[this.formIndex].webScript))
      this.jsEngineName = JSON.parse(JSON.stringify(task[this.formIndex].jsEngineName || 'nashorn'))
      this.webScript = script
      this.dialogAddScriptVisible = true
    },

    removeScript(index) {
      this.$confirm(
        this.$t('packages_business_verification_message_confirm_delete_script'),
        this.$t('public_button_delete'),
        {
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.list[index].webScript = ''
      })
    },

    setFieldsByItem(item = [], data = []) {
      const key = item.filter(t => t).join()
      this.fieldsMap[key] = data
    },

    getFieldsByItem(item, type = 'source') {
      const { nodeId, connectionId, table } = item[type] || {}
      return this.fieldsMap[[nodeId || '', connectionId, table].filter(t => t).join()] || []
    },

    getPrimaryKeyFieldStr(data = []) {
      let sortField = list => {
        return (
          list?.sort((a, b) => {
            return a.field_name > b.field_name ? -1 : 1
          }) || []
        )
      }
      return sortField(data)
        .filter(f => !!f.primaryKey)
        .map(t => t.field_name)
        .join(',')
    },

    useHandle(handle, item) {
      return (...args) => {
        handle(item, ...args)
      }
    },

    handleChangeFieldBox(data, item) {
      item.source.columns = data.map(t => t.source)
      item.target.columns = data.map(t => t.target)
    },

    validate() {
      let tasks = this.getList()
      let index = 0
      let message = ''
      const formDom = document.getElementById('data-verification-form')
      // 判断表名称是否为空
      if (
        tasks.some((c, i) => {
          index = i + 1
          return !c.source.table || !c.target.table
        })
      ) {
        this.$nextTick(() => {
          formDom.childNodes[index - 1]?.querySelector('input')?.focus()
        })
        message = this.$t('packages_business_verification_message_error_joint_table_target_or_source_not_set', {
          val: index
        })
        this.jointErrorMessage = message
        return message
      }
      // 判断表字段校验时，索引字段是否为空
      index = 0
      if (
        ['field', 'jointField'].includes(this.inspectMethod) &&
        tasks.some((c, i) => {
          index = i + 1
          return !c.source.sortColumn || !c.target.sortColumn
        })
      ) {
        this.$nextTick(() => {
          // document.getElementById('data-verification-form').childNodes[index - 1].querySelector('input').focus()
          let item = document.getElementById('item-source-' + (index - 1))
          item.querySelector('input').focus()
        })
        message = this.$t('packages_business_verification_lackIndex', { val: index })
        this.jointErrorMessage = message
        return message
      }
      // 判断表字段校验时，索引字段是否个数一致
      index = 0
      if (
        ['field', 'jointField'].includes(this.inspectMethod) &&
        tasks.some((c, i) => {
          index = i + 1
          return c.source.sortColumn.split(',').length !== c.target.sortColumn.split(',').length
        })
      ) {
        this.$nextTick(() => {
          let item = document.getElementById('item-source-' + (index - 1))
          item.querySelector('input').focus()
        })
        message = this.$t('packages_business_verification_message_error_joint_table_field_not_match', { val: index })
        this.jointErrorMessage = message
        return message
      }
      // 判断字段模型是否存在空
      index = 0
      if (
        ['field', 'jointField'].includes(this.inspectMethod) &&
        tasks.some((c, i) => {
          index = i + 1
          return c.source.columns?.some(t => !t) || c.target.columns?.some(t => !t)
        })
      ) {
        this.$nextTick(() => {
          let item = document.getElementById('list-table__content' + (index - 1))
          const emptyDom = item.querySelector('.el-select.empty-data')
          const offsetTop = emptyDom?.offsetTop || 0
          if (offsetTop) {
            const height = emptyDom?.offsetHeight || 0
            item.scrollTo({
              top: offsetTop - height
            })
          }
        })
        message = this.$t('packages_business_verification_form_diinde', { val1: index })
        this.jointErrorMessage = message
        return message
      }

      // 开启高级校验后，JS校验逻辑不能为空
      index = 0
      if (
        this.inspectMethod === 'field' &&
        tasks.some((c, i) => {
          index = i + 1
          return c.showAdvancedVerification && !c.webScript
        })
      ) {
        this.$nextTick(() => {
          formDom.childNodes[index - 1]?.querySelector('input')?.focus()
        })
        message = this.$t('packages_business_verification_message_error_script_no_enter')
        this.jointErrorMessage = message
        return message
      }
      this.jointErrorMessage = ''
      return
    },

    loadDoc() {
      if (this.$i18n.locale === 'en') {
        this.doc = `##### Advanced Verification Instructions
**The first step** The function input parameter is the source table data, you can call the **built-in function** according to the source table data to query the target data<br>
**Step 2** Custom verification logic<br>
**Step 3** The function returns the result<br>

- **result**: whether the verification is passed (passed: verification passed, failed: verification failed), if no or other characters are filled in, the verification fails, required <br>
- **message**: verification exception information, it is recommended to return if verification fails, optional<br>
- **data**: current verification target data, it is recommended to return if verification fails, optional<br>


Full Example: This is an example MongoDB query
\`\`\`\`javascript
function validate(sourceRow){
    // step 1
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // step 2
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // step 3
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed', message: "Inconsistent records", data: targetRow}
    }
}
\`\`\`\``
      } else if (this.$i18n.locale === 'zh-TW') {
        this.doc = `##### 高級校驗說明
**第一步** 函數入參為源表數據，可以根據源表數據調用**內置函數**查詢出目標數據<br>
**第二步** 自定義校驗邏輯<br>
**第三步** 函數返回結果<br>

- **result**：是否通過校驗（passed：校驗通過，failed：校驗失敗），如果不填或填其它字符則校驗失敗，必填項<br>
- **message**：校驗異常信息，建議校驗失敗返回，選填項<br>
- **data**：當前校驗目標數據，建議校驗失敗返回，選填項<br>


完整示例：此為MongoDB查詢示例
\`\`\`javascript
function validate(sourceRow){
    // 第1步
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // 第2步
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // 第3步
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed',message: "記錄不一致",data: targetRow}
    }
}
\`\`\``
      } else {
        this.doc = `##### 高级校验说明
**第一步** 函数入参为源表数据，可以根据源表数据调用**内置函数**查询出目标数据<br>
**第二步** 自定义校验逻辑<br>
**第三步** 函数返回结果<br>

- **result**：是否通过校验（passed：校验通过，failed：校验失败），如果不填或填其它字符则校验失败，必填项<br>
- **message**：校验异常信息，建议校验失败返回，选填项<br>
- **data**：当前校验目标数据，建议校验失败返回，选填项<br>


完整示例：此为MongoDB查询示例
\`\`\`javascript
function validate(sourceRow){
    // 第1步
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // 第2步
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // 第3步
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed',message: "记录不一致",data: targetRow}
    }
}
\`\`\`
`
      }
    },

    getModeTypeDisabled(item) {
      return !(item.source.connectionId && item.source.table && item.target.connectionId && item.target.table)
    },

    handleCustomFields(item, index) {
      this.$refs.fieldDialog.open(item, index, {
        source: this.dynamicSchemaMap[item.source.connectionId],
        target: this.dynamicSchemaMap[item.target.connectionId]
      })
    },

    handleChangeModeType(val, item, index) {
      if (val !== 'custom') {
        item.source.columns = null
        item.target.columns = null
        return
      }
      this.handleCustomFields(item, index)
    },

    handleChangeFields(data = [], index) {
      this.list[index].source.columns = data.map(t => t.source)
      this.list[index].target.columns = data.map(t => t.target)
    },

    handleFocus(opt = {}) {
      if (opt.fields?.length) {
        return
      }
      const connectionId = opt.connectionId?.split('/')?.[1]
      const params = {
        where: {
          meta_type: 'table',
          sourceType: 'SOURCE',
          original_name: opt.table,
          'source._id': connectionId
        },
        limit: 1
      }
      metadataInstancesApi
        .tapTables({
          filter: JSON.stringify(params)
        })
        .then((data = {}) => {
          opt.fields = Object.values(data.items[0]?.nameFieldMap || {}).map(t => {
            return {
              id: t.id,
              label: t.fieldName,
              value: t.fieldName,
              field_name: t.fieldName,
              primary_key_position: t.primaryKey
            }
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.joint-table {
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  &.error {
    border-color: map-get($color, danger);
  }
}
.joint-table-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  background: map-get($bgColor, normal);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.joint-table-footer {
  padding: 16px 24px;
}
.joint-table-main {
  max-height: 500px;
  overflow-y: auto;
  .joint-table-item {
    padding: 16px 24px;
    display: flex;
    border-bottom: 1px solid map-get($borderColor, light);
  }
  .joint-table-setting {
    flex: 1;
    background-color: map-get($bgColor, white);
  }
  .setting-item {
    display: flex;
    margin-bottom: 0;
    .el-form-item__content {
      display: flex;
      align-items: center;
      line-height: 1;
    }
    .item-label {
      width: 80px;
      line-height: 32px;
      text-align: left;
      color: map-get($fontColor, light);
    }
    .item-icon {
      margin: 0 10px;
      width: 80px;
      line-height: 32px;
      color: map-get($fontColor, light);
      text-align: center;
    }
    .item-time-picker,
    .item-input,
    .item-select,
    .item-filter {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-filter-body {
      padding: 16px;
      background: map-get($fontColor, normal);
      border-radius: 2px;
      color: map-get($fontColor, slight);
      .filter-example-label {
        margin-top: 8px;
        color: #bfd0ff;
        line-height: 17px;
      }
      .filter-example {
        margin-top: 8px;
        padding: 8px;
        line-height: 30px;
        background: #262838;
        color: #82b290;
      }
    }
    .item-value-text {
      flex: 1;
      line-height: 32px;
      padding: 0 16px;
    }
    .item-script {
      margin: 0;
      padding: 16px 24px;
      width: 100%;
      max-height: 130px;
      overflow: auto;
      border-radius: 5px;
      border-left: 5px solid map-get($color, primary);
      background: #eff1f4;
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      line-height: 17px;
    }
  }
}

.FieldList {
  height: 280px;
}

.empty-data {
  ::v-deep {
    .el-select {
      .el-input__inner {
        border-color: #d44d4d;
      }
    }
  }
}
</style>
