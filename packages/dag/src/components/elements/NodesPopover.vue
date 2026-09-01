<script setup lang="ts">
import { getConnectionNoSchema } from '@tap/api/src/core/connections'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { useVueFlow } from '@vue-flow/core'
import { computed, inject, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useCreateTable } from '../../composables/useCreateTable'
import { makeNode, makeProcessorNode } from '../../composables/useDnD'
import { useFetchConnections } from '../../composables/useFetchConnections'
import { useNodeFocus } from '../../composables/useNodeFocus'
import { useDataflowStore } from '../../stores/dataflow.store'
import { useHistoryStore } from '../../stores/history.store'
import ConnectionType from '../ConnectionType.vue'
import NodeIcon from '../NodeIcon.vue'
import type { PopoverInstance, ScrollbarInstance } from 'element-plus'

interface Props {
  reference?: HTMLElement | null
  params?: any
}

const X_OFFSET = 100
const Y_OFFSET = 40

const props = defineProps<Props>()

const { findNode, getOutgoers, getIncomers } = useVueFlow()
const { focusNode } = useNodeFocus()

const { t } = useI18n()

const dataflowStore = useDataflowStore()
const historyStore = useHistoryStore()

// Inject tracking functions for history support
const dataflow = inject<Ref<any>>('dataflow')!
const onAddNode = inject<(node: any) => void>('onAddNode')
const canAddNode = inject<(node: any) => boolean>('canAddNode')
const onCreateConnection =
  inject<(connection: any) => void>('onCreateConnection')
const onDeleteConnection =
  inject<(connection: any) => void>('onDeleteConnection')
const onMoveNodePosition =
  inject<(id: string, newPosition: [number, number]) => void>(
    'onMoveNodePosition',
  )

const show = defineModel<boolean>()
const popoverRef = ref<PopoverInstance | null>(null)
const activeTab = ref(0)
const previousTab = ref(0) // 记录上一个 tab
const processorQuery = ref('')
const connectionScroller = ref<ScrollbarInstance>()

const filteredProcessorNodeTypes = computed(() => {
  const query = processorQuery.value.trim().toLowerCase()
  if (!query) return dataflowStore.processorNodeTypes
  return dataflowStore.processorNodeTypes.filter((item: any) =>
    item.name?.toLowerCase().includes(query),
  )
})

const items = [
  {
    title: t('public_node_source'),
    type: 'source',
  },
  {
    title: t('public_node_processor'),
    type: 'source',
  },
  {
    title: t('public_node_target'),
    type: 'target',
  },
]

const {
  runFetchConnections,
  runFetchMoreConnections,
  connectionQuery,
  connections,
  handleSelectConnection,
  handleUnselectConnection,
  currentConnection,
  currentConnectionId,
  tables,
  tableState,
  runFetchTables,
  runFetchMoreTables,
} = useFetchConnections()

const isCopyTask = computed(() => dataflow.value.syncType !== 'sync')

const showCreateTable = computed(() => {
  const conn = currentConnection.value as any
  return conn && conn.connection_type?.includes('source_and_target')
})

const showConnectionList = computed(
  () => !currentConnectionId.value && !tableState.query,
)

const handleFetchConnections = () => {
  runFetchConnections({
    connection_type: {
      $ne: activeTab.value === 0 ? 'target' : 'source',
    },
  })
}

handleFetchConnections()

// 搜索范围：表 / 连接，控制搜索框查询的目标
const searchScope = ref<'table' | 'connection'>('table')

const tableSearchQuery = computed({
  get: () =>
    searchScope.value === 'connection'
      ? connectionQuery.value
      : tableState.query,
  set: (val: string) => {
    if (searchScope.value === 'connection') {
      connectionQuery.value = val
    } else {
      tableState.query = val
    }
  },
})

const handleSearchInput = () => {
  if (searchScope.value === 'connection') {
    handleFetchConnections()
  } else {
    runFetchTables()
  }
}

const handleSearchScopeChange = () => {
  // 切换搜索范围时清空两侧查询并刷新对应列表
  connectionQuery.value = ''
  tableState.query = ''
  handleSearchInput()
}

// 根据添加位置决定哪些 tab 被禁用
const disabledTabs = computed(() => {
  const { nextNodeId, prevNodeId } = props.params || {}
  const disabled = new Set<number>()

  if (nextNodeId && prevNodeId) {
    // 连线之间 - 只能选处理节点
    disabled.add(0) // source
    disabled.add(2) // target
  } else if (prevNodeId && !nextNodeId) {
    // 右侧加节点 - 源 tab 禁用
    disabled.add(0)
  } else if (!prevNodeId && nextNodeId) {
    // 左侧加节点 - 目标 tab 禁用
    disabled.add(2)
  }

  return disabled
})

