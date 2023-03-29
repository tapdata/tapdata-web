<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">Foundation Data Model</span>
      <div class="flex-grow-1"></div>
      <IconButton>search-outline</IconButton>
      <!--<ElDropdown trigger="click" @command="handleCommand">
        <IconButton class="ml-3">more</IconButton>
        <ElDropdownMenu slot="dropdown">
          <ElDropdownItem command="config"> Configure </ElDropdownItem>
        </ElDropdownMenu>
      </ElDropdown>-->
    </div>
    <div ref="treeWrap" class="flex flex-column flex-1 min-h-0 position-relative fdm-tree-wrap">
      <VirtualTree
        class="ldp-tree h-100"
        ref="tree"
        node-key="id"
        highlight-current
        :data="treeData"
        draggable
        height="100%"
        wrapper-class-name="p-2"
        :default-expanded-keys="expandedKeys"
        :render-content="renderContent"
        :render-after-expand="false"
        :expand-on-click-node="false"
        :allow-drop="() => false"
        :allow-drag="checkAllowDrag"
        @dragover.native.stop="handleDragOver"
        @dragenter.native.stop="handleDragEnter"
        @dragleave.native.stop="handleDragLeave"
        @drop.native.stop="handleDrop"
        @node-drag-start="handleDragStart"
        @node-drag-end="handleDragEnd"
        @node-expand="handleNodeExpand"
      ></VirtualTree>

      <div
        class="drop-mask justify-center align-center absolute-fill font-color-dark fs-6"
        :class="{ flex: allowDrop }"
      >
        Clone To FDM
      </div>
    </div>

    <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">Create Cloning Pipeline</span>
      <ElForm ref="form" :model="dialogConfig" label-width="180px" @submit.prevent>
        <div class="pipeline-desc p-4 mb-4 text-pre">{{ taskDesc }}</div>
        <ElFormItem label="Table Name Prefix">
          <ElInput size="small" v-model="taskDialogConfig.prefix"></ElInput>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="taskDialogConfig.visible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton :loading="creating" size="mini" type="primary" @click="taskDialogSubmit">
          {{ $t('public_button_confirm') }}
        </ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import { connectionsApi, discoveryApi, ldpApi } from '@tap/api'
import { VirtualTree, IconButton } from '@tap/component'
import { merge } from 'lodash'
import { uuid } from '@tap/shared'
import { makeDragNodeImage, TASK_SETTINGS } from '../../shared'

