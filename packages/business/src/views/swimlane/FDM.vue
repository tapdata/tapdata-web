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
        :data="treeData"
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

    <ElDialog :visible.sync="dialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px"> Configure FDM </span>
      <ElForm ref="form" :model="dialogConfig" label-width="180px">
        <ElFormItem label="Select Connection">
          <AsyncSelect
            v-model="dialogConfig.connectionId"
            :method="loadDatabases"
            itemLabel="label"
            itemValue="id"
            itemQuery="name"
            :current-label="dialogConfig.connectionName"
            :onSetSelected="handleSelectConnection"
          >
          </AsyncSelect>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="dialogConfig.visible = false">{{
          $t('packages_component_button_cancel')
        }}</ElButton>
        <ElButton size="mini" type="primary" @click="dialogSubmit">
          {{ $t('packages_component_button_confirm') }}
        </ElButton>
      </span>
    </ElDialog>

    <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
      <span slot="title" style="font-size: 14px">Create Cloning Pipeline</span>
      <ElForm ref="form" :model="dialogConfig" label-width="180px">
        <div class="pipeline-desc p-4 mb-4 text-pre">{{ taskDesc }}</div>
        <ElFormItem label="Table Name Prefix">
          <ElInput size="small" v-model="taskDialogConfig.prefix"></ElInput>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="taskDialogConfig.visible = false">{{
          $t('packages_component_button_cancel')
        }}</ElButton>
        <ElButton size="mini" type="primary" @click="taskDialogSubmit">
          {{ $t('packages_component_button_confirm') }}
        </ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import { connectionsApi } from '@tap/api'
import { AsyncSelect } from '@tap/form'
import { VirtualTree } from '@tap/component'
import { merge } from 'lodash'

export default {
  name: 'FDM',

  props: {
    dragState: Object
  },

  components: { AsyncSelect, VirtualTree },

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
      treeData: []
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

    handleSelectConnection(option) {
      this.dialogConfig._connection = option
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
          this.showDialog()
          break
      }
    },

    showDialog() {
      this.dialogConfig.visible = true
      this.dialogConfig.connectionName = this.dialogConfig.connection?.name
      this.dialogConfig.connectionId = this.dialogConfig.connection?.id
    },

    showTaskDialog() {
      this.taskDialogConfig.visible = true
    },

    dialogSubmit() {
      localStorage.setItem('LDP_FDM_CONNECTION_ID', this.dialogConfig.connectionId)
      localStorage.setItem('LDP_FDM_CONNECTION', JSON.stringify(this.dialogConfig._connection))
      this.dialogConfig.connection = this.dialogConfig._connection
      this.dialogConfig._connection = null
      this.dialogConfig.visible = false
    },

    taskDialogSubmit() {
      this.taskDialogConfig.visible = false
      this.treeData.push(this.taskDialogConfig.treeData)
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

      if (!this.dialogConfig.connection) {
        this.showDialog()
        return
      }

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      if (object.data.type === 'connection') {
        this.taskDialogConfig.from = object.data
        this.taskDialogConfig.to = this.dialogConfig.connection
        this.taskDialogConfig.tableName = null

        this.taskDialogConfig.treeData = {
          ...object.data
        }

        if (object.childNodes.length) {
          this.taskDialogConfig.treeData.children = object.childNodes.map(node => node.data)
        }
      } else if (object.data.type === 'table') {
        this.taskDialogConfig.from = object.parent.data
        this.taskDialogConfig.tableName = object.data.name
        this.taskDialogConfig.to = this.dialogConfig.connection

        this.taskDialogConfig.treeData = {
          ...object.parent.data,
          children: [
            {
              ...object.data
            }
          ]
        }
      }

      this.showTaskDialog()
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
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
