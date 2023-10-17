<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title list__title__source flex align-center px-4">
      <span class="fs-6">{{
        $t('packages_business_data_console_sources')
      }}</span>
      <div class="flex-grow-1"></div>
      <IconButton
        :disabled="highlightBoard"
        id="btn-add-source"
        @click="handleAdd"
        >add</IconButton
      >
      <IconButton
        :disabled="highlightBoard"
        :class="{ active: enableSearch }"
        @click="toggleEnableSearch"
        >search-outline</IconButton
      >
      <!--<IconButton>more</IconButton>-->
    </div>
    <div class="flex-1 min-h-0 flex flex-column">
      <div v-if="enableSearch" class="px-2 pt-2">
        <ElInput
          ref="search"
          v-model:value="search"
          size="mini"
          clearable
          autofocus
          @keydown.stop
          @keyup.stop
          @click.stop
          @input="handleSearch"
        >
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
          </template>
        </ElInput>
      </div>
      <div
        v-if="!showParentLineage"
        class="flex-fill min-h-0"
        v-loading="loading || searchIng"
      >
        <VirtualTree
          v-if="showSearch"
          class="ldp-tree h-100"
          ref="tree"
          :indent="0"
          :keeps="60"
          node-key="id"
          :props="props"
          draggable
          height="100%"
          wrapper-class-name="p-2"
          :default-expanded-keys="searchExpandedKeys"
          :data="filterTreeData"
          :render-content="renderContent"
          :expand-on-click-node="false"
          :allow-drag="(node) => node.data.isObject"
          :allow-drop="() => false"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
          @node-expand="handleNodeExpand"
          @handle-scroll="handleScroll"
        />
        <template v-else>
          <VirtualTree
            key="tree"
            v-show="treeData.length > 0"
            class="ldp-tree h-100"
            empty-text=""
            ref="tree"
            :indent="0"
            :keeps="60"
            node-key="id"
            :props="props"
            draggable
            height="100%"
            wrapper-class-name="p-2"
            :default-expanded-keys="expandedKeys"
            :data="treeData"
            :render-content="renderDefaultContent"
            :filter-node-method="filterNode"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drag="(node) => node.data.isObject"
            :allow-drop="() => false"
            @node-expand="handleNodeExpand"
            @node-collapse="handeNodeCollapse"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @handle-scroll="handleScroll"
          >
            <template v-slot="{ node, data }">
              <span
                class="custom-tree-node flex align-items-center position-relative"
                :class="{
                  grabbable: data.isObject,
                  'opacity-50': data.disabled,
                }"
                @click="$emit('preview', data, node.parent.data)"
              >
                <VIcon
                  v-if="node.data.loadFieldsStatus === 'loading'"
                  class="v-icon animation-rotate"
                  size="14"
                  color="rgb(61, 156, 64)"
                  >loading-circle</VIcon
                >
                <NodeIcon
                  v-if="!node.data.isLeaf"
                  :node="node.data"
                  :size="18"
                  class="tree-item-icon mr-2"
                />
                <div
                  v-else-if="node.data.isEmpty"
                  class="flex align-items-center"
                >
                  <span class="mr-1">{{ $t('public_data_no_data') }}</span>
                  <StageButton :connection-id="getConnectionId(node)">
                  </StageButton>
                </div>
                <VIcon v-else class="tree-item-icon mr-2" size="18"
                  >table</VIcon
                >
                <span class="table-label" :title="data.name">
                  {{ data.name }}
                  <span v-if="data.comment" class="font-color-sslight">{{
                    `(${data.comment})`
                  }}</span>
                  <ElTag v-if="data.disabled" type="info" size="mini">{{
                    $t('public_status_invalid')
                  }}</ElTag>
                </span>
              </span>
            </template>
          </VirtualTree>
          <div
            v-if="!treeData.length"
            class="h-100 flex align-center justify-center"
          >
            <VEmpty
              :description="$t('packages_ldp_source_empty_text')"
            ></VEmpty>
          </div>
        </template>
      </div>
      <div v-else class="flex-fill min-h-0" v-loading="loading || searchIng">
        <VirtualTree
          key="searchTree"
          class="ldp-tree h-100"
          ref="tree"
          node-key="id"
          :props="props"
          :keeps="60"
          draggable
          height="100%"
          wrapper-class-name="p-2"
          :default-expanded-keys="searchExpandedKeys"
          :data="filterTreeData"
          :render-content="renderContent"
          :expand-on-click-node="false"
          :allow-drag="(node) => node.data.isObject"
          :allow-drop="() => false"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
          @node-expand="handleNodeExpand"
          @handle-scroll="handleScroll"
        >
        </VirtualTree>
      </div>
    </div>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import { debounce } from 'lodash'

import {
  connectionsApi,
  metadataInstancesApi,
  ldpApi,
  CancelToken,
} from '@tap/api'
import { VEmpty, VirtualTree, IconButton } from '@tap/component'
import NodeIcon from '@tap/dag/src/components/NodeIcon'
import { makeDragNodeImage, StageButton, DatabaseIcon } from '@tap/business'
import commonMix from './mixins/common'

