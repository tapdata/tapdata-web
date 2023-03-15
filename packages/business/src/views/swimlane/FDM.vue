<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex justify-content-between p-4">
      <span class="fs-6">FDM / CACHE</span>
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
      class="flex flex-column flex-1 min-h-0 position-relative fdm-tree-wrap p-3 overflow-auto"
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

      <div class="drop-mask justify-center align-center absolute-fill font-color-light">
        {{ dialogConfig.connection ? 'Clone To FDM' : 'Please Configure FDM' }}
      </div>
    </div>

    <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">Create Cloning Pipeline</span>
      <ElForm ref="form" :model="dialogConfig" label-width="180px">
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
import { connectionsApi, ldpApi } from '@tap/api'
import { VirtualTree } from '@tap/component'
import { merge } from 'lodash'
import { uuid } from '@tap/shared'

export default {
  name: 'FDM',

  props: {
    dragState: Object,
    settings: Object,
    directories: Array
  },

  components: { VirtualTree },

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
      creating: false
    }
  },

  computed: {
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

  methods: {
    searchFnc() {},

    renderContent(h, { node, data }) {
      let icon = data.type === 'table' ? 'table' : 'folder-outline'

      return (
        <div class="custom-tree-node">
          <div class="tree-item-icon flex align-center mr-2">{icon && <VIcon size="18">{icon}</VIcon>}</div>
          <span class="table-label" title={data.name}>
            {data.name}
          </span>
        </div>
      )
    },

    async loadDatabases(filter) {
      try {
        const _filter = {
          where: {
            status: 'ready',
            database_type: 'MongoDB',
            connection_type: 'source_and_target'
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
      this.taskDialogConfig.visible = true
    },

    async taskDialogSubmit() {
      const { tableName, from } = this.taskDialogConfig
      let task = this.makeMigrateTask(from, tableName)

      this.creating = true
      try {
        await ldpApi.createFDMTask(task)
        this.taskDialogConfig.visible = false
        this.$emit('load-directories')
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

      const dropNode = this.findParentByClassName(ev.currentTarget, 'fdm-tree-wrap')
      dropNode.classList.add('is-drop-inner')
    },

    handleDragLeave(ev) {
      ev.preventDefault()

      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        const dropNode = this.findParentByClassName(ev.currentTarget, 'fdm-tree-wrap')
        dropNode.classList.remove('is-drop-inner')
      }
    },

    handleDrop(ev) {
      ev.preventDefault()

      const dropNode = this.findParentByClassName(ev.currentTarget, 'fdm-tree-wrap')
      dropNode.classList.remove('is-drop-inner')

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      console.log('settings', this.settings) // eslint-disable-line

      if (object.data.type === 'connection') {
        this.taskDialogConfig.from = object.data
        this.taskDialogConfig.tableName = null
      } else if (object.data.type === 'table') {
        this.taskDialogConfig.from = object.parent.data
        this.taskDialogConfig.tableName = object.data.name
      }

      this.showTaskDialog()
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    makeMigrateTask(from, tableName) {
      let source = this.getSourceNode(from, tableName)
      let target = this.getDatabaseNode({
        id: this.settings.fdmStorageConnectionId,
        database_type: 'MongoDB'
      })
      let tableReNameNode = this.getTableReNameNode()

      return {
        // ...DEFAULT_SETTINGS,
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
      return `${from.name}_Clone_To_FDM_${uuid()}`
    },

    makeMigrateTaskByTable(from, tableName) {
      let source = this.getDatabaseNode(from)
      let target = this.getDatabaseNode({
        id: this.settings.fdmStorageConnectionId,
        database_type: 'MongoDB'
      })

      Object.assign(source, {
        migrateTableSelectType: 'custom',
        tableNames: [tableName]
      })

      return {
        // ...DEFAULT_SETTINGS,
        syncType: 'migrate',
        name: this.getTaskName(from),
        dag: {
          edges: [{ source: source.id, target: target.id }],
          nodes: [source, target]
        }
      }
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

.pipeline-desc {
  background-color: #f8f8fa;
  border-radius: 8px;
}
</style>
