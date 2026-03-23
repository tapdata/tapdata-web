<script lang="ts" setup>
import { fetchConnections } from '@tap/api/src/core/connections'
import { fetchMetadataInstances } from '@tap/api/src/core/metadata-instances'
import { mouseDrag as vDrag } from '@tap/component/src/directives/mousedrag'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { useVueFlow } from '@vue-flow/core'
import { debounce, escapeRegExp } from 'lodash-es'
import { computed, inject, nextTick, reactive, ref, shallowRef } from 'vue'
import { useCreateTable } from '../composables/useCreateTable'
import { makeNode, makeProcessorNode, useDnD } from '../composables/useDnD'
import { useDataflowStore } from '../stores/dataflow.store'
import { useHistoryStore } from '../stores/history.store'
import BaseNode from './BaseNode.vue'
import ConnectionType from './ConnectionType.vue'
import NodeIcon from './NodeIcon.vue'
import type { ScrollbarDirection } from 'element-plus'

const emit = defineEmits(['move-node', 'drop-node'])

const dataflowStore = useDataflowStore()

const pageSize = 20

const dataflow = inject<any>('dataflow')
const isSyncTask = inject<any>('isSyncTask')
const onAddNode = inject<(node: any) => void>('onAddNode')
const onCreateConnection =
  inject<(connection: any) => void>('onCreateConnection')

const {
  dragNode,
  dragStarting,
  onDragStart,
  onProcessorDragStart,
  onDragMove,
  onDragStop,
  onDrop,
} = useDnD({ emit, onAddNode })

const showConnectionSearch = ref(false)
const connectionSearchRef = ref<InstanceType<
  typeof import('element-plus').ElInput
> | null>(null)
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
const showTableSearch = ref(false)
const tableSearchRef = ref<InstanceType<
  typeof import('element-plus').ElInput
> | null>(null)

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