const setActiveTab = (index: number) => {
  if (disabledTabs.value.has(index)) return

  activeTab.value = index

  if (index !== 1) {
    if (previousTab.value !== index) {
      connectionScroller.value?.setScrollTop(0)
      handleUnselectConnection()
      handleFetchConnections()
    }
    previousTab.value = index
  }
}

setActiveTab(0)

// 处理 mousedown 事件以关闭 popover
const handleMouseDown = (event: MouseEvent) => {
  if (!show.value) return

  const popperElement = popoverRef.value?.popperRef?.contentRef
  const target = event.target as HTMLElement

  // 忽略搜索范围下拉浮层内部的点击（已 teleport 到 body）
  if (target.closest?.('.el-select-dropdown')) return

  // 检查点击是否在 popover 外部
  if (popperElement && !popperElement.contains(target)) {
    show.value = false
  }
}

/**
 * 立即隐藏 popper（同步设置 visibility:hidden），再设 show=false。
 * 目的：防止图结构变化（如删除连线）导致 Popper.js 在 DOM 移除前重算位置产生漂移。
 */
function hideImmediately() {
  const popperEl = popoverRef.value?.popperRef?.contentRef as
    | HTMLElement
    | undefined
  if (popperEl) popperEl.style.visibility = 'hidden'
  show.value = false
}

// 监听 show 的变化，添加或移除事件监听器
watch(show, (newValue) => {
  if (newValue) {
    // 清除 hideImmediately 留下的 visibility 覆盖
    const popperEl = popoverRef.value?.popperRef?.contentRef as
      | HTMLElement
      | undefined
    if (popperEl) popperEl.style.visibility = ''

    // 使用 mousedown 而不是 click
    document.addEventListener('mousedown', handleMouseDown, true)

    // 根据触发位置自动设置 activeTab
    const { nextNodeId, prevNodeId } = props.params || {}

    if (nextNodeId && !prevNodeId) {
      // 节点左侧触发 - 激活 source tab
      setActiveTab(0)
    } else if (prevNodeId && !nextNodeId) {
      // 节点右侧触发 - 激活 processor tab
      setActiveTab(2)
    } else if (nextNodeId && prevNodeId) {
      // 连线上触发 - 激活 processor tab
      setActiveTab(1)
    }
  } else {
    document.removeEventListener('mousedown', handleMouseDown, true)
  }
})

// 组件卸载时清理事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleMouseDown, true)
})

/**
 * 确保节点拥有 __Ctor，连线校验需要
 */
const ensureNodeCtor = (node: any) => {
  if (!node.__Ctor) {
    const ins = dataflowStore.getResourceInsByNode(node)
    if (ins) {
      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false,
      })
    }
  }
}

/**
 * 判断 source 节点能否连接到 target 节点
 */
const canConnect = (sourceNode: any, targetNode: any): boolean => {
  ensureNodeCtor(sourceNode)
  ensureNodeCtor(targetNode)
  if (!sourceNode.__Ctor || !targetNode.__Ctor) return true // 无法校验时放行

  return dataflowStore.checkAllowTargetOrSource(sourceNode, targetNode, true)
}

const getBeforeNodesInSameBranch = (nodeId: string) => {
  const list: any[] = []
  const visited = new Set<string>()

  const traverse = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)

    const currentNode = dataflowStore.findNodeById(id)
    if (!currentNode) return

    list.push(currentNode)

    currentNode.$inputs?.forEach((inputId: string) => {
      traverse(inputId)
    })
  }

  traverse(nodeId)

  return list
}

const hasMultiInputNode = (nodes: any[]) =>
  nodes.some((n) => (n?.$inputs?.length || 0) > 1)

