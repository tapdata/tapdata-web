<template>
  <div
    class="materialized-view-node position-absolute rounded-lg bg-white"
    :class="{
      '--main-table': isMainTable
    }"
    :style="nodeStyle"
    @click="mouseClick"
  >
    <div class="node-header overflow-hidden">
      <div class="node-title text-white lh-base flex align-center p-2">
        <VIcon class="mr-1">drag</VIcon><span class="ellipsis">{{ dagNode.tableName }}</span>
      </div>
      <div class="flex gap-2 p-2">
        <AsyncSelect
          v-model="dagNode.connectionId"
          placeholder="请选择存储数据库"
          :method="loadDatabases"
          itemValue="id"
          itemQuery="name"
          :onSetSelected="onConnectionSelect"
        >
          <template #prefix>
            <div class="flex align-center h-100">
              <NodeIcon :node="dagNode" :size="20" />
            </div>
          </template>
        </AsyncSelect>
        <TableSelect
          v-model="dagNode.tableName"
          placeholder="请选择存储表"
          :disabled="!dagNode.connectionId"
          :method="loadTable"
          :connectionId="dagNode.connectionId"
          itemType="object"
          itemQuery="value"
          @change="onChangeTable"
        ></TableSelect>
      </div>
      <ElForm class="node-form px-2" label-position="top">
        <template v-if="!isMainTable">
          <ElFormItem label="关联表">
            <ElSelect :value="node.parentId" class="w-100" @change="$emit('change-parent', node, $event)">
              <ElOption v-for="option in newTableOptions" :key="option.value" v-bind="option"></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <div slot="label" class="flex align-center justify-content-between">
              <span>{{ $t('packages_dag_nodes_mergetable_guanliantiaojian') }}</span>
              <ElLink class="fs-8" type="primary" size="mini" @click="handleAddJoinKey">
                <VIcon>add</VIcon>
                {{ $t('public_button_add') }}</ElLink
              >
            </div>
            <ElButton v-if="!node.joinKeys.length" type="ghost" class="w-100 fs-8" @click="handleAddJoinKey">
              <VIcon>add</VIcon>
              {{ $t('public_button_add') }}
            </ElButton>
            <div v-else class="flex flex-column gap-2">
              <div class="flex align-center gap-2" v-for="(keys, i) in node.joinKeys" :key="i">
                <FieldSelect
                  v-model="keys.source"
                  itemLabel="field_name"
                  itemValue="field_name"
                  :options="schema"
                ></FieldSelect>
                <span>=</span>
                <FieldSelect
                  v-model="keys.target"
                  :options="targetFields"
                  @visible-change="handleFieldSelectVisible"
                ></FieldSelect>
                <IconButton @click="node.joinKeys.splice(i, 1)">delete</IconButton>
              </div>
            </div>
          </ElFormItem>
        </template>

        <ElFormItem :label="$t('packages_dag_nodes_mergetable_guanlianhouxieru')">
          <ElInput v-model="targetPath" @change="$emit('change-path', node, $event)"></ElInput>
        </ElFormItem>

        <ElFormItem v-if="!isMainTable" :label="$t('packages_dag_nodes_mergetable_neiqianshuzupi')">
          <ElInput></ElInput>
        </ElFormItem>
      </ElForm>
    </div>
    <ElDivider class="my-0" />
    <div class="p-2 node-body">
      <div class="flex align-center">
        <ElPopover placement="top" width="240" v-model="fieldNameVisible" trigger="manual">
          <div ref="fieldPopover">
            <ElInput v-model="fieldName" placeholder="输入字段名"></ElInput>
            <div class="mt-2 text-end">
              <el-button size="mini" type="text" @click="fieldNameVisible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="onSaveFieldName">确定</el-button>
            </div>
          </div>
          <template #reference>
            <ElDropdown trigger="click" @command="handleCommand">
              <IconButton
                v-click-outside="{
                  handler: onClickOutside,
                  include
                }"
                sm
              >
                plus-circle
              </IconButton>
              <ElDropdownMenu ref="dropDownMenu" slot="dropdown">
                <!--Flatten-->
                <ElDropdownItem command="Flatten">平铺</ElDropdownItem>
                <!--Embedded Document-->
                <ElDropdownItem command="Document">内嵌文档</ElDropdownItem>
                <!--Embedded Array-->
                <ElDropdownItem command="Array">内嵌数组</ElDropdownItem>
              </ElDropdownMenu>
            </ElDropdown>
          </template>
        </ElPopover>

        <code class="color-success-light-5">{</code>
      </div>
      <ElTree
        class="fs-8 node-schema-tree overflow-y-auto"
        :indent="8"
        :data="treeData"
        :render-content="renderContent"
      ></ElTree>
      <code class="color-success-light-5">}</code>
    </div>
  </div>