const handleSelectConnection = (item: any) => {
  if (!isSyncTask.value) return
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

const toggleConnectionSearch = () => {
  showConnectionSearch.value = !showConnectionSearch.value
  if (showConnectionSearch.value) {
    nextTick(() => {
      connectionSearchRef.value?.focus()
    })
  } else {
    connectionQuery.value = ''
    runFetchConnections()
  }
}

const debouncedFetchConnections = debounce(() => {
  runFetchConnections()
}, 300)

const toggleTableSearch = () => {
  showTableSearch.value = !showTableSearch.value
  if (showTableSearch.value) {
    nextTick(() => {
      tableSearchRef.value?.focus()
    })
  } else {
    tableState.query = ''
    runFetchTables()
  }
}

const debouncedFetchTables = debounce(() => {
  runFetchTables()
}, 300)

runFetchConnections().then(() => {
  if (connections.value.length) {
    handleSelectConnection(connections.value[0])
  }
})

useI18n()
const { findNode, getOutgoers, screenToFlowCoordinate, viewportRef } =
  useVueFlow()

const historyStore = useHistoryStore()

const X_OFFSET = 100
const Y_OFFSET = 40

const { promptCreateTable } = useCreateTable()

const handleAddTable = async () => {
  if (!currentConnection.value) return
  const tableName = await promptCreateTable()
  if (tableName) {
    const node = makeNode(currentConnection.value, tableName)

    // 找到第一个源节点（type=table 且没有输入）
    const firstSource = dataflowStore.dag.nodes.find(
      (n) => n.type === 'table' && (!n.$inputs || n.$inputs.length === 0),
    )

    if (firstSource) {
      // 获取该分支上所有后续节点（包括源节点自身）
      const branchNodes = dataflowStore.getAfterNodesInSameBranch(
        firstSource.id,
      )

      // 找到最右边的节点位置
      let maxX = -Infinity
      let maxY = 0
      let maxNodeWidth = 0

      for (const n of branchNodes) {
        const canvasNode = findNode(n.id)
        const x = n.attrs?.position?.[0] ?? 0
        if (x > maxX) {
          maxX = x
          maxY = n.attrs?.position?.[1] ?? 0
          maxNodeWidth = canvasNode?.dimensions?.width ?? 200
        }
      }

      // 新节点放在最右边节点的右侧
      node.attrs.position = [maxX + maxNodeWidth + X_OFFSET, maxY]
    }

    onAddNode?.(node)
  }
}

/**
 * 获取画布视口中心的 flow 坐标
 */
const getViewportCenterPosition = (): [number, number] => {
  const rect = viewportRef.value?.getBoundingClientRect()
  const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
  const pos = screenToFlowCoordinate({ x: centerX, y: centerY })
  return [pos.x, pos.y]
}

/**
 * 在给定位置附近找到一个不与现有节点重叠的位置
 */
const NODE_WIDTH = 220
const NODE_HEIGHT = 76

const findNonOverlappingPosition = (
  startPos: [number, number],
): [number, number] => {
  const nodes = dataflowStore.dag.nodes
  let [x, y] = startPos

  const hasCollision = (px: number, py: number) =>
    nodes.some((n) => {
      const [nx, ny] = n.attrs?.position ?? [0, 0]
      return (
        px < nx + NODE_WIDTH &&
        px + NODE_WIDTH > nx &&
        py < ny + NODE_HEIGHT &&
        py + NODE_HEIGHT > ny
      )
    })

  let attempts = 0
  while (hasCollision(x, y) && attempts < 50) {
    y += Y_OFFSET
    attempts++
  }
  return [x, y]
}

/**
 * 判断 source 节点能否连接到 target 节点
 */
const canConnect = (sourceNode: any, targetNode: any): boolean => {
  // 先给新节点设置 __Ctor（连线校验需要）
  if (!targetNode.__Ctor) {
    const ins = dataflowStore.getResourceInsByNode(targetNode)
    if (ins) {
      Object.defineProperty(targetNode, '__Ctor', {
        value: ins,
        enumerable: false,
      })
    }
  }
  if (!sourceNode.__Ctor || !targetNode.__Ctor) return false

  return (
    dataflowStore.checkAsSource(sourceNode) &&
    dataflowStore.checkSourceMaxOutputs(sourceNode) &&
    dataflowStore.checkAsTarget(targetNode) &&
    dataflowStore.checkAllowTargetOrSource(sourceNode, targetNode)
  )
}

/**
 * 计算放在最右侧节点右边的位置
 */
const getRightmostPosition = (): [number, number] => {
  const allNodes = dataflowStore.dag.nodes
  let maxX = -Infinity
  let maxY = 0
  let maxNodeWidth = 0

  for (const n of allNodes) {
    const cn = findNode(n.id)
    const x = n.attrs?.position?.[0] ?? 0
    if (x > maxX) {
      maxX = x
      maxY = n.attrs?.position?.[1] ?? 0
      maxNodeWidth = cn?.dimensions?.width ?? NODE_WIDTH
    }
  }

  return [maxX + maxNodeWidth + X_OFFSET, maxY]
}

/**
 * 双击添加节点到画布，自动连线
 */
const handleDblClickAddNode = (node: any) => {
  if (dataflowStore.stateIsReadonly) return

  historyStore.startRecordingUndo()

  const allNodes = dataflowStore.dag.nodes

  if (!allNodes.length) {
    // 画布为空，放到视口中心
    node.attrs.position = getViewportCenterPosition()
    onAddNode?.(node)
  } else {
    // 找到一个没有输出的节点作为上游
    const source = allNodes.find((n) => !n.$outputs || n.$outputs.length === 0)

    if (source && canConnect(source, node)) {
      // 能连线：放在 source 节点右侧，自动连线
      const canvasNode = findNode(source.id)
      const outgoers = getOutgoers(source.id).sort(
        (a, b) => a.position.y - b.position.y,
      )
      const lastOutgoer = outgoers.at(-1)
      const position = lastOutgoer
        ? [
            lastOutgoer.position.x,
            lastOutgoer.position.y + lastOutgoer.dimensions.height + Y_OFFSET,
          ]
        : [
            canvasNode!.position.x + canvasNode!.dimensions.width + X_OFFSET,
            canvasNode!.position.y,
          ]

      node.attrs.position = findNonOverlappingPosition(
        position as [number, number],
      )
      onAddNode?.(node)
      onCreateConnection?.({ source: source.id, target: node.id })
    } else {
      // 不能连线或没有可用上游：放到最右侧节点右边
      node.attrs.position = findNonOverlappingPosition(getRightmostPosition())
      onAddNode?.(node)
    }
  }

  historyStore.stopRecordingUndo()
}

const handleDblClickConnection = (item: any) => {
  const node = makeNode(
    item,
    dataflow.value.syncType === 'sync' ? '' : undefined,
  )
  handleDblClickAddNode(node)
}

const handleDblClickTable = (item: any) => {
  const node = makeNode(currentConnection.value!, item.name)
  handleDblClickAddNode(node)
}

const handleDblClickProcessor = (item: any) => {
  handleDblClickAddNode(makeProcessorNode(item))
}

const onConnectionDragStart = (item) => {
  onDragStart(item, dataflow.value.syncType === 'sync' ? '' : undefined)
}

const onTableDragStart = (item) => {
  onDragStart(currentConnection.value, item.name)
}
</script>

<template>
  <div
    class="nodes-panel position-absolute start-3 rounded-2xl bg-card shadow-canvas z-10 flex flex-column"
  >
    <div class="flex-1 min-h-0 flex flex-column">
      <div class="flex align-center p-3 pb-1">
        <el-icon class="mr-2"><i-lucide-database /></el-icon>
        <span
          class="flex-1 user-select-none text-truncate flex align-center fw-sub"
        >
          {{ $t('packages_dag_dag_connection') }}
        </span>

        <el-button
          :type="showConnectionSearch ? 'primary' : undefined"
          :bg="showConnectionSearch"
          text
          size="small"
          @click.stop="toggleConnectionSearch"
        >
          <template #icon>
            <i-lucide-search />
          </template>
        </el-button>
      </div>
      <div v-if="showConnectionSearch" class="px-3 py-1">
        <el-input
          ref="connectionSearchRef"
          v-model="connectionQuery"
          clearable
          :placeholder="$t('packages_dag_search_connection')"
          @input="debouncedFetchConnections"
          @clear="runFetchConnections()"
        >
          <template #prefix>
            <i-lucide-search class="font-color-light" />
          </template>
        </el-input>
      </div>
      <el-scrollbar
        class="flex-1 min-h-0"
        :distance="10"
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
              onStart: onConnectionDragStart,
              onMove: onDragMove,
              onDrop,
              onStop: onDragStop,
            }"
            class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg grabbable user-select-none"
            :class="{
              'is-active': currentConnectionId === item.id,
            }"
            @click="handleSelectConnection(item)"
            @dblclick="handleDblClickConnection(item)"
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
            <ConnectionType class="ml-auto" :type="item.connection_type" />
          </div>
        </div>
      </el-scrollbar>
    </div>
    <template v-if="isSyncTask">
      <el-divider class="m-0" />
      <div class="flex-1 min-h-0 flex flex-column">
        <div class="flex align-center p-3 pb-1" style="--btn-space: 0">
          <el-icon class="mr-2"><i-lucide-table /></el-icon>
          <span
            class="flex-1 user-select-none text-truncate flex align-center fw-sub"
          >
            {{ $t('packages_dag_dag_table') }}
          </span>
          <el-button
            :type="showTableSearch ? 'primary' : undefined"
            :bg="showTableSearch"
            text
            size="small"
            @click.stop="toggleTableSearch"
          >
            <template #icon>
              <i-lucide-search />
            </template>
          </el-button>

          <ElTooltip
            :content="$t('packages_dag_dag_create_table_as_node')"
            placement="top"
            :enterable="false"
            :hide-after="0"
          >
            <el-button
              text
              size="small"
              @mousedown.stop
              @click.stop="handleAddTable"
            >
              <template #icon>
                <VIcon size="20">add-outline</VIcon>
              </template>
            </el-button>
          </ElTooltip>
        </div>
        <div v-if="showTableSearch" class="px-3 py-1">
          <el-input
            ref="tableSearchRef"
            v-model="tableState.query"
            clearable
            :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
            @input="debouncedFetchTables"
            @clear="runFetchTables()"
          >
            <template #prefix>
              <i-lucide-search class="font-color-light" />
            </template>
          </el-input>
        </div>
        <el-scrollbar
          class="flex-1 min-h-0"
          :distance="10"
          @end-reached="runFetchMoreTables"
        >
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
              @dblclick="handleDblClickTable(item)"
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
    </template>

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
            @dblclick="handleDblClickProcessor(item)"
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
            <!-- <VIcon v-if="item.beta" class="ml-1" size="32">beta</VIcon> -->
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
  top: 68px;
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
