<script lang="ts" setup>
import { fetchConnections } from '@tap/api/src/core/connections'
import { fetchMetadataInstances } from '@tap/api/src/core/metadata-instances'
import { mouseDrag as vDrag } from '@tap/component/src/directives/mousedrag'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { useVueFlow } from '@vue-flow/core'
import { ElMessageBox, type ScrollbarDirection } from 'element-plus'
import { debounce, escapeRegExp } from 'lodash-es'
import { computed, inject, nextTick, reactive, ref, shallowRef } from 'vue'
import { makeNode, useDnD } from '../composables/useDnD'
import { useDataflowStore } from '../stores/dataflow.store'
import BaseNode from './BaseNode.vue'
import ConnectionType from './ConnectionType.vue'
import NodeIcon from './NodeIcon.vue'

const emit = defineEmits(['move-node', 'drop-node'])

const dataflowStore = useDataflowStore()

const pageSize = 20

const dataflow = inject<(node: any) => void>('dataflow')
const onAddNode = inject<(node: any) => void>('onAddNode')

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

const { t } = useI18n()
const { findNode } = useVueFlow()

const X_OFFSET = 100

const handleAddTable = async () => {
  if (!currentConnection.value) return
  try {
    const { value } = await ElMessageBox.prompt(
      '',
      t('packages_dag_dialog_createTable'),
      {
        inputPlaceholder: t('packages_dag_dialog_placeholderTable'),
        inputValidator: (val) => !!val?.trim(),
        confirmButtonText: t('public_button_confirm'),
        cancelButtonText: t('public_button_cancel'),
      },
    )
    if (value?.trim()) {
      const node = makeNode(currentConnection.value, value.trim())

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
  } catch {
    // cancelled
  }
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
    <template v-if="dataflow.syncType === 'sync'">
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
