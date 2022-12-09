<template>
  <div class="joint-table" :class="{ error: !!jointErrorMessage }" @click="jointErrorMessage = ''">
    <!--    <div class="joint-table-header">-->
    <!--      <div>-->
    <!--        <span>{{ $t('packages_business_verification_verifyCondition') }}</span>-->
    <!--        <span class="color-danger ml-6">{{ jointErrorMessage }}</span>-->
    <!--      </div>-->
    <!--      <ElLink type="primary" :disabled="!list.length" @click="clear">{{-->
    <!--        $t('packages_business_verification_clear')-->
    <!--      }}</ElLink>-->
    <!--    </div>-->
    <ul class="joint-table-main" id="data-verification-form">
      <li class="joint-table-item" v-for="(item, index) in list" :key="item.id + index" @click="editItem(item)">
        <div class="joint-table-setting overflow-hidden">
          <div class="setting-item" :key="'connection' + item.id + index">
            <label class="item-label">待校验连接: </label>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.sourceConnectionId"
              :method="getConnectionsListMethod"
              filterable
              class="item-select"
              :key="'sourceConnectionId' + item.id + index"
              @change="handleChangeConnection(arguments[0], item, index, 'source')"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.sourceConnectionId }]">{{
              item.sourceConnectionId || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
            <span class="item-icon">
              <i class="el-icon-arrow-right"></i>
            </span>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.targetConnectionId"
              :method="getConnectionsListMethod"
              filterable
              class="item-select"
              :key="'targetConnectionId' + item.id + index"
              @change="handleChangeConnection(arguments[0], item, index, 'target')"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.targetConnectionId }]">{{
              item.targetConnectionId || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
          </div>
          <div class="setting-item mt-4" :key="'table' + item.id + index">
            <label class="item-label">来源表: </label>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.sourceTable"
              :method="getTableListMethod"
              :params="{
                connectionId: item.sourceConnectionId,
                nodeId: item.sourceNodeId
              }"
              itemType="string"
              filterable
              class="item-select"
              :key="'sourceTable' + item.id + index"
              @change="handleChangeTable(arguments[0], item, index, 'source')"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.sourceTable }]">{{
              item.sourceTable || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
            <span class="item-icon">
              <i class="el-icon-arrow-right"></i>
            </span>
            <AsyncSelect
              v-if="editId === item.id"
              v-model="item.targetTable"
              :method="getTableListMethod"
              :params="{
                connectionId: item.targetConnectionId,
                nodeId: item.targetNodeId
              }"
              itemType="string"
              filterable
              class="item-select"
              :key="'targetTable' + item.id + index"
            >
            </AsyncSelect>
            <span v-else :class="['item-value-text', { 'color-danger': !item.targetTable }]">{{
              item.targetTable || $t('packages_business_statistics_schedule_qingxuanze')
            }}</span>
          </div>
          <!--          <div class="setting-item align-items-center mt-4" v-show="form.inspectMethod !== 'row_count'">-->
          <!--            <label class="item-label">待校验模型: </label>-->
          <!--            <ElRadioGroup v-model="item.modeType">-->
          <!--              <ElRadio label="all">全字段</ElRadio>-->
          <!--              <ElRadio label="custom">自定义</ElRadio>-->
          <!--            </ElRadioGroup>-->
          <!--          </div>-->
          <!--          <div v-if="item.modeType === 'custom'" class="setting-item mt-4" v-show="form.inspectMethod !== 'row_count'">-->
          <!--            <label class="item-label"> </label>-->
          <!--            <div>模型内容</div>-->
          <!--          </div>-->
          <!--          <div class="setting-item mt-4" v-show="form.inspectMethod !== 'row_count'">-->
          <!--            <label class="item-label">{{ $t('packages_business_verification_indexField') }}: </label>-->
          <!--            <MultiSelection-->
          <!--              v-if="editId === item.id"-->
          <!--              v-model="item.source.sortColumn"-->
          <!--              class="item-select"-->
          <!--              :class="{ red: !item.source.sortColumn }"-->
          <!--              :options="item.source.fields"-->
          <!--              :id="'item-source-' + index"-->
          <!--            ></MultiSelection>-->
          <!--            <span v-else :class="['item-value-text', { 'color-danger': !item.source.sortColumn }]">{{-->
          <!--              item.source.sortColumn || $t('packages_business_statistics_schedule_qingxuanze')-->
          <!--            }}</span>-->
          <!--            <span class="item-icon"></span>-->
          <!--            <MultiSelection-->
          <!--              v-if="editId === item.id"-->
          <!--              v-model="item.target.sortColumn"-->
          <!--              class="item-select"-->
          <!--              :class="{ red: !item.target.sortColumn }"-->
          <!--              :options="item.target.fields"-->
          <!--            ></MultiSelection>-->
          <!--            <span v-else :class="['item-value-text', { 'color-danger': !item.target.sortColumn }]">{{-->
          <!--              item.target.sortColumn || $t('packages_business_statistics_schedule_qingxuanze')-->
          <!--            }}</span>-->
          <!--          </div>-->
          <!--          <div class="setting-item mt-4">-->
          <!--            <ElCheckbox-->
          <!--              v-if="editId === item.id"-->
          <!--              v-model="item.showAdvancedVerification"-->
          <!--              v-show="form.inspectMethod === 'field'"-->
          <!--              @input="handleChangeAdvanced(item)"-->
          <!--              >{{ $t('packages_business_verification_advanceVerify') }}</ElCheckbox-->
          <!--            >-->
          <!--          </div>-->
          <!--          <div class="setting-item mt-4" v-if="item.showAdvancedVerification && form.inspectMethod === 'field'">-->
          <!--            <label class="item-label">{{ $t('packages_business_verification_JSVerifyLogic') }}: </label>-->
          <!--            <ElButton v-if="!item.webScript || item.webScript === ''" @click="addScript(index)">{{-->
          <!--              $t('packages_business_verification_addJS')-->
          <!--            }}</ElButton>-->
          <!--            <template v-else>-->
          <!--              <ElLink type="primary" class="ml-4" @click="editScript(index)">{{ $t('button_edit') }}</ElLink>-->
          <!--              <ElLink type="primary" class="ml-4" @click="removeScript(index)">{{ $t('button_delete') }}</ElLink>-->
          <!--            </template>-->
          <!--          </div>-->
          <!--          <div-->
          <!--            class="setting-item mt-4"-->
          <!--            v-if="form.inspectMethod === 'field' && item.showAdvancedVerification && item.webScript"-->
          <!--          >-->
          <!--            <pre class="item-script">{{ item.webScript }}</pre>-->
          <!--          </div>-->
        </div>
        <!--        <div class="ml-6">-->
        <!--          <a class="el-link el-link&#45;&#45;primary is-underline" @click.stop="removeItem(index)">{{ $t('button_delete') }}</a>-->
        <!--        </div>-->
      </li>
    </ul>
    <div class="joint-table-footer">
      <ElButton size="mini" @click="addTable()">{{ $t('packages_business_verification_addTable') }}</ElButton>
      <ElButton type="primary" size="mini" @click="autoAddTable()">{{
        $t('packages_business_verification_button_auto_add_table')
      }}</ElButton>
    </div>
  </div>
