<template>
  <div class="joint-table" :class="{ error: !!jointErrorMessage }" @click="jointErrorMessage = ''">
    <div class="joint-table-header">
      <div>
        <span>{{ $t('packages_business_verification_verifyCondition') }}</span>
        <span v-if="!list.length" class="ml-4 color-danger">请添加校验条件</span>
        <span class="color-danger ml-6">{{ jointErrorMessage }}</span>
      </div>
      <ElLink type="primary" :disabled="!list.length" @click="handleClear">{{
        $t('packages_business_verification_clear')
      }}</ElLink>
    </div>
    <ul class="joint-table-main" id="data-verification-form">
      <li class="joint-table-item" v-for="(item, index) in list" :key="item.id + index" @click="editItem(item)">
        <div class="joint-table-setting overflow-hidden">
          <div class="flex justify-content-between">
            <div class="flex align-items-center">
              <span class="font-color-normal fs-7">检验条件</span>
              <span class="ml-1">{{ index + 1 }}</span>
              <VIcon size="16" :class="['arrow-icon', { active: editId === item.id }]">arrow-right</VIcon>
            </div>
            <ElButton type="text" @click.stop="removeItem(index)">{{ $t('button_delete') }}</ElButton>
          </div>
          <div class="setting-item mt-4" :key="'connection' + item.id">
            <label class="item-label">待校验连接: </label>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.source.connectionId"
              :method="getConnectionsListMethod"
              :currentLabel="item.source.connectionName"
              itemQuery="name"
              filterable
              class="item-select"
              :key="'sourceConnectionId' + item.id"
              :onSetSelected="useHandle(handleSetSelectedConnection, item.source)"
              @change="handleChangeConnection(arguments[0], item.source)"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.source.connectionId }]">{{
              item.source.connectionName || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
            <span class="item-icon">
              <i class="el-icon-arrow-right"></i>
            </span>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.target.connectionId"
              :method="getConnectionsListMethod"
              :currentLabel="item.target.connectionName"
              itemQuery="name"
              filterable
              class="item-select"
              :key="'targetConnectionId' + item.id"
              :onSetSelected="useHandle(handleSetSelectedConnection, item.target)"
              @change="handleChangeConnection(arguments[0], item.target)"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.target.connectionId }]">{{
              item.target.connectionName || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
          </div>
          <div class="setting-item mt-4" :key="'table' + item.id">
            <label class="item-label">来源表: </label>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.source.table"
              :method="getTableListMethod"
              :params="{
                connectionId: item.source.connectionId,
                nodeId: item.source.nodeId
              }"
              itemQuery="name"
              itemType="string"
              filterable
              class="item-select"
              :key="'sourceTable' + item.id"
              @change="handleChangeTable(arguments[0], item, index, 'source')"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.source.table }]">{{
              item.source.table || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
            <span class="item-icon fs-8"> 目标表:</span>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.target.table"
              :method="getTableListMethod"
              :params="{
                connectionId: item.target.connectionId,
                nodeId: item.target.nodeId
              }"
              itemQuery="name"
              itemType="string"
              filterable
              class="item-select"
              :key="'targetTable' + item.id"
              @change="handleChangeTable(arguments[0], item, index, 'target')"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.target.table }]">{{
              item.target.table || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
          </div>
          <FieldBox
            v-if="inspectMethod !== 'row_count' && editId === item.id"
            :is-edit="editId === item.id"
            :item="item"
            :index="index"
          ></FieldBox>
          <div class="setting-item mt-4">
            <ElCheckbox
              v-if="editId === item.id"
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
              <ElLink type="primary" class="ml-4" @click="editScript(index)">{{ $t('button_edit') }}</ElLink>
              <ElLink type="primary" class="ml-4" @click="removeScript(index)">{{ $t('button_delete') }}</ElLink>
            </template>
          </div>
          <div
            class="setting-item mt-4"
            v-if="inspectMethod === 'field' && item.showAdvancedVerification && item.webScript"
          >
            <pre class="item-script">{{ item.webScript }}</pre>
          </div>
        </div>
      </li>
    </ul>
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
  </div>
</template>

<script>
import { AsyncSelect } from '@tap/form'
import { connectionsApi, metadataInstancesApi, taskApi } from '@tap/api'
import { merge, cloneDeep } from 'lodash'
import { uuid, uniqueArr } from '@tap/shared'

import FieldBox from './FieldBox'

import { TABLE_PARAMS, META_INSTANCE_FIELDS, DATA_NODE_TYPES } from './const'

