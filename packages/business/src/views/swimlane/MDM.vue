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
    <div class="flex flex-column flex-1 min-h-0 p-3">
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
    </div>
    <TablePreview ref="tablePreview"></TablePreview>
  </div>
</template>

<script>
import { VirtualTree } from '@tap/component'
import ClassificationTree from '../../components/ClassificationTree'
import TablePreview from './TablePreview'
export default {
  name: 'MDM',

  props: {
    directories: Array
  },

  components: { VirtualTree, TablePreview },

  data() {
    return {}
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
    }
  }
}
</script>

<style scoped></style>
