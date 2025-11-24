<script lang="ts" setup>
import { fetchConnections } from '@tap/api/src/core/connections'
import { fetchMetadataInstances } from '@tap/api/src/core/metadata-instances'
import { mouseDrag as vDrag } from '@tap/component/src/directives/mousedrag'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { escapeRegExp } from 'lodash-es'
import { computed, nextTick, reactive, ref, shallowRef } from 'vue'
import { useDnD } from '../composables/useDnD'
import { useDataflowStore } from '../stores/dataflow.store'
import BaseNode from './BaseNode.vue'
import ConnectionType from './ConnectionType.vue'
import NodeIcon from './NodeIcon.vue'
import type { ScrollbarDirection } from 'element-plus'

const emit = defineEmits(['move-node', 'drop-node'])

const dataflowStore = useDataflowStore()
const {
  dragNode,
  dragStarting,
  onDragStart,
  onProcessorDragStart,
  onDragMove,
  onDragStop,
  onDrop,
} = useDnD(emit)

const pageSize = 20

const connectionQuery = ref('')
const connections = ref([])
const connectionsLoading = ref(false)
const connectionsCurrentPage = ref(1)
const connectionsTotal = ref(0)
const currentConnectionId = ref('')
const currentConnection = shallowRef(null)
const tableState = reactive({
  query: '',
  currentPage: 1,
  pageSize: 20,
  total: 0,
  items: [],
  loading: false,
})
const tables = ref([])

const connectionsTotalPage = computed(() =>
  Math.ceil(connectionsTotal.value / pageSize),
)

const tableTotalPage = computed(() =>
  Math.ceil(tableState.total / tableState.pageSize),
)

const getDragDom = async () => {
  await nextTick()
  return document.querySelector('#dragNode')
}

const handleSelectConnection = (item) => {
  currentConnectionId.value = item.id
  currentConnection.value = item
  runFetchTables()
}

const handleFetchConnections = async () => {
  connectionsLoading.value = true
  const params = {
    page: connectionsCurrentPage.value,
    size: pageSize,
    order: ['status DESC', 'name ASC'],
    where: {
      createType: {
        $ne: 'System',
      },
    },
  }
  const query = escapeRegExp(connectionQuery.value.trim())

  if (query) {
    params.where.name = { like: query, options: 'i' }
  }

  const data = await fetchConnections(params).finally(() => {
    connectionsLoading.value = false
  })

  connectionsTotal.value = data.total

  return data.items.map((item: any) => {
    item.databaseType = item.database_type
    if (item.connectionString) {
      item.connectionUrl = item.connectionString
      return item
    }

    let connectionUrl = ''
    if (item.config) {
      if (item.config.uri) {
        connectionUrl = item.config.uri
      } else {
        const { host, port, database, schema } = item.config
        connectionUrl = host
          ? `${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}${schema ? `/${schema}` : ''}`
          : ''
      }
    }

    item.connectionUrl = connectionUrl
    return item
  })
}

const runFetchConnections = async () => {
  connectionsCurrentPage.value = 1
  const items = await handleFetchConnections()
  connections.value = items
}

const runFetchMoreConnections = async (direction: ScrollbarDirection) => {
  if (
    direction !== 'bottom' ||
    connectionsCurrentPage.value >= connectionsTotalPage.value
  )
    return

  connectionsCurrentPage.value++
  const items = await handleFetchConnections()
  connections.value.push(...items)
}

const handleFetchTables = async () => {
  if (!currentConnectionId.value) return

  const params = {
    page: tableState.currentPage,
    size: tableState.pageSize,
    where: {
      meta_type: {
        in: ['collection', 'table', 'view'],
      },
      is_deleted: false,
      sourceType: 'SOURCE',
      'source.id': currentConnectionId.value,
      taskId: dataflowStore.dataflow.id,
      original_name: {
        neq: '',
      },
    },
    fields: {
      id: true,
      original_name: true,
    },
    order: ['original_name ASC'],
  }
  const txt = escapeRegExp(tableState.query)

  if (txt) {
    params.where.original_name = { like: txt, options: 'i' }
  }

  tableState.loading = true

  const data = await fetchMetadataInstances(params).finally(() => {
    tableState.loading = false
  })

  tableState.total = data.total

  return data.items.map((tb) => ({
    id: tb.id,
    name: tb.original_name,
    comment: tb.comment,
  }))
}

const runFetchTables = async () => {
  tableState.currentPage = 1
  const items = await handleFetchTables()
  tables.value = items
}

const runFetchMoreTables = async (direction: ScrollbarDirection) => {
  if (direction !== 'bottom' || tableState.currentPage >= tableTotalPage.value)
    return

  tableState.currentPage++
  const items = await handleFetchTables()
  tables.value.push(...items)
}

runFetchConnections().then(() => {
  if (connections.value.length) {
    handleSelectConnection(connections.value[0])
  }
})

const onTableDragStart = (item) => {
  onDragStart(currentConnection.value, item.name)
}
</script>

