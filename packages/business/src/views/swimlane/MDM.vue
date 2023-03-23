<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">MDM / CURATED MODELS</span>
      <div class="flex-grow-1"></div>
      <IconButton>search-outline</IconButton>
      <ElDropdown trigger="click" @command="handleCommand">
        <IconButton class="ml-3">more</IconButton>
        <ElDropdownMenu slot="dropdown">
          <ElDropdownItem command="config"> Configure </ElDropdownItem>
        </ElDropdownMenu>
      </ElDropdown>
    </div>
    <div
      ref="treeWrap"
      class="flex flex-column flex-1 position-relative min-h-0 tree-wrap"
      @dragover.stop="handleDragOver"
      @dragenter.stop="handleDragEnter"
      @dragleave.stop="handleDragLeave"
      @drop.stop="handleDrop"
    >
      <div class="p-3 overflow-auto">
        <VirtualTree
          class="ldp-tree"
          ref="tree"
          node-key="id"
          highlight-current
          :data="treeData"
          draggable
          :default-expanded-keys="expandedKeys"
          :render-content="renderContent"
          :render-after-expand="false"
          :expand-on-click-node="false"
          :allow-drop="() => false"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
          @node-expand="handleNodeExpand"
        ></VirtualTree>
      </div>

      <div
        class="drop-mask justify-center align-center absolute-fill font-color-dark fs-6"
        :class="{ flex: allowDrop }"
      >
        Clone To MDM
      </div>
    </div>

    <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">Create Sync Pipeline</span>
      <ElForm ref="form" :model="taskDialogConfig" label-width="180px" @submit.prevent>
        <!--<div class="pipeline-desc p-4 mb-4 text-pre">{{ taskDesc }}</div>-->
        <ElFormItem label="Table Name">
          <ElInput size="small" v-model="taskDialogConfig.newTableName"></ElInput>
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
import { VirtualTree, IconButton } from '@tap/component'
import { makeDragNodeImage, TASK_SETTINGS } from '../../shared'
import { discoveryApi, ldpApi } from '@tap/api'
import { uuid } from '@tap/shared'
export default {
  name: 'MDM',

  props: {
    directory: Object,
    settings: Object,
    dragState: Object,
    mdmConnection: Object,
    eventDriver: Object,
    loadingDirectory: Boolean
  },

  components: { VirtualTree, IconButton },

  data() {
    return {
      creating: false,
      taskDialogConfig: {
        from: null,
        to: null,
        visible: false,
        prefix: 'f_',
        tableName: null,
        newTableName: null
      },
      expandedKeys: []
    }
  },

  computed: {
    treeData() {
      return this.directory?.children || []
    },
    allowDrop() {
      return (
        this.dragState.isDragging &&
        ['SOURCE', 'FDM'].includes(this.dragState.from) &&
        this.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
      )
    }
  },

  watch: {
    loadingDirectory(v) {
      if (!v) {
        this.setNodeExpand()
      }
    }
  },

  mounted() {
    // this.setNodeExpand()
  },

  methods: {
    renderContent(h, { node, data }) {
      let icon
      if (data.LDP_TYPE === 'table') {
        node.isLeaf = true
        icon = 'table'
      } else {
        node.isLeaf = false
        icon = 'folder-outline'
      }

      return (
        <div
          class="custom-tree-node"
          on={{
            dblclick: () => {
              data.isObject && this.$emit('preview', data)
            },
            dragenter: ev => {
              ev.stopPropagation()
              this.handleTreeDragEnter(ev, data, node)
            },
            dragover: ev => {
              ev.stopPropagation()
              this.handleTreeDragOver(ev, data, node)
            },
            dragleave: ev => {
              ev.stopPropagation()
              this.handleTreeDragLeave(ev, data, node)
            },
            drop: ev => {
              ev.stopPropagation()
              this.handleTreeDrop(ev, data, node)
            }
          }}
        >
          <div class="tree-item-icon flex align-center mr-2">{icon && <VIcon size="18">{icon}</VIcon>}</div>
          <span class="table-label" title={data.name}>
            {data.name}
          </span>
          {data.isObject && (
            <VIcon
              size="18"
              class="btn-menu"
              onClick={() => {
                this.$emit('preview', data)
              }}
            >
              view-details
            </VIcon>
          )}
        </div>
      )
    },

    handleCommand(command) {
      switch (command) {
        case 'config':
          this.$emit('show-settings')
          break
      }
    },

    handleDragOver(ev) {
      ev.preventDefault()
    },

    handleDragEnter(ev) {
      ev.preventDefault()

      if (!this.allowDrop) return

      const dropNode = this.findParentByClassName(ev.currentTarget, 'tree-wrap')
      dropNode.classList.add('is-drop-inner')
    },

    handleDragLeave(ev) {
      ev.preventDefault()

      if (!this.allowDrop) return
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        this.removeDropEffect(ev, 'tree-wrap')
      }
    },

    handleDrop(ev) {
      ev.preventDefault()

      this.removeDropEffect(ev, 'tree-wrap')

      if (!this.allowDrop) return

      this.showTaskDialog()
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    showTaskDialog(tagId) {
      const {
        draggingObjects: [object]
      } = this.dragState
      this.taskDialogConfig.from = object.parent.data
      this.taskDialogConfig.tableName = object.data.name
      this.taskDialogConfig.newTableName = object.data.name
      this.taskDialogConfig.tagId = tagId
      this.taskDialogConfig.visible = true
    },

    async taskDialogSubmit() {
      const { tableName, from, newTableName, tagId } = this.taskDialogConfig
      let task = this.makeTask(from, tableName, newTableName)
      this.creating = true

      try {
        await ldpApi.createMDMTask(task, { tagId })
        this.taskDialogConfig.visible = false
        // this.$emit('load-directory')

        setTimeout(() => {
          this.setNodeExpand(tagId)
        }, 1000)
        this.$message.success(this.$t('public_message_operation_success'))
      } catch (e) {
        console.log(e) // eslint-disable-line
      }
      this.creating = false
    },

    makeTask(from, tableName, newTableName) {
      let source = this.getTableNode(from, tableName)
      let target = this.getTableNode(this.mdmConnection, newTableName)
      return {
        ...TASK_SETTINGS,
        syncType: 'sync',
        name: this.getTaskName(from, tableName, newTableName),
        dag: {
          edges: [{ source: source.id, target: target.id }],
          nodes: [source, target]
        }
      }
    },

    getTableNode(db, tableName) {
      return {
        id: uuid(),
        type: 'table',
        name: tableName,
        tableName,
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

    getTaskName(from, tableName, newTableName) {
      return `${from.name}_Sync_${tableName}_To_MDM_${newTableName}_${uuid(4)}`
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

    setNodeExpand(tagId) {
      if (tagId) {
        const node = this.$refs.tree.getNode(tagId)
        this.handleNodeExpand(node.data, node)
        this.expandedKeys = [tagId]
      } else {
        this.directory?.id && this.handleNodeExpand(this.directory, this.$refs.tree.root)
      }
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

    handleTreeDragOver(ev) {
      ev.preventDefault()
    },

    handleTreeDragEnter(ev, data) {
      ev.preventDefault()

      if (!this.allowDrop) return

      const dropNode = this.findParentNodeByClassName(ev.currentTarget, 'el-tree-node')
      dropNode.classList.add('is-drop-inner')
    },

    handleTreeDragLeave(ev, data) {
      ev.preventDefault()

      if (!this.allowDrop) return
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        this.removeDropEffect(ev, 'el-tree-node')
      }
    },

    handleTreeDrop(ev, data) {
      ev.preventDefault()

      if (!this.allowDrop) return

      this.removeDropEffect(ev, 'el-tree-node')
      this.removeDropEffect(ev, 'tree-wrap')
      this.showTaskDialog(data.id)
      console.log('handleTreeDrop') // eslint-disable-line
    },

    findParentNodeByClassName(el, cls) {
      let parent = el.parentNode
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    removeDropEffect(ev, cls = 'wrap__item') {
      const dropNode = this.findParentByClassName(ev.currentTarget, cls)
      dropNode.classList.remove('is-drop-inner')
    },

    handleDragStart(draggingNode, ev) {
      draggingNode = {
        ...draggingNode,
        parent: {
          data: this.mdmConnection
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
      this.dragState.from = 'MDM'
    },

    handleDragEnd() {
      this.$emit('node-drag-end')
    }
  }
}
</script>

<style scoped lang="scss">
.drop-mask {
  display: none;
  pointer-events: none;
  backdrop-filter: blur(4px);
  background-color: rgba(255, 255, 255, 0.4);
}

.is-drop-inner {
  box-shadow: 0px 0px 0px 2px map-get($color, primary) inset;
  .drop-mask {
    display: none !important;
  }
}
</style>