</template>

<script>
import { merge } from 'lodash'
import { mapGetters, mapMutations } from 'vuex'
import { ClickOutside } from '@tap/shared'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { Time } from '@tap/shared'
import { AsyncSelect, FieldSelect } from '@tap/form'
import { IconButton } from '@tap/component'
import { TableSelect } from '../form'
import { sourceEndpoint, targetEndpoint } from '../../style'
import NodeIcon from '../NodeIcon.vue'
export default {
  name: 'Node',

  props: {
    position: Array,
    schema: Array,
    parentSchema: Array,
    node: {
      type: Object,
      default: () => ({})
    },
    data: Object,
    nodeId: {
      type: String,
      required: true
    },
    jsPlumbIns: Object,
    getInputs: Function,
    getOutputs: Function,
    isMainTable: Boolean,
    tableOptions: Array,
    targetPathMap: Object,
    nodeSchemaMap: Object
  },

  components: {
    NodeIcon,
    AsyncSelect,
    TableSelect,
    FieldSelect,
    IconButton
  },

  directives: { ClickOutside },

  data() {
    return {
      loading: false,
      params: {
        where: { database_type: 'MongoDB' }
      },
      targetFields: [],
      targetPath: this.node.targetPath,
      fieldNameVisible: false,
      fieldName: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', [
      'nodeById',
      'isActionActive',
      'isNodeActive',
      'isNodeSelected',
      'isMultiSelect',
      'processorNodeTypes',
      'hasNodeError',
      'stateIsReadonly',
      'activeType'
    ]),

    ins() {
      return this.node?.__Ctor || {}
    },

    nodeClass() {
      const list = []
      this.ins && list.push(`node--${this.ins.group}`)
      return list
    },

    nodeStyle() {
      const [left = 0, top = 0] = this.position || []
      return {
        left: left + 'px',
        top: top + 'px'
      }
    },

    treeData() {
      // console.log('computed:treeData')
      if (!this.schema) return []

      const treeData = this.createTree(this.schema)
      const { targetPath } = this.node

      // 根据写入路径组装treeData
      if (targetPath) {
        const arr = this.node.targetPath.split('.')
        const prefix = targetPath + '.'
        const pathArr = Object.keys(this.targetPathMap).filter(path => path !== targetPath && path.startsWith(prefix))

        if (pathArr.length > 1) {
          console.warn('多层路径暂不支持解析')
        }

        for (const path of pathArr) {
          const node = this.targetPathMap[path]
          const newPath = path.substring(prefix.length)
          const pathKeys = newPath.split('.')

          treeData.unshift({
            field_name: pathKeys[0],
            dataType: 'DOCUMENT',
            children: this.nodeSchemaMap[node.id]
          })
        }
      }

      return treeData
    },

    sourceNodes() {
      return this.findParentNodes(this.node.id, true)
    },

    dagNode() {
      return this.node.tableNode
    },

    newTableOptions() {
      return this.tableOptions.filter(({ value }) => this.node.id !== value)
    },

    parentFieldOptions() {
      return this.parentSchema
    }
  },

  mounted() {
    // this.node.id && this.loadSchema()
    if (this.node && this.ins) {
      this.__init()
    }
  },

  methods: {
    ...mapMutations('dataflow', [
      'setActiveNode',
      'addActiveAction',
      'removeActiveAction',
      'updateNodeProperties',
      'resetSelectedNodes',
      'setNodeError',
      'clearNodeError'
    ]),

    findParentNodes(id, ifMyself) {
      let node = this.nodeById(id)
      const parents = []
      let parentIds = node.$inputs || []

      if (ifMyself && !parentIds.length) return [node]

      parentIds.forEach(pid => {
        let parent = this.nodeById(pid)
        if (parent) {
          if (parent.$inputs?.length) {
            parent.$inputs.forEach(ppid => {
              parents.push(...this.findParentNodes(ppid, true))
            })
          } else {
            parents.push(parent)
          }
        }
      })

      return parents
    },

    __init() {
      // const { id, nodeId } = this
      const { id } = this.node
      const nodeId = id

      const targetParams = {
        ...targetEndpoint
      }

      // this.jsPlumbIns.makeSource(id, { filter: '.sourcePoint', ...sourceEndpoint })

      this.jsPlumbIns.makeTarget(id, targetParams)

      this.jsPlumbIns.draggable(this.$el, {
        handle: '.node-title, .node-title *',
        // containment: 'parent',
        start: params => {
          this.onMouseDownAt = Time.now()
          // console.log('node-drag-start', params.pos)
          if (params.e && !this.isNodeSelected(this.nodeId)) {
            // 只有直接拖动的节点params才会有事件
            // 检查当前拖动的节点是否被选中，如果未选中则clearDragSelection
            this.jsPlumbIns.clearDragSelection()
            this.resetSelectedNodes()
          }

          this.addActiveAction('dragActive')

          this.$emit('drag-start', params)
          return true
        },
        drag: params => {
          // console.log('node-drag-move', params.pos)
          params.id = nodeId // 增加id参数
          this.isDrag = true // 拖动标记
          this.$emit('drag-move', params)
        },
        stop: () => {
          // console.log('node-drag-stop', params)
          // 更新节点坐标
          this.isNotMove = false
          const { position } = this.node.attrs
          const newProperties = []
          const oldProperties = []

          if (this.isActionActive('dragActive')) {
            this.position.splice(0, 2, parseFloat(this.$el.style.left), parseFloat(this.$el.style.top))
          }

          this.onMouseDownAt = undefined
          this.$emit('drag-stop', this.isNotMove, oldProperties, newProperties)
        }
      })

      this.targetPoint = this.jsPlumbIns.addEndpoint(this.$el, targetParams, {
        uuid: id + '_target'
      })

      this.jsPlumbIns.addEndpoint(
        this.$el,
        {
          ...sourceEndpoint,
          enabled: false,
          connectorStyle: {
            strokeWidth: 1,
            stroke: '#9f9f9f',
            outlineStroke: 'transparent',
            outlineWidth: 20
          }
        },
        {
          uuid: id + '_source'
        }
      )
    },

    mouseClick(e) {
      if (this.isActionActive('dragActive')) {
        this.removeActiveAction('dragActive')
      } else {
        if (!this.ins) return
        /*if (this.isCtrlKeyPressed(e) === false) {
          // 如果不是多选模式则取消所有节点选中
          this.$emit('deselectAllNodes')
        }*/

        if (this.isNodeSelected(this.nodeId)) {
          this.$emit('deselectNode', this.nodeId)
        } else {
          // 选中节点并且active
          this.$emit('nodeSelected', this.nodeId, true)
        }
      }
    },

    async loadDatabases(filter) {
      try {
        const { isSource, isTarget } = filter
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
            // id: item.id,
            // name: item.name,
            label: `${item.name} ${item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''}`,
            value: item.id,
            databaseType: item.database_type,
            connectionType: item.connection_type,
            ...item
            // accessNodeProcessId: item.accessNodeProcessId
          }
        })

        return result
      } catch (e) {
        console.log('catch', e) // eslint-disable-line
        return { items: [], total: 0 }
      }
    },

    async loadTable(filter, config) {
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
      if (filter.where?.value) {
        filter.where.original_name = filter.where?.value
        delete filter.where.value
      } else {
        filter.where.original_name = {
          // regexp: '^[^\\s]+$'
          neq: ''
        }
      }
      const data = await metadataInstancesApi.get({ filter: JSON.stringify(filter) }, config)
      data.items = data.items.map(item => {
        return {
          label: item.original_name + (item.comment ? `(${item.comment})` : ''),
          value: item.original_name
        }
      })
      const table = filter.where.original_name?.like
      if (table && !data.items.some(t => t.value.includes(table))) {
        const res = await metadataInstancesApi.checkTableExist({
          connectionId: filter.where['source.id'],
          tableName: table
        })
        if (res?.exist) {
          data.items.unshift({
            label: table,
            value: table
          })
        }
      }
      return data
    },

    createTree(data) {
      const root = { children: [] }

      for (const item of data) {
        if (item.is_deleted) continue

        const { field_name } = item
        let parent = root
        const fields = field_name.split('.')

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          let child = parent.children.find(c => c.field_name === field)

          if (!child) {
            child = { field_name: field, children: [] }
            parent.children.push(child)
          }

          parent = child

          if (i === fields.length - 1) {
            Object.assign(parent, item, {
              field_name: field
            })
          }
        }
      }

      return root.children
    },

    async loadSchema() {
      this.loading = true
      const params = {
        nodeId: this.node.id,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: 1,
        pageSize: 20
      }
      const {
        items: [schema = {}]
      } = await metadataInstancesApi.nodeSchemaPage(params)
      const { fields = [], indices = [] } = schema

      let columnsMap = indices.reduce((map, item) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = true))
        return map
      }, {})

      this.treeData = this.createTree(
        fields.sort((a, b) => a.columnPosition - b.columnPosition),
        columnsMap
      )
      this.loading = false
    },

    renderContent(h, { node, data, store }) {
      let icon

      if (data.primary_key_position > 0) {
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            key
          </VIcon>
        )
      } else if (data.indicesUnique) {
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            fingerprint
          </VIcon>
        )
      }

      return (
        <div class="flex flex-1 min-w-0 justify-content-between align-center gap-2 pr-2 position-relative">
          {icon}
          <span class="ellipsis">{data.field_name}</span>
          <span class="ml-1 font-color-sslight">{data.dataType}</span>
        </div>
      )
    },

    handleAddJoinKey() {
      this.node.joinKeys.push({
        source: '',
        target: ''
      })
    },

    handleFieldSelectVisible(visible) {
      visible && this.loadTargetField()
    },

    async loadTargetField() {
      const fields = await metadataInstancesApi.getMergerNodeParentFields(this.$route.params.id, this.node.id)

      this.targetFields = fields.map(item => ({
        label: item.field_name,
        value: item.field_name,
        isPrimaryKey: item.primary_key_position > 0
      }))
    },

    handleCommand(command) {
      this.currentCommand = command
      switch (command) {
        case 'Flatten':
          break
        case 'Document':
        case 'Array':
          this.fieldName = ''
          this.fieldNameVisible = true
          break
      }
    },

    handleAddTableNode() {
      const props = {
        name: '',
        type: 'table',
        databaseType: '',
        connectionId: '',
        tableName: '',
        attrs: {
          hasCreated: false
        }
      }

      this.$emit('add-node', {
        mergeType: this.currentCommand === 'Array' ? 'updateIntoArray' : 'updateWrite',
        targetPath: `${this.node.targetPath ? this.node.targetPath + '.' : ''}${this.fieldName}`
      })
    },

    include() {
      return [this.$refs.dropDownMenu.$el, this.$refs.fieldPopover]
    },

    onClickOutside() {
      this.fieldNameVisible = false
    },

    onSaveFieldName() {
      this.fieldNameVisible = false
      this.handleAddTableNode()
    },

    onConnectionSelect(connection) {
      Object.assign(this.dagNode.attrs, {
        connectionName: connection.name,
        connectionType: connection.connection_type,
        accessNodeProcessId: connection.accessNodeProcessId,
        pdkType: connection.pdkType,
        pdkHash: connection.pdkHash,
        capabilities: connection.capabilities || []
      })
    },

    onChangeTable(table) {
      this.dagNode.name = table
    }
  }
}
</script>

<style scoped lang="scss">
@import 'style';
</style>
