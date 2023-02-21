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
      class="flex flex-column flex-1 min-h-0 position-relative fdm-tree-wrap"
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
        :render-after-expand="false"
        :expand-on-click-node="false"
        :allow-drop="() => false"
      ></VirtualTree>

      <div class="drop-mask justify-center align-center absolute-fill font-color-light">Clone To FDM</div>
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
  </div>
</template>

<script>
import { connectionsApi } from '@tap/api'
import { AsyncSelect } from '@tap/form'
import { VirtualTree } from '@tap/component'
import { merge } from 'lodash'

export default {
  name: 'FDM',

  components: { AsyncSelect, VirtualTree },

  data() {
    return {
      keyword: '',
      dialogConfig: {
        title: '',
        connectionId: '',
        desc: '',
        taskName: '',
        syncType: '',
        visible: false
      },
      treeData: []
    }
  },

  methods: {
    searchFnc() {},

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
          this.dialogConfig.visible = true
          this.dialogConfig.connectionId = localStorage.LDP_FDM_CONNECTION_ID || ''
          break
      }
    },

    dialogSubmit() {
      localStorage.setItem('LDP_FDM_CONNECTION_ID', this.dialogConfig.connectionId)
      this.dialogConfig.visible = false
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
      console.log('handleDrop', this.dragState) // eslint-disable-line
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
  background-color: rgba(255, 255, 255, 0.8);
}

.is-drop-inner .drop-mask {
  display: flex;
}
</style>