const handleAddNode = (node: any) => {
  const { nextNodeId, prevNodeId } = props.params || {}
  let connection = null

  // 开始批量记录 - 所有操作作为一个 BulkCommand
  historyStore.startRecordingUndo()
  if (canAddNode && !canAddNode(node)) {
    historyStore.stopRecordingUndo()
    return
  }

  if (nextNodeId && prevNodeId) {
    // 在两个节点之间添加
    const prevNode = dataflowStore.findNodeById(prevNodeId)
    const nextNodeData = dataflowStore.findNodeById(nextNodeId)

    // 校验 prevNode → newNode 和 newNode → nextNode 是否允许连接
    if (prevNode && !canConnect(prevNode, node)) {
      historyStore.stopRecordingUndo()
      return
    }
    if (nextNodeData && !canConnect(node, nextNodeData)) {
      historyStore.stopRecordingUndo()
      return
    }
    const afterNodes = dataflowStore.getAfterNodesInSameBranch(nextNodeId)
    const nextNode = findNode(nextNodeId)!
    const prevCanvasNode = findNode(prevNodeId)!
    const hasMultiInputDownstream = hasMultiInputNode(afterNodes)
    const offset = hasMultiInputDownstream
      ? prevCanvasNode.dimensions.width + X_OFFSET
      : nextNode.dimensions.width + X_OFFSET

    node.attrs.position = hasMultiInputDownstream
      ? [prevCanvasNode.position.x, prevCanvasNode.position.y]
      : [nextNode.position.x, nextNode.position.y]

    // 先收集所有节点的原始位置，避免循环中位置引用被修改
    const positionsToMove = (
      hasMultiInputDownstream
        ? getBeforeNodesInSameBranch(prevNodeId)
        : afterNodes
    ).map((n) => ({
      id: n.id,
      oldPosition: [...n.attrs.position] as [number, number],
      newPosition: [
        n.attrs.position[0] + (hasMultiInputDownstream ? -offset : offset),
        n.attrs.position[1],
      ] as [number, number],
    }))

    // 移动后续节点的位置（使用 tracking）
    positionsToMove.forEach(({ id, newPosition }) => {
      onMoveNodePosition?.(id, newPosition)
    })

    // 删除原有连线
    onDeleteConnection?.({
      source: prevNodeId,
      target: nextNodeId,
    })

    onAddNode?.(node)
    // 添加新连线
    onCreateConnection?.({
      source: prevNodeId,
      target: node.id,
    })
    onCreateConnection?.({
      source: node.id,
      target: nextNodeId,
    })

    historyStore.stopRecordingUndo()
    focusNode(node.id)
    return
  } else if (prevNodeId && !nextNodeId) {
    // 在节点后面添加 - 校验 prevNode → newNode
    const prevNode = dataflowStore.findNodeById(prevNodeId)
    if (prevNode && !canConnect(prevNode, node)) {
      historyStore.stopRecordingUndo()
      return
    }

    const canvasNode = findNode(prevNodeId)
    const outgoers = getOutgoers(prevNodeId).sort(
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

    node.attrs.position = position
    connection = {
      source: prevNodeId,
      target: node.id,
    }
  } else if (!prevNodeId && nextNodeId) {
    // 在节点前面添加 - 校验 newNode → nextNode
    const nextNodeData = dataflowStore.findNodeById(nextNodeId)
    if (nextNodeData && !canConnect(node, nextNodeData)) {
      historyStore.stopRecordingUndo()
      return
    }

    const nextNode = findNode(nextNodeId)
    const afterNodes = dataflowStore.getAfterNodesInSameBranch(nextNodeId)
    const offset = nextNode!.dimensions.width + X_OFFSET

    // 检查上游是否已有连线的节点，如果有则放在最下面的上游节点下方
    const incomers = getIncomers(nextNodeId).sort(
      (a, b) => a.position.y - b.position.y,
    )
    const lastIncomer = incomers.at(-1)
    const position = lastIncomer
      ? [
          lastIncomer.position.x,
          lastIncomer.position.y + lastIncomer.dimensions.height + Y_OFFSET,
        ]
      : [nextNode!.position.x, nextNode!.position.y]

    node.attrs.position = position

    // 仅在没有上游节点时才需要移动后续节点（原位置被新节点占用）
    if (!lastIncomer) {
      afterNodes.forEach((n) => {
        const newX = n.attrs.position[0] + offset
        onMoveNodePosition?.(n.id, [newX, n.attrs.position[1]])
      })
    }

    connection = {
      source: node.id,
      target: nextNodeId,
    }
  } else {
    // 在画布上添加（通过右键菜单）
    const { flowPosition } = props.params || {}
    if (flowPosition) {
      node.attrs.position = [flowPosition.x, flowPosition.y]
    }
    // 没有连接关系
    connection = null
  }

  onAddNode?.(node)
  if (connection) {
    onCreateConnection?.(connection)
  }

  historyStore.stopRecordingUndo()
  focusNode(node.id)
}

const onClickConnection = (item: any) => {
  if (dataflowStore.dataflow.syncType === 'sync') {
    handleSelectConnection(item)
  } else {
    const node = makeNode(item!)
    hideImmediately()
    handleAddNode(node)
  }
}

const { promptCreateTable } = useCreateTable()

const handleAddTable = async () => {
  if (!currentConnection.value) return
  show.value = false
  const tableName = await promptCreateTable()
  if (!tableName) return
  onClickTable({ name: tableName })
}

const onClickTable = async (item: any) => {
  let connection = currentConnection.value
  if (!connection) {
    connection = await getConnectionNoSchema(item.sourceId)
  }

  const node = makeNode(connection!, item.name)
  hideImmediately()
  handleAddNode(node)
}

const onClickProcessor = (item: any) => {
  hideImmediately()
  handleAddNode(makeProcessorNode(item))
}

defineExpose({
  update() {
    popoverRef.value?.popperRef?.popperInstanceRef?.update()
  },
  setActiveTab,
})
</script>

<template>
  <ElPopover
    ref="popoverRef"
    v-model:visible="show"
    popper-class="p-0 overflow-hidden"
    :virtual-ref="reference"
    :hide-after="0"
    transition="none"
    virtual-triggering
    trigger="click"
    width="auto"
    :show-arrow="false"
  >
    <div class="flex flex-column h-100">
      <div class="pt-1 pl-1" style="background-color: var(--N50)">
        <ul class="tab-bar-list flex overflow-hidden">
          <li
            v-for="(item, index) in items"
            :key="index"
            class="position-relative px-4 flex align-center tab-bar-list-item"
            :class="{
              'tab-bar-list-item--active': index === activeTab,
              'tab-bar-list-item--disabled': disabledTabs.has(index),
              'hover-radius-left': activeTab + 1 === index,
              'hover-radius-right': activeTab - 1 === index,
            }"
            @click="setActiveTab(index)"
          >
            <svg
              v-if="activeTab + 1 !== index"
              width="9"
              height="9"
              xmlns="http://www.w3.org/2000/svg"
              class="tab-bar-list-item__arc-angle--left tab-bar-list-item__arc-angle"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 0v9h9a9 9 0 01-9-9z"
              />
            </svg>
            <span>{{ item.title }}</span>
            <svg
              v-if="activeTab - 1 !== index"
              width="9"
              height="9"
              xmlns="http://www.w3.org/2000/svg"
              class="tab-bar-list-item__arc-angle--right tab-bar-list-item__arc-angle"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 0v9h9a9 9 0 01-9-9z"
              />
            </svg>
          </li>
        </ul>
      </div>
      <div v-if="activeTab !== 1">
        <div v-if="currentConnection" class="pt-1 px-1">
          <div
            class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg user-select-none"
            @click="handleUnselectConnection"
          >
            <el-icon :size="16">
              <!-- <i-lucide-chevron-left /> -->
              <i-lucide-arrow-left />
            </el-icon>
            <NodeIcon
              class="flex-shrink-0"
              :size="20"
              :node="currentConnection"
              draggable="false"
            />
            <span>
              {{ currentConnection.name }}
            </span>
          </div>
        </div>
        <div class="p-2">
          <div
            v-if="showCreateTable"
            class="mb-2 flex h-8 align-center gap-2 px-3 connection-item rounded-lg user-select-none border border-dashed font-color-light"
            @click="handleAddTable"
          >
            <el-icon><i-lucide-plus /></el-icon
            ><span>{{ t('packages_dag_dialog_createTable') }}</span>
          </div>
          <el-input
            v-if="isCopyTask"
            v-model="connectionQuery"
            :placeholder="$t('packages_dag_search_connection')"
            clearable
            @input="handleFetchConnections"
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
          <el-input
            v-else-if="currentConnection"
            v-model="tableState.query"
            :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
            clearable
            @input="runFetchTables"
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
          <el-input
            v-else
            v-model="tableSearchQuery"
            :placeholder="
              searchScope === 'connection'
                ? $t('packages_dag_search_connection')
                : $t('packages_form_table_rename_index_sousuobiaoming')
            "
            clearable
            @input="handleSearchInput"
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
            <template #prepend>
              <el-select
                v-model="searchScope"
                class="search-scope-select"
                :teleported="false"
                @change="handleSearchScopeChange"
              >
                <el-option
                  :label="$t('packages_dag_dag_table')"
                  value="table"
                />
                <el-option
                  :label="$t('packages_dag_dag_connection')"
                  value="connection"
                />
              </el-select>
            </template>
          </el-input>
        </div>
        <div class="border-top nodes-popover-content">
          <el-scrollbar
            v-if="showConnectionList"
            ref="connectionScroller"
            :max-height="480"
            :distance="10"
            class="flex-1 min-h-0"
            @end-reached="runFetchMoreConnections"
          >
            <div class="p-1">
              <div
                v-for="item in connections"
                :key="item.id"
                class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg user-select-none"
                @click="onClickConnection(item)"
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
                <ConnectionType
                  v-if="item.connection_type === 'source_and_target'"
                  :type="item.connection_type"
                />
              </div>
            </div>
          </el-scrollbar>
          <el-scrollbar
            v-else-if="!currentConnectionId && tableState.query"
            key="table"
            :distance="10"
            :max-height="480"
            @end-reached="runFetchMoreTables"
          >
            <div class="p-1">
              <div
                v-for="item in tables"
                :key="item.id"
                class="flex align-center gap-2 px-3 py-1.5 connection-item rounded-lg user-select-none"
                @click="onClickTable(item)"
              >
                <div
                  class="flex align-center justify-center p-1.5 bg-gray-100 dark:bg-white/15 rounded-lg"
                >
                  <el-icon :size="16">
                    <i-lucide-eye v-if="item.meta_type === 'view'" />
                    <i-lucide-table v-else />
                  </el-icon>
                </div>

                <div>
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
                  <div class="font-color-sslight">
                    Table in {{ item.sourceName }}
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
          <el-scrollbar
            v-else
            key="connectionTable"
            :max-height="480"
            :distance="10"
            class="flex-1 min-h-0"
            @end-reached="runFetchMoreTables"
          >
            <div class="p-1">
              <div
                v-for="item in tables"
                :key="item.id"
                class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg user-select-none"
                @click="onClickTable(item)"
              >
                <el-icon :size="16">
                  <i-lucide-eye v-if="item.meta_type === 'view'" />
                  <i-lucide-table v-else />
                </el-icon>
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
      </div>

      <div v-else>
        <div class="p-2">
          <el-input
            v-model="processorQuery"
            :placeholder="$t('packages_dag_search_processor')"
            clearable
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="border-top nodes-popover-content">
          <el-scrollbar class="flex-1 min-h-0" :max-height="480">
            <div class="p-1">
              <div
                v-for="(item, ni) in filteredProcessorNodeTypes"
                :key="ni"
                class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg user-select-none"
                @click="onClickProcessor(item)"
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
      </div>
    </div>
  </ElPopover>