export default {
  name: 'Source',
  props: {
    dragState: Object,
    eventDriver: Object,
    fdmAndMdmId: Array,
    showParentLineage: Boolean,
  },
  components: { NodeIcon, VirtualTree, StageButton, IconButton, VEmpty },
  mixins: [commonMix],
  data() {
    return {
      keyword: '',
      treeData: [],
      expandedKeys: [],
      props: {
        isLeaf: 'isLeaf',
        disabled: 'disabled',
      },
      loading: false,
      searchExpandedKeys: [],
      searchIng: false,
      search: '',
      enableSearch: false,
      filterTreeData: [],
    }
  },
  computed: {
    showSearch() {
      return this.search || this.searchIng
    },
  },
  created() {
    this.debouncedSearch = debounce(async (search) => {
      this.cancelSource?.cancel()
      this.cancelSource = CancelToken.source()
      this.searchIng = true
      const result = await ldpApi.searchSources(
        {
          key: search,
          connectionType: ['source', 'source_and_target'].join(','),
        },
        {
          cancelToken: this.cancelSource.token,
        }
      )
      this.searchIng = false
      const tableMap = {}
      const connectionList = []
      let firstExpand

      result.forEach((item) => {
        const { conId } = item
        let children = tableMap[conId]

        if (this.fdmAndMdmId.includes(conId)) return

        if (item.type === 'metadata') {
          children = children || []
          children.push({
            id: item.dto.id,
            name: item.dto.name,
            connectionId: conId,
            isLeaf: true,
            isObject: true,
            type: 'table',
            LDP_TYPE: 'table',
          })
          tableMap[conId] = children
        } else if (item.type === 'connection') {
          if (!children) tableMap[conId] = []
        }
      })

      Object.keys(tableMap).forEach((conId) => {
        const connection = this.connectionMap[conId]
        if (connection) {
          let children = tableMap[conId]

          if (!firstExpand && children.length) {
            firstExpand = conId
          }

          connectionList.push({
            ...connection,
            children,
          })
        }
      })
      this.filterTreeData = connectionList
      this.searchExpandedKeys = firstExpand ? [firstExpand] : []
    }, 300)

    this.initTree()
  },
  beforeUnmount() {
    clearTimeout(this.treeTimer)
    this.unwatchFdmAndMdm?.()
  },
  methods: {
    renderContent(h, { node, data }) {
      let className = ['custom-tree-node']

      if (data.isObject) {
        className.push('grabbable')
      }

      if (data.disabled) {
        className.push('opacity-50')
      }

      if (!data.isObject && !data.children?.length) node.isLeaf = false

      return (
        <div
          class={className}
          onClick={() => {
            $emit(this, 'preview', data, node.parent.data)
          }}
        >
          <div
            id={
              data.isObject
                ? `ldp_source_table_${data.connectionId}_${data.name}`
                : `connection_${data.id}`
            }
            class="inline-flex align-items-center overflow-hidden"
          >
            {!data.isObject ? (
              <NodeIcon node={data} size={18} class="tree-item-icon mr-2" />
            ) : (
              <VIcon class="tree-item-icon mr-2" size="18">
                table
              </VIcon>
            )}
            <span class="table-label" title={data.name}>
              {data.name}
            </span>
            {data.disabled && (
              <ElTag type="info" size="mini">
                {this.$t('public_status_invalid')}
              </ElTag>
            )}
            <IconButton
              class="btn-menu"
              sm
              onClick={() => {
                $emit(this, 'preview', data, node.parent.data)
              }}
            >
              {' '}
              view-details{' '}
            </IconButton>
          </div>
        </div>
      )
    },

    renderDefaultContent(h, { node, data }) {
      const schemaLoading = data.loadFieldsStatus === 'loading'
      // 引导时特殊处理，添加的连接等加载完schema后方可展开
      node.isLeaf =
        data.LDP_TYPE !== 'connection' ||
        (this.startingTour && schemaLoading && !data.children?.length)

      return (
        <div
          staticClass="custom-tree-node flex align-items-center position-relative"
          class={{ grabbable: data.isObject, 'opacity-50': data.disabled }}
          onClick={() => {
            $emit(this, 'preview', data, node.parent.data)
          }}
        >
          {schemaLoading && (
            <VIcon
              class="v-icon animation-rotate"
              size="14"
              color="rgb(61, 156, 64)"
            >
              loading-circle
            </VIcon>
          )}
          {!data.isObject && !data.isEmpty ? (
            <NodeIcon node={node.data} size={18} class="tree-item-icon mr-2" />
          ) : data.isEmpty ? (
            <div class="flex align-items-center">
              <span class="mr-1">{this.$t('public_data_no_data')}</span>
              <StageButton connection-id={this.getConnectionId(node)}>
                {' '}
              </StageButton>
            </div>
          ) : (
            <VIcon class="tree-item-icon mr-2" size="18">
              table
            </VIcon>
          )}

          <span class="table-label" title={data.name}>
            {data.name}
            {data.comment && (
              <span class="font-color-sslight">{`(${data.comment})`}</span>
            )}
            {data.disabled && (
              <ElTag type="info" size="mini" class="ml-2">
                {this.$t('public_status_invalid')}
              </ElTag>
            )}
          </span>
        </div>
      )
    },

    handleAdd() {
      $emit(this, 'create-connection', 'source')
    },

    async initTree() {
      clearTimeout(this.treeTimer)
      this.treeData = await this.getConnectionList()

      if (this.startingTour && this.newConnectionId) {
        const connection = this.connectionMap[this.newConnectionId]
        if (
          connection &&
          connection.status !== 'testing' &&
          connection.loadFieldsStatus !== 'loading' &&
          !connection.children.length
        ) {
          const node = this.$refs.tree.getNode(this.newConnectionId)
          this.handleNodeExpand(connection, node)
        }
      }

      this.treeTimer = setTimeout(() => {
        this.initTree()
      }, 5000)
    },

    async getConnectionList() {
      let filter = {
        limit: 999,
        order: 'createTime DESC',
        where: {
          connection_type: {
            in: ['source_and_target', 'source'],
          },
          createType: {
            $ne: 'System',
          },
        },
      }
      const res = await connectionsApi.get({
        filter: JSON.stringify(filter),
      })
      // this.connectionMap = {}
      const items = []
      const map = {}
      const _map = this.connectionMap || {}

      this.watchFdmAndMdm()
      res.items.forEach((t) => {
        if (this.fdmAndMdmId.includes(t.id)) return

        const { status, loadCount = 0, tableCount = 0 } = t
        const disabled = status !== 'ready'
        const connection = this.mapConnection(t)
        map[t.id] = connection

        if (_map[t.id]) connection.children = [..._map[t.id].children]

        items.push(connection)
      })
      this.connectionMap = map
      return items
    },

    mapConnection(connection) {
      const { status, loadCount = 0, tableCount = 0 } = connection
      const disabled = status !== 'ready'
      return {
        ...connection,
        progress: !tableCount
          ? 0
          : Math.round((loadCount / tableCount) * 10000) / 100,
        children: [],
        isLeaf: false,
        disabled,
        type: 'connection',
        LDP_TYPE: 'connection',
      }
    },

    async getTableList(id) {
      const res = await metadataInstancesApi.getTablesValue({
        connectionId: id,
      })
      const data = res.map((t) => {
        return {
          id: t.tableId,
          name: t.tableName,
          comment: t.tableComment,
          connectionId: id,
          isLeaf: true,
          isObject: true,
          type: 'table',
          LDP_TYPE: 'table',
          SWIM_TYPE: 'source',
        }
      })
      return data.length
        ? data
        : [
            {
              id: '',
              name: '',
              comment: '',
              isLeaf: true,
              isEmpty: true,
            },
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
      $emit(this, 'node-drag-end', ev)
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
      data.loadFieldsStatus = 'loading' // 显示加载schema的状态
      const connection = this.mapConnection(data)
      this.newConnectionId = data.id
      this.connectionMap[data.id] = connection
      const { root = {} } = this.$refs.tree
      const firstChildKey = root.childNodes[0]?.key

      if (this.showSearch && !connection.name.includes(this.search)) return

      if (firstChildKey) {
        this.$refs.tree.insertBefore(connection, firstChildKey)
      } else {
        this.$refs.tree.append(connection, 0)
      }
    },

    async handleNodeExpand(data, node) {
      this.setExpand(data.id, true)

      if (data.children.some((child) => !child.isEmpty)) return

      node.loadTime = Date.now()
      node.loading = true
      const tableList = await this.getTableList(data.id)
      this.$refs.tree.updateKeyChildren(data.id, tableList)
      node.loading = false
    },

    watchFdmAndMdm() {
      // 用于监听FDM/MDM的设置变化,删除掉已经渲染的连接节点
      this.unwatchFdmAndMdm?.()
      this.unwatchFdmAndMdm = this.$watch('fdmAndMdmId', (val) => {
        this.$refs.tree.remove({
          id: val[0],
        })
        this.$refs.tree.remove({
          id: val[1],
        })
      })
    },

    handleFindTreeDom(val = {}) {
      const el = document.getElementById(
        `ldp_source_table_${val.connectionId}_${val.table}`
      )
      return el
    },

    handleScroll: debounce(function () {
      $emit(this, 'handle-connection')
    }, 200),

    async searchByKeywordList(val = []) {
      let searchExpandedKeys = []
      this.filterTreeData = val.map((t) => {
        searchExpandedKeys.push(t.connectionId)
        return {
          LDP_TYPE: 'connection',
          id: t.connectionId,
          name: t.connectionName,
          pdkHash: t.pdkHash,
          status: 'ready',
          isLeaf: false,
          level: 0,
          disabled: false,
          children: [
            {
              id: t.tableId,
              name: t.table,
              connectionId: t.connectionId,
              isLeaf: true,
              isObject: true,
              type: 'table',
              LDP_TYPE: 'table',
            },
          ],
        }
      })
      this.searchExpandedKeys = searchExpandedKeys
    },
  },
  emits: ['preview', 'create-connection', 'node-drag-end', 'handle-connection'],
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
