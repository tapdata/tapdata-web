<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_sources') }}</span>
      <div class="flex-grow-1"></div>
      <IconButton @click="handleAdd">add</IconButton>
      <!--<IconButton>search-outline</IconButton>-->
      <!--<IconButton>more</IconButton>-->
    </div>
    <div class="flex-1 min-h-0" v-loading="loading">
      <VirtualTree
        class="ldp-tree h-100"
        ref="tree"
        node-key="id"
        highlight-current
        :props="props"
        draggable
        lazy
        height="100%"
        wrapper-class-name="p-2"
        :load="loadNode"
        :filter-node-method="filterNode"
        :render-after-expand="false"
        :expand-on-click-node="false"
        :allow-drop="() => false"
        @check="checkHandler"
        @node-drag-start="handleDragStart"
        @node-drag-end="handleDragEnd"
      >
        <span
          class="custom-tree-node flex align-items-center"
          :class="{ grabbable: data.isObject }"
          slot-scope="{ node, data }"
          @dblclick="$emit('preview', data)"
        >
          <VIcon
            v-if="node.data.loadFieldsStatus === 'loading'"
            class="v-icon animation-rotate"
            size="14"
            color="rgb(61, 156, 64)"
            >loading-circle</VIcon
          >
          <NodeIcon v-if="!node.data.isLeaf" :node="node.data" :size="18" class="tree-item-icon mr-2" />
          <div v-else-if="node.data.isEmpty" class="flex align-items-center">
            <span class="mr-1">{{ $t('public_data_no_data') }}</span>
            <StageButton :connection-id="getConnectionId(node)"> </StageButton>
          </div>
          <VIcon v-else class="tree-item-icon mr-2" size="18">table</VIcon>
          <span :class="[{ 'color-disable': data.disabled }, 'table-label']" :title="data.name">{{ data.name }}</span>
          <IconButton class="btn-menu" sm @click="$emit('preview', data)"> view-details </IconButton>
        </span>
      </VirtualTree>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'

import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { VirtualTree, IconButton } from '@tap/component'
import connectionPreview from './connectionPreview'
import TablePreview from './TablePreview'
import NodeIcon from '@tap/dag/src/components/NodeIcon'
import StageButton from '@tap/business/src/components/StageButton'
import { makeDragNodeImage } from '../../shared'

export default {
  name: 'Source',

  props: {
    dragState: Object,
    eventDriver: Object
  },

  components: { NodeIcon, VirtualTree, StageButton, IconButton },

  data() {
    return {
      keyword: '',
      treeData: [],
      expandedKeys: [],
      props: {
        isLeaf: 'isLeaf',
        disabled: 'disabled'
      },
      loading: false
    }
  },

  methods: {
    handleAdd() {
      this.$emit('create-connection', 'source')
    },

    async getConnectionList() {
      let filter = {
        limit: 999,
        where: {
          connection_type: {
            in: ['source_and_target', 'source']
          },
          createType: {
            $ne: 'System'
          }
        }
      }
      const res = await connectionsApi.get({
        filter: JSON.stringify(filter)
      })

      return res.items.map(t => {
        const { status, loadCount = 0, tableCount = 0 } = t
        const disabled = status !== 'ready'
        return {
          ...t,
          progress: !tableCount ? 0 : Math.round((loadCount / tableCount) * 10000) / 100,
          children: [],
          isLeaf: false,
          disabled,
          type: 'connection',
          LDP_TYPE: 'connection'
        }
      })
    },

    async getTableList(id) {
      const res = await metadataInstancesApi.getSourceTablesValues(id)
      const data = res.map(t => {
        return {
          id: t.tableId,
          name: t.tableName,
          connectionId: id,
          isLeaf: true,
          isObject: true,
          type: 'table',
          LDP_TYPE: 'table'
        }
      })
      return data.length
        ? data
        : [
            {
              id: '',
              name: '',
              isLeaf: true,
              isEmpty: true
            }
          ]
    },

    handleSearch: debounce(function (val) {
      this.$refs.tree.filter(val)
    }, 300),

    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    checkHandler() {},

    handleDragStart(draggingNode, ev) {
      this.draggingNode = draggingNode
      this.draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        draggingNode.data.name
      )
      ev.dataTransfer.setDragImage(this.draggingNodeImage, 0, 0)
      ev.dataTransfer.effectAllowed = 'copy'
      this.dragState.isDragging = true
      this.dragState.draggingObjects = [draggingNode]
      this.dragState.from = 'SOURCE'
    },

    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      this.$emit('node-drag-end', ev)
      this.eventDriver.emit('source-drag-end', ev)
    },

    async loadNode(node, resolve) {
      if (node.level === 0) {
        const data = await this.getConnectionList()
        this.loading = false
        return resolve(data)
      }
      const data = await this.getTableList(node.data?.id)
      this.loading = false
      return resolve(data)
    },

    getConnectionId(node) {
      return node.parent.data?.id
    },

    getPercentage(node = {}) {
      return node.data?.progress || 0
    },

    addItem(data) {
      const { root = {} } = this.$refs.tree
      const firstChildKey = root.childNodes[0]?.key
      if (firstChildKey) {
        this.$refs.tree.insertBefore(data, firstChildKey)
      } else {
        this.$refs.tree.append(data, 0)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-list {
  overflow: auto;
  height: 0;
}
.custom-tree-node {
  .btn-menu {
    display: none;
  }
  &:hover .btn-menu {
    display: block;
  }
}
</style>
