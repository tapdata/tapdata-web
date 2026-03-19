<script setup lang="ts">
import { getConnectionNoSchema } from '@tap/api/src/core/connections'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { useVueFlow } from '@vue-flow/core'
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { makeNode, makeProcessorNode } from '../../composables/useDnD'
import { useFetchConnections } from '../../composables/useFetchConnections'
import { useDataflowStore } from '../../stores/dataflow.store'
import { useHistoryStore } from '../../stores/history.store'
import NodeIcon from '../NodeIcon.vue'
import type { PopoverInstance, ScrollbarInstance } from 'element-plus'

interface Props {
  reference?: HTMLElement | null
  params?: any
}

const X_OFFSET = 100
const Y_OFFSET = 40

const props = defineProps<Props>()

const { findNode, getOutgoers } = useVueFlow()

const { t } = useI18n()

const dataflowStore = useDataflowStore()
const historyStore = useHistoryStore()

// Inject tracking functions for history support
const onAddNode = inject<(node: any) => void>('onAddNode')
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
const search = ref('')
const connectionScroller = ref<ScrollbarInstance>()

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

defineExpose({
  update() {
    popoverRef.value?.popperRef?.popperInstanceRef?.update()
  },
  setActiveTab(index: number) {
    activeTab.value = index
  },
})

const {
  runFetchConnections,
  runFetchMoreConnections,
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

const handleFetchConnections = () => {
  runFetchConnections({
    connection_type: {
      $ne: activeTab.value === 0 ? 'target' : 'source',
    },
  })
}

handleFetchConnections()

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
  const target = event.target as Node

  // 检查点击是否在 popover 外部
  if (popperElement && !popperElement.contains(target)) {
    show.value = false
  }
}

// 监听 show 的变化，添加或移除事件监听器
watch(show, (newValue) => {
  if (newValue) {
    // 使用 mousedown 而不是 click
    document.addEventListener('mousedown', handleMouseDown, true)

    // 根据触发位置自动设置 activeTab
    const { nextNodeId, prevNodeId } = props.params || {}

    if (nextNodeId && !prevNodeId) {
      // 节点左侧触发 - 激活 source tab
      setActiveTab(0)
    } else if (prevNodeId && !nextNodeId) {
      // 节点右侧触发 - 激活 processor tab
      setActiveTab(1)
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

const handleAddNode = (node: any) => {
  const { nextNodeId, prevNodeId } = props.params || {}
  let connection = null

  // 开始批量记录 - 所有操作作为一个 BulkCommand
  historyStore.startRecordingUndo()

  if (nextNodeId && prevNodeId) {
    // 在两个节点之间添加
    const afterNodes = dataflowStore.getAfterNodesInSameBranch(nextNodeId)
    const nextNode = findNode(nextNodeId)!
    const offset = nextNode.dimensions.width + X_OFFSET

    node.attrs.position = [nextNode.position.x, nextNode.position.y]

    // 先收集所有节点的原始位置，避免循环中位置引用被修改
    const positionsToMove = afterNodes.map((n) => ({
      id: n.id,
      oldPosition: [...n.attrs.position] as [number, number],
      newPosition: [n.attrs.position[0] + offset, n.attrs.position[1]] as [
        number,
        number,
      ],
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

    // 添加新节点
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
    return
  } else if (prevNodeId && !nextNodeId) {
    // 在节点后面添加
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
    // 在节点前面添加
    const nextNode = findNode(nextNodeId)
    const afterNodes = dataflowStore.getAfterNodesInSameBranch(nextNodeId)
    const offset = nextNode!.dimensions.width + X_OFFSET

    node.attrs.position = [nextNode!.position.x, nextNode!.position.y]

    // 移动后续节点的位置（使用 tracking）
    afterNodes.forEach((n) => {
      const newX = n.attrs.position[0] + offset
      onMoveNodePosition?.(n.id, [newX, n.attrs.position[1]])
    })

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
}

const onClickConnection = (item: any) => {
  if (dataflowStore.dataflow.syncType === 'sync') {
    handleSelectConnection(item)
  } else {
    const node = makeNode(item!)
    node.attrs.isSource = activeTab.value === 0
    node.attrs.isTarget = activeTab.value === 2
    handleAddNode(node)

    show.value = false
  }
}

const onClickTable = async (item: any) => {
  let connection = currentConnection.value
  if (!connection) {
    connection = await getConnectionNoSchema(item.sourceId)
  }

  const node = makeNode(connection!, item.name)
  node.attrs.isSource = activeTab.value === 0
  node.attrs.isTarget = activeTab.value === 2
  handleAddNode(node)

  show.value = false
}

const onClickProcessor = (item: any) => {
  handleAddNode(makeProcessorNode(item))

  show.value = false
}
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
            v-if="currentConnection && activeTab === 2"
            class="mb-2 flex h-8 align-center gap-2 px-3 connection-item rounded-lg user-select-none border border-dashed font-color-light"
            @click="onClickTable({ name: '' })"
          >
            <el-icon><i-lucide-plus /></el-icon><span>创建新表</span>
          </div>
          <el-input
            v-model="tableState.query"
            :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
            clearable
            @input="runFetchTables"
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="border-top nodes-popover-content">
          <el-scrollbar
            v-if="!currentConnectionId && !tableState.query"
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
                <!-- <ConnectionType class="ml-auto" :type="item.connection_type" /> -->
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
                  <el-icon :size="16"><i-lucide-table /></el-icon>
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
                class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg grabbable user-select-none"
                @click="onClickTable(item)"
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
      </div>

      <div v-else>
        <div class="p-2">
          <el-input
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
                v-for="(item, ni) in dataflowStore.processorNodeTypes"
                :key="ni"
                class="flex h-8 align-center gap-2 px-3 connection-item rounded-lg grabbable user-select-none"
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
      background-color: #fff;
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
      fill: #fff;

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
</style>
