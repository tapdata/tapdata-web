<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex justify-content-between p-4">
      <span class="fs-6">MDM / CURATED MODELS</span>
      <div class="operation">
        <VIcon size="16" class="icon-color ml-3">search-outline</VIcon>
        <ElDropdown trigger="click" @command="handleCommand">
          <VIcon size="16" class="icon-color ml-3 rotate-90">more</VIcon>
          <ElDropdownMenu slot="dropdown">
            <ElDropdownItem command="config"> Configure FDM </ElDropdownItem>
          </ElDropdownMenu>
        </ElDropdown>
      </div>
    </div>
    <div
      class="flex flex-column flex-1 position-relative min-h-0 p-3 tree-wrap"
      @dragover.stop="handleDragOver"
      @dragenter.stop="handleDragEnter"
      @dragleave.stop="handleDragLeave"
      @drop.stop="handleDrop"
    >
      <VirtualTree
        class="ldp-tree"
        ref="tree"
        node-key="id"
        highlight-current
        :data="directories"
        draggable
        :render-content="renderContent"
        :render-after-expand="false"
        :expand-on-click-node="false"
        :allow-drop="() => false"
      ></VirtualTree>

      <div class="drop-mask justify-center align-center absolute-fill font-color-light">Clone To MDM</div>
    </div>
    <TablePreview ref="tablePreview"></TablePreview>

    <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">Create Sync Pipeline</span>
      <ElForm ref="form" :model="taskDialogConfig" label-width="180px">
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
import { VirtualTree } from '@tap/component'
import TablePreview from './TablePreview'
import { TASK_SETTINGS } from '../../shared'
import { ldpApi } from '@tap/api'
import { uuid } from '@tap/shared'
export default {
  name: 'MDM',

  props: {
    directories: Array,
    settings: Object,
    dragState: Object,
    mdmConnection: Object
  },

  components: { VirtualTree, TablePreview },

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
      }
    }
  },

  methods: {
    renderContent(h, { node, data }) {
      let icon
      if (data.type === 'table') {
        node.isLeaf = true
        icon = 'table'
      } else {
        node.isLeaf = false
        icon = 'folder-outline'
      }

      return (
        <div class="custom-tree-node">
          <div class="tree-item-icon flex align-center mr-2">{icon && <VIcon size="18">{icon}</VIcon>}</div>
          <span class="table-label" title={data.name}>
            {data.name}
          </span>
        </div>
      )
    },

    handleViewDetails(data) {
      console.log('handleViewDetails', data) // eslint-disable-line
      this.$refs.tablePreview.open({
        id: data.id,
        category: data.category,
        type: data.type
      })
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

      const dropNode = this.findParentByClassName(ev.currentTarget, 'tree-wrap')
      dropNode.classList.add('is-drop-inner')
    },

    handleDragLeave(ev) {
      ev.preventDefault()

      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        const dropNode = this.findParentByClassName(ev.currentTarget, 'tree-wrap')
        dropNode.classList.remove('is-drop-inner')
      }
    },

    handleDrop(ev) {
      ev.preventDefault()

      const dropNode = this.findParentByClassName(ev.currentTarget, 'tree-wrap')
      dropNode.classList.remove('is-drop-inner')

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      console.log('settings', this.settings) // eslint-disable-line

      if (object.data.type !== 'table') return

      this.taskDialogConfig.from = object.parent.data
      this.taskDialogConfig.tableName = object.data.name
      this.taskDialogConfig.newTableName = object.data.name

      this.showTaskDialog()
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    showTaskDialog() {
      this.taskDialogConfig.visible = true
    },

    async taskDialogSubmit() {
      const { tableName, from, newTableName } = this.taskDialogConfig
      let task = this.makeTask(from, tableName, newTableName)

      this.creating = true
      try {
        await ldpApi.createMDMTask(task)
        this.taskDialogConfig.visible = false
        this.$emit('load-directories')
        this.$message.success(this.$t('public_message_operation_success'))
      } catch (e) {
        console.log(e) // eslint-disable-line
      }
      this.creating = false
    },

    makeTask(from, tableName, newTableName) {
      let source = this.getTableNode(from, tableName)
      let target = this.getTableNode(this.mdmConnection, newTableName)

      target.writeStrategy = 'appendWrite' // 追加写入模式

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
    }
  }
}
</script>

<style scoped>
.drop-mask {
  display: none;
  backdrop-filter: blur(4px);
  background-color: rgba(255, 255, 255, 0.4);
}

.is-drop-inner .drop-mask {
  display: flex;
}
</style>