</template>

<script>
import { AsyncSelect } from '@tap/form'
import { connectionsApi, taskApi } from '@tap/api'
import { merge } from 'lodash'
import { uuid, uniqueArr } from '@tap/shared'

const TABLE_PARAMS = {
  connectionId: '',
  table: '',
  databaseType: '',
  sortColumn: '',
  fields: []
}
const META_INSTANCE_FIELDS = {
  id: true,
  name: true,
  original_name: true,
  'source.id': true,
  'source.name': true,
  fields: true,
  'fields.id': true,
  'fields.field_name': true,
  'fields.primary_key_position': true,
  databaseId: true,
  meta_type: true
}

export default {
  name: 'FormArrayItem',

  components: { AsyncSelect },

  props: {
    taskId: String
  },

  data() {
    return {
      taskData: {},
      flowStages: [],
      list: [],
      editId: '',
      jointErrorMessage: ''
    }
  },

  watch: {
    taskId(v1, v2) {
      if (v1 !== v2) {
        this.clear()
      }
    }
  },

  methods: {
    async getConnectionsListMethod(filter) {
      if (this.taskId) {
        console.log('有taskId')
        return this.getConnectionsInTask()
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
            // databaseType: item.database_type,
            // connectionType: item.connection_type,
            // accessNodeProcessId: item.accessNodeProcessId
          }
        })

        return result
      } catch (e) {
        console.log('catch', e) // eslint-disable-line
        return { items: [], total: 0 }
      }
    },

    async getTableListMethod(filter) {
      console.log('getTableListMethod', filter)
      const { connectionId, nodeId } = filter
      if (!connectionId) {
        return { items: [], total: 0 }
      }
      if (this.taskId) {
        return this.getTablesInTask(nodeId, connectionId)
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
            // databaseType: item.database_type,
            // connectionType: item.connection_type,
            // accessNodeProcessId: item.accessNodeProcessId
          }
        })

        return result
      } catch (e) {
        console.log('catch', e) // eslint-disable-line
        return { items: [], total: 0 }
      }
    },

    async getConnectionsInTask() {
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
      const result = uniqueArr(
        this.flowStages.map(t => {
          return {
            value: t.connectionId,
            label: t.attrs?.connectionName
          }
        }),
        'value'
      )

      return { items: result, total: result.length }
    },

    async getTablesInTask(nodeId, connectionId) {
      console.log('getTablesInTask', this.flowStages, this.taskData, nodeId, connectionId)
      if (!this.flowStages?.length || !this.taskData?.id) {
        return { items: [], total: 0 }
      }
      const { isDB } = this
      let tableNames = []
      const filterNode = this.flowStages.filter(t => t.id === nodeId) || []
      console.log('filterNode', filterNode, isDB)
      filterNode.forEach(stg => {
        // 获取节点表名称，缩小接口请求数据的范围
        if (!isDB) {
          tableNames.push(stg.tableName)
        } else if (stg.syncObjects?.length) {
          // 当stage存在syncObjects字段说明是目标节点
          let obj = stg.syncObjects[0]
          let tables = obj.objectNames || []
          tables.forEach(t => {
            // 迁移时，可以同时从目标节点获取源和目标的表名，匹配目标表名时注意大小写和前后缀配置
            tableNames.push(t)
            // 拼上前后缀
            let name = (stg.tablePrefix || '') + t + (stg.tableSuffix || '')
            // 大小写转换
            if (stg.tableNameTransform) {
              name = name[stg.tableNameTransform]()
            }
            tableNames.push(name)
          })
        }
      })
      tableNames = uniqueArr(tableNames).filter(t => t)
      return { items: tableNames, total: tableNames.length }
    },

    editItem(item) {
      this.editId = item.id
    },

    clear() {
      this.list = []
    },

    getItemOptions() {
      return {
        id: uuid(),
        source: Object.assign({}, TABLE_PARAMS),
        target: Object.assign({}, TABLE_PARAMS),
        sourceTree: [],
        targetTree: [],
        showAdvancedVerification: false,
        script: '', //后台使用 需要拼接function头尾
        webScript: '', //前端使用 用于页面展示
        jsEngineName: 'graal.js',
        sourceNodeId: '',
        sourceConnectionId: '',
        sourceConnectionName: '',
        targetNodeId: '',
        targetConnectionId: '',
        targetConnectionName: '',
        modeType: 'all' // 待校验模型的类型
      }
    },

    addTable() {
      this.list.push(this.getItemOptions())
      // this.getTaskTree()
    },

    getList() {
      return this.list
    },

    handleChangeConnection(val, item, index, type) {
      console.log('handleChangeConnection', this.taskId, this.flowStages, val)
      // console.log('123213', val, item, index)
      const tableMap = {
        source: 'sourceTable',
        target: 'targetTable'
      }
      item[tableMap[type]] = '' // 重选连接，清空表
      if (!this.taskId) {
        return
      }
      // 自动填充目标表
      let findNode = this.flowStages.find(t => t.connectionId === val)
      const findNodeId = findNode?.id
      if (findNodeId) {
        const nodeMap = {
          source: 'sourceNodeId',
          target: 'targetNodeId'
        }
        item[nodeMap[type]] = findNodeId
      }
    },

    handleChangeTable(val, item, index, type) {
      console.log('handleChangeTable', val, item, index, type)
      if (!this.taskId || type !== 'source') return
      // 自动填充目标连接和表
      const { isDB } = this
      const sourceNode = this.flowStages.find(t => t.id === item.sourceNodeId)
      const targetNodeId = sourceNode?.outputLanes?.[0]
      const targetNode = this.flowStages.find(t => t.id === targetNodeId)
      if (!targetNode) return

      if (isDB) {
        const findSourceTableIndex = sourceNode.tableNames.findIndex(t => t === val)
        const objectNames = targetNode.syncObjects?.[0]?.objectNames || []
        item.targetTable = objectNames[findSourceTableIndex]
        item.targetConnectionId = targetNode.connectionId
      } else {
        item.targetTable = targetNode.tableName
        item.targetConnectionId = targetNode.connectionId
      }
      // const targetNode = this.flowStages.find(t => t.id === item.)
      // if (!targetNode) return
      // const targetNodeId = findNode?.outputLanes?.[0]
      // if (!targetNodeId) {
      //   return
      // }
      // this.setTargetConnectionAndTable(targetNodeId, item, index)
    },

    setTargetConnectionAndTable(targetNodeId, item, index) {
      const targetNode = this.flowStages.find(t => t.id === targetNodeId)
      if (!targetNode) return
      item.targetConnectionId = targetNode.connectionId
      // item.targetConnectionName = targetNode.name
      item.targetTable = targetNode.TableName
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
      width: 20px;
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
</style>
