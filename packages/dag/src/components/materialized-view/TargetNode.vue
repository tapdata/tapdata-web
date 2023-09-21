<template>
  <div
    class="materialized-view-node --target position-absolute rounded-lg bg-white"
    :class="nodeClass"
    :style="nodeStyle"
  >
    <div class="node-header bg-primary">
      <div class="node-title text-white lh-base flex align-center px-2 py-1">
        <VIcon class="mr-1">drag</VIcon><span class="ellipsis">{{ node.name }}</span>
      </div>
      <div class="flex gap-2 p-2">
        <AsyncSelect
          v-model="node.connectionId"
          placeholder="请选择存储数据库"
          :method="loadDatabases"
          :params="params"
          itemValue="id"
          itemQuery="name"
          :onSetSelected="onConnectionSelect"
          @change="onChangeConnection"
        >
          <template #prefix>
            <div class="flex align-center h-100">
              <NodeIcon :node="node" :size="20" />
            </div>
          </template>
        </AsyncSelect>
        <TableSelect
          v-model="node.tableName"
          placeholder="请选择存储表"
          :disabled="!node.connectionId"
          :method="loadTable"
          :connectionId="node.connectionId"
          itemType="object"
          itemQuery="value"
          allowCreate
          @change="onChangeTable"
        ></TableSelect>
      </div>
    </div>
    <div class="p-2 node-body">
      <div class="flex align-center">
        <code class="color-success-light-5 mr-2">{</code>
        <!--<ElPopover placement="top" width="240" v-model="fieldNameVisible" trigger="manual">
          <div ref="fieldPopover">
            <ElInput v-model="fieldName" placeholder="输入字段名"></ElInput>
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
                &lt;!&ndash;Flatten&ndash;&gt;
                <ElDropdownItem command="Flatten">平铺</ElDropdownItem>
                &lt;!&ndash;Embedded Document&ndash;&gt;
                <ElDropdownItem command="Document">内嵌文档</ElDropdownItem>
                &lt;!&ndash;Embedded Array&ndash;&gt;
                <ElDropdownItem command="Array">内嵌数组</ElDropdownItem>
              </ElDropdownMenu>
            </ElDropdown>
          </template>
        </ElPopover>-->
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
import { merge } from 'lodash'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { Time, ClickOutside } from '@tap/shared'
import { AsyncSelect } from '@tap/form'
import i18n from '@tap/i18n'
import { TableSelect } from '../form'
import { sourceEndpoint, targetEndpoint } from '../../style'
import { NODE_PREFIX } from '../../constants'
import NodeIcon from '../NodeIcon.vue'
export default {
  name: 'TargetNode',

  props: {
    position: Array,
    schema: Array,
    node: {
      type: Object,
      default: () => ({})
    },
    data: Object,
    jsPlumbIns: Object
  },

  components: {
    NodeIcon,
    AsyncSelect,
    TableSelect
  },

  directives: { ClickOutside },

  data() {
    return {
      loading: false,
      params: {
        isTarget: true,
        where: { database_type: 'MongoDB' }
      },
      fieldNameVisible: false,
      fieldName: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeNode']),

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
      console.log('computed:treeData')
      return this.schema ? this.createTree(this.schema) : []
    },

    treeEmptyText() {
      if (!this.node.connectionId) {
        return '请选择连接'
      }

      if (!this.node.tableName) {
        return '请选择连表'
      }

      return '暂无数据'
    }
  },

  mounted() {
    if (this.node.id) {
      // this.loadSchema()
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

    __init() {
      const { id } = this.node
      const nodeId = id

      const targetParams = {
        ...targetEndpoint
      }

      // this.jsPlumbIns.makeSource(id, { filter: '.sourcePoint', ...sourceEndpoint })

      this.jsPlumbIns.makeTarget(id, targetParams)

      this.jsPlumbIns.draggable(this.$el, {
        // containment: 'parent',
        handle: '.node-title, .node-title *',
        start: params => {
          this.onMouseDownAt = Time.now()
          // console.log('node-drag-start', params.pos)
          if (params.e && !this.isNodeSelected(this.node.id)) {
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
          const { position } = this.data.attrs
          const newProperties = []
          const oldProperties = []

          if (this.isActionActive('dragActive')) {
            const moveNodes = [...this.$store.getters['dataflow/getSelectedNodes']]

            if (!this.isNodeSelected(this.node.id)) {
              moveNodes.push(this.data)
            }
            /*const selectedNodeNames = moveNodes.map(node => node.id)

            if (!selectedNodeNames.includes(this.data.id)) {
              moveNodes.push(this.data)
            }*/

            let x = parseFloat(this.$el.style.left)
            let y = parseFloat(this.$el.style.top)

            const distance = Math.sqrt(Math.pow(x - position[0], 2) + Math.pow(y - position[1], 2))

            if (x === position[0] && y === position[1]) {
              // 拖拽结束后位置没有改变
              console.log('NotMove') // eslint-disable-line
              this.isNotMove = true
              this.removeActiveAction('dragActive')
            }

            if (distance < 4 || Time.now() - this.onMouseDownAt < 10) {
              console.log(
                i18n.t('packages_dag_components_dfnode_tuodongshijianduan'),
                Time.now() - this.onMouseDownAt,
                distance
              ) // eslint-disable-line
              this.removeActiveAction('dragActive')
            }

            moveNodes.forEach(node => {
              const nodeElement = NODE_PREFIX + node.id
              const element = document.getElementById(nodeElement)
              if (element === null) {
                return
              }

              let newNodePosition = [parseFloat(element.style.left), parseFloat(element.style.top)]

              const updateInformation = {
                id: node.id,
                properties: {
                  attrs: { position: newNodePosition }
                }
              }

              oldProperties.push({
                id: node.id,
                properties: {
                  attrs: { position }
                }
              })
              newProperties.push(updateInformation)
            })
          }

          this.onMouseDownAt = undefined
          this.$emit('drag-stop', this.isNotMove, oldProperties, newProperties)
        }
      })

      this.targetPoint = this.jsPlumbIns.addEndpoint(this.$el, targetParams, {
        uuid: id + '_target'
      })
    },

    mouseClick(e) {
      if (this.isActionActive('dragActive')) {
        this.removeActiveAction('dragActive')
      } else {
        if (!this.ins) return
        if (this.isCtrlKeyPressed(e) === false) {
          // 如果不是多选模式则取消所有节点选中
          this.$emit('deselectAllNodes')
        }

        if (this.isNodeSelected(this.node.id)) {
          this.$emit('deselectNode', this.node.id)
        } else {
          // 选中节点并且active
          this.$emit('nodeSelected', this.node.id, true)
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
          break
      }
    },

    handleAddTableNode() {
      let mergeProperties = this.activeNode.mergeProperties

      if (!mergeProperties) {
        mergeProperties = this.activeNode.mergeProperties = []
      }

      this.$emit(
        'add-node',
        {
          id: this.node.id,
          children: mergeProperties
        },
        {
          mergeType: this.currentCommand === 'Array' ? 'updateIntoArray' : 'updateWrite',
          targetPath: this.fieldName
            ? `${this.node.targetPath ? this.node.targetPath + '.' : ''}${this.fieldName}`
            : this.node.targetPath || ''
        }
      )
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

      Object.keys(nodeAttrs).forEach(key => {
        this.$set(this.node.attrs, key, nodeAttrs[key])
      })
    },

    async onChangeConnection() {
      this.node.tableName = ''
      await this.updateDag({ vm: this, isNow: true })
      this.$emit('load-schema')
    },

    async onChangeTable(table) {
      this.node.name = table
      await this.updateDag({ vm: this, isNow: true })
      this.$emit('load-schema')
    }
  }
}
</script>

<style scoped lang="scss">
@import 'style';
</style>
