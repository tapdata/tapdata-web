<template>
  <div
    tabindex="1"
    class="materialized-view-node position-absolute rounded-lg bg-white"
    :class="{
      '--main-table': isMainTable
    }"
    :style="nodeStyle"
  >
    <div class="node-header overflow-hidden">
      <div class="node-title text-white lh-base flex align-center p-1">
        <VIcon class="mr-1">drag</VIcon><span class="ellipsis">{{ dagNode.name }} </span>
        <span v-if="tableComment" class="ml-1 flex-shrink-0 ellipsis" style="color: rgba(255, 255, 255, 0.8)"
          >({{ tableComment }})</span
        >
        <ElButton
          v-if="!hasTargetNode && isMainTable && dagNode.connectionId && dagNode.tableName"
          class="ml-auto"
          size="mini"
          @click="$emit('add-target-node')"
        >
          <VIcon>add</VIcon>
          写入目标</ElButton
        >
      </div>
      <div class="flex gap-1 p-1">
        <AsyncSelect
          v-model="dagNode.connectionId"
          placeholder="请选择数据库"
          :method="loadDatabases"
          :params="{ isSource: true }"
          itemValue="id"
          itemQuery="name"
          lazy
          :currentLabel="dagNode.attrs.connectionName"
          :onSetSelected="onConnectionSelect"
          @change="onChangeConnection"
        >
          <template #prefix>
            <div class="flex align-center h-100">
              <NodeIcon :node="dagNode" :size="20" />
            </div>
          </template>
        </AsyncSelect>
        <TableSelect
          class="table-select"
          v-model="dagNode.tableName"
          placeholder="请选择表"
          :disabled="!dagNode.connectionId"
          collapse-tags
          :method="loadTable"
          :connectionId="dagNode.connectionId"
          itemType="object"
          itemQuery="value"
          lazy
          :onSetSelected="onTableSelect"
          @change="onChangeTable"
        ></TableSelect>
      </div>
      <ElForm class="node-form px-1" label-position="top" @submit.prevent>
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
            <ElButton
              v-if="!node.joinKeys || !node.joinKeys.length"
              type="ghost"
              class="w-100 fs-8"
              @click="handleAddJoinKey"
            >
              <VIcon>add</VIcon>
              {{ $t('public_button_add') }}
            </ElButton>
            <div v-else class="flex flex-column gap-2">
              <div class="flex align-center gap-1" v-for="(keys, i) in node.joinKeys" :key="i">
                <!--<div class="flex flex-column">-->
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
                <!--</div>-->
                <IconButton @click="node.joinKeys.splice(i, 1)">delete</IconButton>
              </div>
            </div>
          </ElFormItem>
        </template>

        <template v-if="node.parentId || hasTargetNode">
          <ElFormItem label="字段类型">
            <ElSelect v-model="fieldType" class="w-100" @change="onChangeType">
              <ElOption v-for="(option, i) in fieldTypeOptions" :key="i" v-bind="option"></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem :label="$t('packages_dag_nodes_mergetable_guanlianhouxieru')">
            <ElInput v-model="targetPath" @change="$emit('change-path', node, $event)"></ElInput>
          </ElFormItem>
        </template>

        <ElFormItem
          v-if="!isMainTable && node.mergeType === 'updateIntoArray'"
          :label="$t('packages_dag_nodes_mergetable_neiqianshuzupi')"
        >
          <FieldSelect
            class="w-100"
            v-model="node.arrayKeys"
            itemLabel="field_name"
            itemValue="field_name"
            :options="schema"
            multiple
          ></FieldSelect>
        </ElFormItem>
      </ElForm>
    </div>
    <ElDivider class="my-0" />
    <div class="p-2 node-body" v-loading="schemaLoading">
      <div class="flex align-center">
        <code class="color-success-light-5 mr-2">{</code>
        <ElPopover v-if="displaySchema" placement="top" width="240" v-model="fieldNameVisible" trigger="manual">
          <div ref="fieldPopover">
            <ElInput
              v-model="fieldName"
              autofocus
              placeholder="输入字段名"
              @keydown.native.enter="onSaveFieldName"
            ></ElInput>
            <div class="mt-2 text-end">
              <el-button size="mini" type="text" @click="fieldNameVisible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="onSaveFieldName">确定</el-button>
            </div>
          </div>
          <template #reference>
            <ElDropdown trigger="click" @command="handleCommand">
              <ElButton
                size="mini"
                v-click-outside="{
                  handler: onClickOutside,
                  include
                }"
              >
                <VIcon>add</VIcon>
                新增字段
              </ElButton>
              <ElDropdownMenu ref="dropDownMenu" slot="dropdown">
                <ElDropdownItem v-for="(option, i) in fieldTypeOptions" :key="i" :command="option.value">{{
                  option.label
                }}</ElDropdownItem>
              </ElDropdownMenu>
            </ElDropdown>
          </template>
        </ElPopover>
      </div>
      <ElTree
        class="fs-8 node-schema-tree overflow-y-auto"
        :indent="8"
        :data="treeData"
        :render-content="renderContent"
        :empty-text="treeEmptyText"
      ></ElTree>
      <code class="color-success-light-5">}</code>
    </div>
  </div>