export default {
  name: 'ConditionBox',

  components: { AsyncSelect, FieldBox },

  props: {
    taskId: String,
    inspectMethod: String,
    data: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      taskData: {},
      flowStages: [],
      list: [],
      editId: '',
      jointErrorMessage: '',
      fieldsMap: {},
      autoAddTableLoading: false
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

  methods: {
    async getConnectionsListMethod(filter) {
      if (this.taskId) {
        return this.getConnectionsInTask(filter)
      }
      try {
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
            value: item.id
          }
        })

        return result
      } catch (e) {
        return { items: [], total: 0 }
      }
    },

    async getTableListMethod(filter) {
      const { connectionId, nodeId } = filter
      if (!connectionId) {
        return { items: [], total: 0 }
      }
      if (this.taskId) {
        return this.getTablesInTask(nodeId, connectionId, filter)
      }
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
        const res = await metadataInstancesApi.tapTables({
          filter: JSON.stringify({
            where: {
              meta_type: 'table',
              sourceType: 'SOURCE',
              'source._id': connectionId
            },
            limit: 50
          })
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
      if (this.taskData?.id !== this.taskId) {
        this.taskData = await taskApi.getId(this.taskId)
        this.isDB = this.taskData.syncType === 'migrate'
      }
      const { taskData, isDB } = this
      let types = isDB ? ['database'] : ['table']
      let edges = taskData.dag?.edges || []
      let nodes = taskData.dag?.nodes || []
      if (!edges.length) {
        this.$message.error('所选任务缺少节点连线信息')
        return { items: [], total: 0 }
      }
      let stages = []
      nodes.forEach(n => {
        let outputLanes = []
        let inputLanes = []
        edges.forEach(e => {
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
            inputLanes
          })
        )
      })
      this.flowStages = stages.filter(stg => types.includes(stg.type))
      const keyword = filter.where?.name?.like
      let arr
      if (keyword) {
        arr = this.flowStages.filter(t => t.attrs?.connectionName.includes(filter.where?.name?.like))
      } else {
        arr = this.flowStages
      }
      const result = uniqueArr(
        arr.map(t => {
          const nodeId = t.id
          const nodeName = t.name
          const connectionId = t.connectionId
          const connectionName = t.attrs?.connectionName
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
      if (!this.flowStages?.length || !this.taskData?.id) {
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
        pageSize: filter?.size || 50
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
      if (isDB) {
        // 存在多表的情况，这里需要做分页
        let tableNames = []
        if (findNode.outputLanes.length) {
          tableNames = tableList
        } else {
          const { tablePrefix, tableSuffix, tableNameTransform } = findNode
          tableNames = tableList.map(t => {
            let name = (tablePrefix || '') + t + (tableSuffix || '')
            return tableNameTransform ? name[tableNameTransform]() : name
          })
        }
        return { items: tableNames, total: total }
      }
      return { items: tableList, total: tableList.length }
    },

    getAllTablesInNode(nodeId) {
      const findNode = this.flowStages.find(t => t.id === nodeId)
      if (!findNode) return []
      if (this.isDB) {
        let tableList = findNode.tableNames || []
        if (findNode.inputLanes.length) {
          const objectNames = findNode.syncObjects?.[0]?.objectNames
          const { tablePrefix, tableSuffix, tableNameTransform } = findNode
          tableList = objectNames.map(t => {
            let name = (tablePrefix || '') + t + (tableSuffix || '')
            return tableNameTransform ? name[tableNameTransform]() : name
          })
        }
        return tableList
      }
      return [findNode.tableName]
    },

    getMatchNodeList() {
      let result = []
      this.flowStages
        .filter(t => t.outputLanes.length > 0)
        .forEach(el => {
          const targetNode = this.flowStages.find(t => t.id === el.outputLanes[0])
          if (targetNode) {
            result.push({
              source: el.id,
              sourceName: el.name,
              target: targetNode.id,
              targetName: targetNode.name,
              sourceConnectionId: el.connectionId,
              sourceConnectionName: el.attrs?.connectionName,
              targetConnectionId: targetNode.connectionId,
              targetConnectionName: targetNode.attrs?.connectionName
            })
          }
        })
      return result
    },

    editItem(item) {
      if (this.editId === item.id) {
        this.editId = ''
        return
      }
      this.editId = item.id
    },

    handleClear() {
      this.$confirm('清空', '是否清空所有条件', {
        type: 'warning'
      }).then(res => {
        if (!res) {
          return
        }
        this.clearList()
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
      this.list.push(this.getItemOptions())
    },

    async autoAddTable() {
      if (!this.taskId || this.list.length) return
      this.autoAddTableLoading = true
      let connectionIds = []
      let tableNames = []
      const matchNodeList = this.getMatchNodeList()
      matchNodeList.forEach(m => {
        connectionIds.push(m.sourceConnectionId)
        connectionIds.push(m.targetConnectionId)
        tableNames.push(...this.getAllTablesInNode(m.source))
        tableNames.push(...this.getAllTablesInNode(m.target))
      })
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
              targetConnectionName
            } = m
            const getAllTablesInNodeSource = this.getAllTablesInNode(source)
            const getAllTablesInNodeTarget = this.getAllTablesInNode(target)
            getAllTablesInNodeSource.forEach((ge, geIndex) => {
              let findTable = data.find(t => t.source.id === sourceConnectionId && t.original_name === ge)
              let findTargetTable = data.find(
                t => t.source.id === targetConnectionId && t.original_name === getAllTablesInNodeTarget[geIndex]
              )
              let item = this.getItemOptions()
              item.source.nodeId = source
              item.source.connectionId = `${source}/${sourceConnectionId}`
              item.source.connectionName = `${sourceName} / ${sourceConnectionName}`
              item.source.table = findTable.original_name
              item.source.fields = findTable.fields
              item.source.sortColumn = this.getPrimaryKeyFieldStr(findTable.fields)

              item.target.nodeId = target
              item.target.connectionId = `${target}/${targetConnectionId}`
              item.target.connectionName = `${targetName} / ${targetConnectionName}`
              item.target.table = findTargetTable.original_name
              item.target.fields = findTargetTable.fields
              item.target.sortColumn = this.getPrimaryKeyFieldStr(findTargetTable.fields)
              list.push(item)
            })
          })
          if (!list.length) {
            return this.$message.error('所选任务缺少节点连线信息')
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
    },

    handleChangeTable(val, item, index, type) {
      const fields = this.getFieldsByItem(item, type)
      item[type].fields = fields
      item[type].sortColumn = this.getPrimaryKeyFieldStr(fields)
      // 绑定任务，则自动填充目标信息
      if (!this.taskId) {
        return
      }
      if (type === 'target') {
        return
      }
      // 自动填充目标连接和表
      const { isDB } = this
      const sourceNode = this.flowStages.find(t => t.id === item.source.nodeId)
      const targetNodeId = sourceNode?.outputLanes?.[0]
      const targetNode = this.flowStages.find(t => t.id === targetNodeId)
      if (!targetNode) return

      const nodeId = targetNode.id
      const nodeName = targetNode.name
      const connectionId = targetNode.connectionId
      const connectionName = targetNode.attrs?.connectionName
      item.target.nodeId = nodeId
      item.target.nodeName = nodeName
      item.target.connectionId = `${nodeId}/${connectionId}`
      item.target.connectionName = `${nodeName} / ${connectionName}`
      if (isDB) {
        const findSourceTableIndex = sourceNode.tableNames.findIndex(t => t === val)
        const objectNames = targetNode.syncObjects?.[0]?.objectNames || []
        item.target.table = objectNames[findSourceTableIndex]
      } else {
        item.target.table = targetNode.tableName
      }

      // 加载目标的字段
      const targetTableName = item.target.table
      const params = {
        nodeId,
        tableFilter: targetTableName,
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
        item.target.sortColumn = this.getPrimaryKeyFieldStr(item.target.fields)

        const key = [nodeId || '', connectionId, targetTableName].join()
        this.fieldsMap[key] = item.target.fields
      })
    },

    handleChangeAdvanced(item) {
      item.target.targeFilterFalg = false
      item.target.where = ''
    },

    addScript(index) {
      this.$emit('addScript')
      // this.formIndex = index
      // this.webScript = ''
      // this.jsEngineName = 'graal.js'
      // this.dialogAddScriptVisible = true
    },

    editScript(index) {
      this.formIndex = index
      let script = JSON.parse(JSON.stringify(this.form.tasks[this.formIndex].webScript))
      this.jsEngineName = JSON.parse(JSON.stringify(this.form.tasks[this.formIndex].jsEngineName || 'nashorn'))
      this.webScript = script
      this.dialogAddScriptVisible = true
    },

    removeScript(index) {
      this.$confirm(
        this.$t('packages_business_verification_message_confirm_delete_script'),
        this.$t('packages_business_button_delete'),
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

    getFieldsByItem(item, type) {
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
        .filter(f => f.primary_key_position > 0)
        .map(t => t.field_name)
        .join(',')
    },

    useHandle(handle, item) {
      return (...args) => {
        handle(item, ...args)
      }
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
}
.joint-table-footer {
  padding: 16px 24px;
}
.joint-table-main {
  .joint-table-item {
    padding: 16px 24px;
    display: flex;
    border-bottom: 1px solid map-get($borderColor, light);
    cursor: pointer;
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
    }
    .item-icon {
      margin: 0 10px;
      width: 80px;
      line-height: 32px;
      color: map-get($fontColor, light);
      font-size: 16px;
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

.arrow-icon {
  transition: 0.2s;
  color: #4e5969;
  &.active {
    transform: rotate(90deg);
  }
}
</style>
