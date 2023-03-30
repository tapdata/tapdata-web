<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_sources') }}</span>
      <div class="flex-grow-1"></div>
      <IconButton @click="handleAdd">add</IconButton>
      <IconButton :class="{ active: enableSearch }" @click="toggleEnableSearch">search-outline</IconButton>
      <!--<IconButton>more</IconButton>-->
    </div>
    <div class="flex-1 min-h-0 flex flex-column">
      <div v-if="enableSearch" class="px-2 pt-2">
        <ElInput
          v-model="search"
          size="mini"
          clearable
          @keydown.native.stop
          @keyup.native.stop
          @click.native.stop
          @input="handleSearch"
        >
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
          </template>
        </ElInput>
      </div>
      <div class="flex-fill min-h-0" v-loading="loading || searchIng">
        <VirtualTree
          key="searchTree"
          v-if="search || searchIng"
          class="ldp-tree h-100"
          ref="tree"
          node-key="id"
          highlight-current
          :props="props"
          draggable
          height="100%"
          wrapper-class-name="p-2"
          :default-expanded-keys="searchExpandedKeys"
          :data="filterTreeData"
          :expand-on-click-node="false"
          :allow-drag="node => node.data.isObject"
          :allow-drop="() => false"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
        >
          <span
            class="custom-tree-node flex align-items-center"
            :class="{ grabbable: data.isObject, 'opacity-50': data.disabled }"
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
            <VIcon v-else class="tree-item-icon mr-2" size="18">table</VIcon>
            <span class="table-label" :title="data.name"
              >{{ data.name }}
              <ElTag v-if="data.disabled" type="info" size="mini">{{ $t('public_status_invalid') }}</ElTag>
            </span>
            <ElTag v-if="data.disabled" size="mini">{{ $t('public_status_invalid') }}</ElTag>
            <IconButton class="btn-menu" sm @click="$emit('preview', data)"> view-details </IconButton>
          </span>
        </VirtualTree>
        <VirtualTree
          key="tree"
          v-else
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
          :default-expanded-keys="expandedKeys"
          :filter-node-method="filterNode"
          :render-after-expand="false"
          :expand-on-click-node="false"
          :allow-drag="node => node.data.isObject"
          :allow-drop="() => false"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
        >
          <span
            class="custom-tree-node flex align-items-center"
            :class="{ grabbable: data.isObject, 'opacity-50': data.disabled }"
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
            <span class="table-label" :title="data.name">
              {{ data.name }}
              <ElTag v-if="data.disabled" type="info" size="mini">{{ $t('public_status_invalid') }}</ElTag>
            </span>
            <IconButton class="btn-menu" sm @click="$emit('preview', data)"> view-details </IconButton>
          </span>
        </VirtualTree>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'

import { connectionsApi, metadataInstancesApi, ldpApi } from '@tap/api'
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
      loading: false,
      searchExpandedKeys: [],
      searchIng: false,
      search: '',
      enableSearch: false,
      filterTreeData: []
    }
  },

  created() {
    this.debouncedSearch = debounce(async search => {
      this.searchIng = true
      const result = await ldpApi.searchSources({
        key: search,
        connectionType: ['source', 'source_and_target'].join(',')
      })
      this.searchIng = false
      const tableMap = {}
      const connectionList = []
      let firstExpand

      result.forEach(item => {
        const { conId } = item
        let children = tableMap[conId]

        if (item.type === 'metadata') {
          children = children || []
          children.push({
            id: item.dto.id,
            name: item.dto.name,
            connectionId: conId,
            isLeaf: true,
            isObject: true,
            type: 'table',
            LDP_TYPE: 'table'
          })
          tableMap[conId] = children
        } else if (item.type === 'connection') {
          if (!children) tableMap[conId] = []
        }
      })

      Object.keys(tableMap).forEach(conId => {
        const connection = this.connectionMap[conId]
        if (connection) {
          let children = tableMap[conId]

          if (!firstExpand && children.length) {
            firstExpand = conId
          }

          connectionList.push({
            ...connection,
            children
          })
        }
      })
      this.filterTreeData = connectionList
      this.searchExpandedKeys = firstExpand ? [firstExpand] : []
      console.log('result', result) // eslint-disable-line
    }, 300)
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
      this.connectionMap = {}
      return res.items.map(t => {
        const { status, loadCount = 0, tableCount = 0 } = t
        const disabled = status !== 'ready'
        const conn = {
          ...t,
          progress: !tableCount ? 0 : Math.round((loadCount / tableCount) * 10000) / 100,
          children: [],
          isLeaf: false,
          disabled,
          type: 'connection',
          LDP_TYPE: 'connection'
        }
        this.connectionMap[t.id] = conn
        return conn
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

    /*handleSearch: debounce(function (val) {
      this.$refs.tree.filter(val)
    }, 300),*/

    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

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
    },

    toggleEnableSearch() {
      if (this.enableSearch) {
        this.search = ''
        this.enableSearch = false
      } else {
        this.enableSearch = true
      }
    },

    handleSearch(val) {
      if (!val) {
        this.searchIng = false
        this.debouncedSearch.cancel()
        return
      }
      this.searchIng = true
      this.debouncedSearch(val)
    },

    flattenTree(data) {
      return data.reduce((map, item) => {
        if (item.LDP_TYPE === 'folder') {
          map[item.id] = { ...item, children: [] }

          if (item.children.length) {
            Object.assign(map, this.flattenTree(item.children))
          }
        }
        return map
      }, {})
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