</template>

<script>
import { unionBy, orderBy, merge } from 'lodash'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { Path } from '@formily/path'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { Time, ClickOutside } from '@tap/shared'
import { AsyncSelect, FieldSelect } from '@tap/form'
import { IconButton } from '@tap/component'
import { TableSelect } from '../form'
import { sourceEndpoint, targetEndpoint } from '../../style'
import NodeIcon from '../NodeIcon.vue'
export default {
  name: 'Node',

  props: {
    position: Array,
    inputs: Array,
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
    nodeSchemaMap: Object,
    nodeMap: Object,
    inputsMap: Object,
    hasTargetNode: Boolean,
    schemaLoading: Boolean
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
    let fieldType = 'Flatten'

    if (this.node.mergeType === 'updateIntoArray') {
      fieldType = 'Array'
    } else if (this.node.targetPath) {
      fieldType = 'Document'
    }

    return {
      loading: false,
      params: {
        where: { database_type: 'MongoDB' }
      },
      targetFields: [],
      targetPath: this.node.targetPath,
      fieldNameVisible: false,
      fieldName: '',
      fieldType,
      fieldTypeOptions: [
        {
          label: '平铺',
          value: 'Flatten'
        },
        {
          label: '内嵌文档',
          value: 'Document'
        },
        {
          label: '内嵌数组',
          value: 'Array'
        }
      ]
    }
  },

  computed: {
    ...mapGetters('dataflow', ['nodeById', 'isActionActive', 'isNodeSelected']),

    tableComment() {
      return this.dagNode.attrs.tableComment
    },

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

    displaySchema() {
      return this.dagNode.connectionId && this.dagNode.tableName
    },

    treeData() {
      // console.log('computed:treeData')
      let { schema } = this

      if (!schema) return []

      const richFields = (inputs, targetPath) => {
        let arr = []
        for (const input of inputs) {
          const inputNode = this.nodeMap[input]
          let fields = this.nodeSchemaMap[input]
          if (!fields) continue

          let nodeTargetPath = inputNode.targetPath
          if (nodeTargetPath && targetPath) {
            nodeTargetPath = nodeTargetPath.replace(new RegExp(`${targetPath}?.`), '')
          }

          if (this.inputsMap[input]?.length) {
            arr = unionBy(arr, fields, richFields(this.inputsMap[input], nodeTargetPath), 'field_name')
          } else {
            // if (nodeTargetPath && targetPath) {
            //   nodeTargetPath.replace(new RegExp(`${targetPath}?.`), '')
            // }

            if (nodeTargetPath) {
              fields = fields.map(field => {
                return {
                  ...field,
                  field_name: `${nodeTargetPath}.${field.field_name}`
                }
              })
              fields.unshift({
                field_name: nodeTargetPath,
                dataType: 'DOCUMENT'
              })
            }
            arr = unionBy(arr, fields)
          }
        }
        return arr
      }
      const inputs = this.inputsMap?.[this.node.id]

      if (inputs?.length) {
        const mergedFields = richFields(this.inputsMap[this.node.id], this.node.targetPath)
        schema = unionBy(schema, mergedFields, 'field_name')
        schema.sort((a, b) => {
          let aVal, bVal

          if (a.isPrimaryKey) aVal = 1
          else if (a.indicesUnique) aVal = 2
          else aVal = 3

          if (b.isPrimaryKey) bVal = 1
          else if (b.indicesUnique) bVal = 2
          else bVal = 3

          if (aVal === bVal) {
            return a.field_name.localeCompare(b.field_name)
          }

          return aVal - bVal
        })
        console.log('schema', schema)
      }

      const treeData = this.createTree(schema)

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
    },

    treeEmptyText() {
      if (!this.dagNode.connectionId) {
        return this.isMainTable ? '请选择模型主表' : '请选择连接'
      }

      if (!this.dagNode.tableName) {
        return this.isMainTable ? '请选择模型主表' : '请选择连表'
      }

      return '暂无数据'
    }

    /*fieldType: {
      get() {
        const { mergeType, targetPath } = this.node
        if (mergeType === 'updateIntoArray') {
          return 'Array'
        }
        if (targetPath) {
          return 'Document'
        }
        return 'Flatten'
      },

      set(v) {
        console.log('v', v)
      }
    }*/
  },

  mounted() {
    if (this.node && this.ins) {
      this.__init()
    }
  },

  methods: {
    ...mapActions('dataflow', ['updateDag']),
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
            label: `${item.name} ${item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''}`,
            value: item.id,
            databaseType: item.database_type,
            connectionType: item.connection_type,
            ...item
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
          value: item.original_name,
          comment: item.comment
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
      if (!this.node.joinKeys) {
        this.$set(this.node, 'joinKeys', [
          {
            source: '',
            target: ''
          }
        ])
        return
      }
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

      this.targetFields = fields.map(item => {
        let label = item.field_name
        const arr = label.split('.')

        if (arr.length > 1) {
          const parentPath = arr.slice(0, arr.length - 1).join('.')
          const tableName = this.targetPathMap[parentPath].tableNode.tableName
          label = `${tableName}.${arr.pop()}`
        }

        return {
          label,
          value: item.field_name,
          isPrimaryKey: item.primary_key_position > 0
        }
      })
    },

    handleCommand(command) {
      this.currentCommand = command
      switch (command) {
        case 'Flatten':
          this.fieldName = ''
          this.handleAddTableNode()
          break
        case 'Document':
        case 'Array':
          this.fieldName = ''
          this.fieldNameVisible = true
          this.$nextTick(() => {
            this.$refs.fieldPopover.querySelector('input')?.focus()
          })
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
        mergeType: this.currentCommand === 'Array' ? 'updateIntoArray' : 'updateWrite', // 非主表非内嵌数组默认是更新写入
        targetPath: this.fieldName
          ? `${this.node.targetPath ? this.node.targetPath + '.' : ''}${this.fieldName}`
          : this.node.targetPath || ''
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
      const nodeAttrs = {
        connectionName: connection.name,
        connectionType: connection.connection_type,
        accessNodeProcessId: connection.accessNodeProcessId,
        pdkType: connection.pdkType,
        pdkHash: connection.pdkHash,
        capabilities: connection.capabilities || []
      }
      this.dagNode.databaseType = connection.databaseType
      Object.keys(nodeAttrs).forEach(key => {
        this.$set(this.dagNode.attrs, key, nodeAttrs[key])
      })
    },

    async onChangeConnection() {
      this.dagNode.tableName = ''
      await this.updateDag({ vm: this, isNow: true })
      // this.$emit('load-schema')
    },

    async onChangeTable(table) {
      this.node.tableName = table
      this.dagNode.name = table
      let result = this.updateDag()
      await this.updateDag({ vm: this, isNow: true })
      this.$emit('load-schema')
    },

    onTableSelect(table) {
      this.$set(this.dagNode.attrs, 'tableComment', table.comment)
    },

    onChangeType(type) {
      if (type === 'Array') {
        this.node.mergeType = 'updateIntoArray'
      } else {
        this.node.mergeType = 'updateWrite'
        if (type === 'Flatten') {
          this.targetPath = ''
          this.$emit('change-path', this.node, '')
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import 'style';
</style>
