<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex justify-content-between p-4">
      <span class="fs-6">SOURCES</span>
      <div class="operation">
        <VIcon size="16" class="icon-color" @click="handleAdd">add-fill</VIcon>
        <VIcon size="16" class="icon-color ml-3">search-outline</VIcon>
        <VIcon size="16" class="icon-color ml-3 rotate-90">more</VIcon>
      </div>
    </div>
    <div class="flex flex-column flex-1 min-h-0">
      <!--<div class="p-3 flex align-items-center">
        <ElInput
          class="search-input flex-fill"
          v-model="keyword"
          prefix-icon="el-icon-search"
          size="mini"
          clearable
          style="width: 240px"
          @input="handleSearch"
        ></ElInput>
        <VIcon class="ml-2">filter</VIcon>
      </div>-->
      <div v-loading="loading" class="p-3 flex-fill tree-list">
        <VirtualTree
          class="ldp-tree"
          ref="tree"
          node-key="id"
          highlight-current
          :props="props"
          :data="treeData"
          draggable
          lazy
          :load="loadNode"
          :filter-node-method="filterNode"
          :render-after-expand="false"
          :expand-on-click-node="false"
          :allow-drop="() => false"
          :key="treeTime"
          @node-click="nodeClickHandler"
          @check="checkHandler"
          @node-drag-start="handleDragStart"
        >
          <span class="custom-tree-node flex align-items-center" slot-scope="{ node, data }">
            <VIcon
              v-if="node.data.loadFieldsStatus === 'loading'"
              class="v-icon animation-rotate"
              size="14"
              color="rgb(61, 156, 64)"
              >loading-circle</VIcon
            >
            <ElProgress
              v-if="node.data.loadFieldsStatus === 'loading'"
              type="circle"
              :percentage="node.data.progress"
              :show-text="false"
              :width="20"
              :stroke-width="2"
              class="mr-2"
            ></ElProgress>
            <NodeIcon v-if="!node.data.isLeaf" :node="node.data" :size="18" class="tree-item-icon mr-2" />
            <div v-else-if="node.data.isEmpty" class="flex align-items-center">
              <span>无数据</span>
              <ElLink type="primary" @click.stop="handleReload(node)">重新加载</ElLink>
            </div>
            <VIcon v-else class="tree-item-icon mr-2" size="18">table</VIcon>
            <span :class="[{ 'color-disable': data.disabled }, 'table-label']" :title="data.name">{{ data.name }}</span>
            <VIcon size="16" class="btn-menu" @click="openView(node.data, node.data.isLeaf)">copy</VIcon>
          </span>
        </VirtualTree>
      </div>
    </div>
    <connectionPreview ref="connectionView"></connectionPreview>
    <TablePreview ref="tablePreview"></TablePreview>
  </div>
</template>

<script>
import { debounce } from 'lodash'

import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { VirtualTree } from '@tap/component'
import connectionPreview from './connectionPreview'
import TablePreview from './TablePreview'
import NodeIcon from '@tap/dag/src/components/NodeIcon'
import { makeDragNodeImage } from '../../shared'

export default {
  name: 'Source',

  props: {
    dragState: Object
  },

  components: { NodeIcon, VirtualTree, connectionPreview, TablePreview },

  data() {
    return {
      keyword: '',
      treeData: [],
      expandedKeys: [],
      props: {
        isLeaf: 'isLeaf',
        disabled: 'disabled'
      },
      loading: false,
      treeTime: ''
    }
  },

  created() {
    this.reload()
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
          }
        }
      }
      const res = await connectionsApi.get({
        filter: JSON.stringify(filter)
      })

      return res.items.map(t => {
        const { id, status, loadFieldsStatus, loadCount, tableCount } = t
        const disabled = status !== 'ready'
        return {
          ...t,
          progress: Math.round((loadCount / tableCount) * 10000) / 100,
          children: [],
          isLeaf: false,
          disabled,
          type: 'connection'
        }
      })
    },

    async getTableList(id) {
      const res = await metadataInstancesApi.getSourceTablesValues(id)
      const data = res.map(t => {
        return {
          id: t.tableId,
          name: t.tableName,
          isLeaf: true,
          type: 'table'
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

    nodeClickHandler(data, node) {},

    checkHandler() {},

    handleDragStart(draggingNode, ev) {
      this.draggingNode = draggingNode
      this.draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        draggingNode.data.name
      )
      ev.dataTransfer.setDragImage(this.draggingNodeImage, 4, 4)
      ev.dataTransfer.effectAllowed = 'copy'
      this.dragState.isDragging = true
      this.dragState.draggingObjects = [draggingNode]
      this.dragState.form = 'SOURCE'
    },

    handleDragEnd() {
      this.$emit('node-drag-end')
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

    handleReload(node) {
      const parentId = node.parent.data?.id
    },
    //打开连接详情
    openView(row, isLeaf) {
      if (isLeaf) {
        let node = {
          id: row.id,
          category: 'storage',
          type: 'table'
        }
        this.$refs.tablePreview.open(node)
      } else {
        this.$refs.connectionView.open(row)
      }
    },

    reload() {
      this.loading = true
      this.treeTime = new Date() + ''
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