export default {
  name: 'FDM',

  props: {
    dragState: Object,
    settings: Object,
    fdmConnection: Object,
    directory: Object,
    eventDriver: Object
  },

  components: { VirtualTree, IconButton },

  data() {
    return {
      keyword: '',
      dialogConfig: {
        title: '',
        connection: null,
        connectionId: '',
        connectionName: '',
        desc: '',
        taskName: '',
        syncType: '',
        visible: false
      },
      taskDialogConfig: {
        from: null,
        to: null,
        visible: false,
        prefix: 'f_',
        tableName: null
      },
      creating: false,
      expandedKeys: []
    }
  },

  computed: {
    allowDrop() {
      return (
        this.dragState.isDragging &&
        this.dragState.from === 'SOURCE' &&
        this.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
      )
    },
    treeData() {
      return this.directory?.children || []
    },
    taskDesc() {
      if (!this.taskDialogConfig.from) return ''
      const { from, tableName } = this.taskDialogConfig
      return `This will clone ${
        tableName ? `Source Table: [${tableName}]` : `Source Database: [${from.name}]`
      } to FDM Layer.

所有的源表将统一存储到 FDM 库里,遵从以下的命名规范

${this.taskDialogConfig.prefix}<original_table_name>`
    }
  },

  created() {
    if (localStorage.LDP_FDM_CONNECTION) {
      this.dialogConfig.connection = JSON.parse(localStorage.LDP_FDM_CONNECTION)
    }
  },

  mounted() {
    this.eventDriver.on('source-drag-end', ev => {
      this.$refs.tree?.$el.classList.remove('is-drop')
    })
  },

  beforeDestroy() {
    this.eventDriver.off('source-drag-end')
  },

  methods: {
    searchFnc() {},

    renderContent(h, { node, data }) {
      let icon
      let className = ['custom-tree-node']

      if (data.isObject) {
        className.push('grabbable')
      }

      if (data.LDP_TYPE === 'table') {
        node.isLeaf = true
        icon = 'table'
      } else {
        node.isLeaf = false
        icon = 'folder-o'
      }

      return (
        <div
          class={className}
          onDblclick={() => {
            data.isObject && this.$emit('preview', data)
          }}
          onDrop={this.handleTreeNodeDrop}
        >
          <div class="tree-item-icon flex align-center mr-2">{icon && <VIcon size="18">{icon}</VIcon>}</div>
          <span class="table-label" title={data.name}>
            {data.name}
          </span>
          {data.isObject && (
            <IconButton
              class="btn-menu"
              sm
              onClick={() => {
                this.$emit('preview', data)
              }}
            >
              view-details
            </IconButton>
          )}
        </div>
      )
    },

    async loadDatabases(filter) {
      try {
        const _filter = {
          where: {
            status: 'ready',
            database_type: 'MongoDB',
            connection_type: 'source_and_target',
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
          return {
            id: item.id,
            name: item.name,
            label: item.name,
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

    handleCommand(command) {
      switch (command) {
        case 'config':
          this.$emit('show-settings')
          break
      }
    },

    showTaskDialog() {
      this.taskDialogConfig.prefix = 'f_'
      this.taskDialogConfig.visible = true
    },

    async taskDialogSubmit() {
      const { tableName, from } = this.taskDialogConfig
      let task = this.makeMigrateTask(from, tableName)

      this.creating = true
      try {
        await ldpApi.createFDMTask(task)
        this.taskDialogConfig.visible = false
        // this.$emit('load-directory')
        this.setNodeExpand()
        this.$message.success(this.$t('public_message_operation_success'))
      } catch (e) {
        console.log(e) // eslint-disable-line
      }
      this.creating = false
    },

    handleDragOver(ev) {
      ev.preventDefault()
    },

    handleDragEnter(ev) {
      ev.preventDefault()

      if (!this.allowDrop) return

      const dropNode = this.findParentByClassName(ev.currentTarget, 'ldp-tree')
      dropNode.classList.add('is-drop')
    },

    handleDragLeave(ev) {
      ev.preventDefault()

      if (!this.allowDrop) return
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        this.removeDropEffect(ev, 'ldp-tree', 'is-drop')
      }
    },

    handleDrop(ev) {
      ev.preventDefault()

      if (!this.allowDrop) return

      this.removeDropEffect(ev, 'ldp-tree', 'is-drop')

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      if (object.data.type === 'connection') {
        this.taskDialogConfig.from = object.data
        this.taskDialogConfig.tableName = null
      } else if (object.data.type === 'table') {
        this.taskDialogConfig.from = object.parent.data
        this.taskDialogConfig.tableName = object.data.name
      }

      this.showTaskDialog()
    },

    removeDropEffect(ev, cls = 'wrap__item', removeCls = 'is-drop-inner') {
      const dropNode = this.findParentByClassName(ev.currentTarget, cls)
      dropNode.classList.remove(removeCls)
    },

    handleTreeNodeDrop(ev) {
      ev.stopPropagation()
      this.handleDrop(ev)
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    makeMigrateTask(from, tableName) {
      let source = this.getSourceNode(from, tableName)
      let target = this.getDatabaseNode(this.fdmConnection)
      let tableReNameNode = this.getTableReNameNode()
      return {
        ...TASK_SETTINGS,
        syncType: 'migrate',
        name: this.getTaskName(from),
        dag: {
          edges: [
            { source: source.id, target: tableReNameNode.id },
            { source: tableReNameNode.id, target: target.id }
          ],
          nodes: [source, tableReNameNode, target]
        }
      }
    },

    getSourceNode(from, tableName) {
      let source = this.getDatabaseNode(from)

      Object.assign(
        source,
        tableName
          ? {
              migrateTableSelectType: 'custom',
              tableNames: [tableName]
            }
          : {
              migrateTableSelectType: 'expression',
              tableExpression: '.*'
            }
      )

      return source
    },

    getTaskName(from) {
      return `${from.name}_Clone_To_FDM_${uuid(4)}`
    },

    getDatabaseNode(db) {
      return {
        id: uuid(),
        type: 'database',
        name: db.name,
        connectionId: db.id,
        databaseType: db.database_type,
        attrs: {
          connectionName: db.name,
          connectionType: db.connection_type,
          accessNodeProcessId: db.accessNodeProcessId,
          pdkType: db.pdkType,
          pdkHash: db.pdkHash,
          capabilities: db.capabilities || []
        }
      }
    },

    getTableReNameNode() {
      return {
        id: uuid(),
        type: 'table_rename_processor',
        name: '表编辑',
        prefix: this.taskDialogConfig.prefix // 前缀
        // suffix: config.suffix, // 后缀
      }
    },

    async handleNodeExpand(data, node) {
      // 十秒内加载过资源，不再继续加载
      if (node.loadTime && Date.now() - node.loadTime < 10000) return

      node.loadTime = Date.now()

      let objects = await this.loadObjects(data)

      console.log('handleNodeExpand', objects, data, node) // eslint-disable-line
      const childrenMap = data.children ? data.children.reduce((map, item) => ((map[item.id] = true), map), {}) : {}
      objects.forEach(item => {
        if (childrenMap[item.id]) return
        item.parent_id = data.id
        item.isObject = true
        item.connectionId = item.sourceConId
        this.$refs.tree.append(item, node)
      })
    },

    loadObjects(node) {
      let where = {
        page: 1,
        pageSize: 10000,
        tagId: node.id,
        range: 'current',
        fields: {
          allTags: 1
        }
      }
      return discoveryApi.discoveryList(where).then(res => {
        return res.items.map(item =>
          Object.assign(item, {
            isLeaf: true,
            isObject: true,
            connectionId: item.sourceConId,
            LDP_TYPE: 'table'
          })
        )
      })
    },

    checkAllowDrag(node) {
      return node.data.LDP_TYPE === 'table'
    },

    handleDragStart(draggingNode, ev) {
      draggingNode = {
        ...draggingNode,
        parent: {
          data: this.fdmConnection
        }
      }
      this.draggingNode = draggingNode
      this.draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        draggingNode.data.name
      )
      ev.dataTransfer.setDragImage(this.draggingNodeImage, 4, 4)
      ev.dataTransfer.effectAllowed = 'copy'
      this.dragState.isDragging = true
      this.dragState.draggingObjects = [draggingNode]
      this.dragState.from = 'FDM'
    },

    handleDragEnd() {
      this.$emit('node-drag-end')
    },

    setNodeExpand() {
      const target = this.treeData.find(item => item.linkId === this.taskDialogConfig.from.id)
      if (target) {
        setTimeout(() => {
          const node = this.$refs.tree.getNode(target.id)
          this.handleNodeExpand(node.data, node)
          this.expandedKeys = [target.id]
        }, 1000)
      } else {
        this.$emit('load-directory')
      }
      // this.taskDialogConfig.from
    }
  }
}
</script>

<style scoped lang="scss">
.pipeline-desc {
  background-color: #f8f8fa;
  border-radius: 8px;
}
</style>