</template>

<style scoped lang="scss">
.tab-bar-list {
  height: 40px;

  &-item {
    margin: 0;
    color: var(--text-light);
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    font-weight: 500;
    transition:
      color 0.1s ease-in,
      background-color 0.1s ease-in,
      border-color 0.1s ease-in,
      width 0.2s ease-in;

    &--disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:not(.tab-bar-list-item--active):not(.tab-bar-list-item--disabled):hover {
      background-color: rgba(31, 35, 41, 0.05);
      color: var(--text-normal);

      .tab-bar-list-item__arc-angle {
        display: block;
        fill: rgba(31, 35, 41, 0.05);
      }

      &.hover-radius-left {
        border-bottom-left-radius: 8px;
      }

      &.hover-radius-right {
        border-bottom-right-right: 8px;
      }
    }

    &--active {
      background-color: var(--el-bg-color-overlay);
      color: var(--color-primary);
      box-shadow:
        0px 6px 18px 6px rgba(31, 35, 41, 0.03),
        0px 3px 6px -6px rgba(31, 35, 41, 0.05),
        0px 4px 8px 0px rgba(31, 35, 41, 0.03);

      .tab-bar-list-item__arc-angle {
        display: block;
      }
    }

    &__arc-angle {
      display: none;
      position: absolute;
      bottom: 0;
      width: 8px;
      height: 8px;
      fill: var(--el-bg-color-overlay);

      &--left {
        left: -8px;
        transform: rotate(-90deg);
      }

      &--right {
        right: -8px;
      }
    }
  }
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
.nodes-popover-content {
  min-width: 400px;
  max-width: 480px;
  border-color: var(--el-border-color-extra-light) !important;
}
.search-scope-select {
  width: auto;

  :deep(.el-select__selected-item.el-select__placeholder) {
    position: relative;
    transform: none !important;
  }

  :deep(.el-select__caret) {
    font-size: 10px;
  }
}
</style>