<template>
  <div
    class="nodes-panel position-absolute start-3 rounded-2xl bg-card shadow-canvas z-10 flex flex-column"
  >
    <div class="flex-1 min-h-0 flex flex-column">
      <div class="flex align-center p-3">
        <el-icon class="mr-2"><i-lucide-database /></el-icon>
        <span
          class="flex-1 user-select-none text-truncate flex align-center fw-sub"
        >
          {{ $t('packages_dag_dag_connection') }}
        </span>

        <el-button text size="small" @click.stop="">
          <template #icon>
            <VIcon size="18">search-outline</VIcon>
          </template>
        </el-button>

        <el-button text size="small" class="ml-1" @mousedown.stop>
          <template #icon>
            <VIcon size="20">add-outline</VIcon>
          </template>
        </el-button>
      </div>
      <el-scrollbar
        class="flex-1 min-h-0"
        @end-reached="runFetchMoreConnections"
      >
        <div class="p-1">
          <div
            v-for="item in connections"
            :key="item.id"
            v-drag="{
              item,
              container: '[data-id=\'flow-container\']',
              getDragDom,
              onStart: onDragStart,
              onMove: onDragMove,
              onDrop,
              onStop: onDragStop,
            }"
            class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg grabbable user-select-none"
            :class="{
              'is-active': currentConnectionId === item.id,
            }"
            @click="handleSelectConnection(item)"
          >
            <NodeIcon
              class="flex-shrink-0"
              :size="20"
              :node="item"
              draggable="false"
            />
            <OverflowTooltip
              class="text-truncate"
              placement="right"
              :text="item.name"
              :show-after="400"
            />
            <ConnectionType :type="item.connection_type" />
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-divider class="m-0" />
    <div class="flex-1 min-h-0 flex flex-column">
      <div class="flex align-center p-3">
        <el-icon class="mr-2"><i-lucide-table /></el-icon>
        <span
          class="flex-1 user-select-none text-truncate flex align-center fw-sub"
        >
          <!--表-->
          {{ $t('packages_dag_dag_table') }}
        </span>
        <el-button id="table-search-btn" text size="small">
          <template #icon>
            <VIcon size="18">search-outline</VIcon>
          </template>
        </el-button>

        <ElTooltip
          :content="$t('packages_dag_dag_create_table_as_node')"
          placement="top"
        >
          <el-button text size="small" @mousedown.stop>
            <template #icon>
              <VIcon size="20">add-outline</VIcon>
            </template>
          </el-button>
        </ElTooltip>
      </div>
      <el-scrollbar class="flex-1 min-h-0" @end-reached="runFetchMoreTables">
        <div class="p-1">
          <div
            v-for="item in tables"
            :key="item.id"
            v-drag="{
              item,
              container: '[data-id=\'flow-container\']',
              getDragDom,
              onStart: onTableDragStart,
              onMove: onDragMove,
              onDrop,
              onStop: onDragStop,
            }"
            class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg grabbable user-select-none"
          >
            <el-icon :size="16"><i-lucide-table /></el-icon>
            <OverflowTooltip
              class="text-truncate"
              :text="item.name"
              placement="right"
              :show-after="400"
            >
              <span>
                <span>{{ item.name }}</span>
                <span v-if="item.comment" class="font-color-sslight">{{
                  `(${item.comment})`
                }}</span>
              </span>
            </OverflowTooltip>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-divider class="m-0" />
    <div class="processor-container min-h-0 flex flex-column">
      <div class="flex align-center p-3">
        <el-icon class="mr-2"><i-lucide-workflow /></el-icon>
        <span class="flex-1 user-select-none text-start fw-sub">
          <!--处理节点-->
          {{ $t('public_node_processor') }}
        </span>
      </div>
      <el-scrollbar class="flex-1 min-h-0">
        <div class="p-1">
          <div
            v-for="(item, ni) in dataflowStore.processorNodeTypes"
            :key="ni"
            v-drag="{
              item,
              container: '[data-id=\'flow-container\']',
              getDragDom,
              onStart: onProcessorDragStart,
              onMove: onDragMove,
              onDrop,
              onStop: onDragStop,
            }"
            class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg grabbable user-select-none"
          >
            <NodeIcon
              :size="20"
              class="flex-shrink-0"
              :node="item"
              draggable="false"
            />
            <OverflowTooltip
              :text="item.name"
              popper-class="df-node-text-tooltip"
              placement="top"
              :open-delay="400"
            />
            <VIcon v-if="item.beta" class="ml-1" size="32">beta</VIcon>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- S 节点拖拽元素 -->
    <BaseNode
      v-if="dragStarting"
      id="dragNode"
      class="pe-none is-hover"
      style="opacity: 0"
      :node="dragNode"
    />
    <!-- E 节点拖拽元素 -->
  </div>
</template>

<style lang="scss" scoped>
.nodes-panel {
  top: 72px;
  bottom: 12px;
  width: 260px;
}

.connection-item {
  user-select: none;
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  &.is-active {
    background-color: var(--primary-hover-light);
  }
}

.processor-container {
  max-height: 38.2%;
}
</style>
