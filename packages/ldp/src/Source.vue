<script setup lang="ts">
import { fetchConnections } from '@tap/api/src/core/connections'
import { searchLDPSources } from '@tap/api/src/core/ldp'
import { getTablesValue } from '@tap/api/src/core/metadata-instances'
import { CancelToken } from '@tap/api/src/request'
import StageButton from '@tap/business/src/components/StageButton.vue'
import { makeDragNodeImage } from '@tap/business/src/shared'
import { VEmpty } from '@tap/component/src/base/v-empty'
import { IconButton } from '@tap/component/src/icon-button'
import VirtualTree from '@tap/component/src/virtual-tree'
import NodeIcon from '@tap/dag/src/components/NodeIcon.vue'
import { useResizeObserver } from '@vueuse/core'
import { debounce } from 'lodash-es'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
// @ts-ignore - vuex type issue
import { useStore } from 'vuex'

type TreeKey = string | number

interface SourceNode {
  [key: string]: any
  id: TreeKey
  name: string
  children?: SourceNode[]
  isLeaf?: boolean
  isObject?: boolean
  isEmpty?: boolean
  loading?: boolean
  tablesLoaded?: boolean
}

interface DragState {
  isDragging: boolean
  draggingObjects: any[]
  from?: string
}

interface Props {
  dragState?: DragState
  eventDriver?: any
  fdmAndMdmId?: Array<TreeKey | undefined>
  showParentLineage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dragState: () => ({
    isDragging: false,
    draggingObjects: [],
  }),
  eventDriver: undefined,
  fdmAndMdmId: () => [],
  showParentLineage: false,
})

const emit = defineEmits<{
  preview: [data: SourceNode, parent?: SourceNode]
  createConnection: [type: 'source']
  nodeDragEnd: [event: DragEvent]
  handleConnection: []
  onScroll: []
}>()

const store = useStore()
const tree = ref<any>(null)
const searchInput = ref<any>(null)
const treeContainer = ref<HTMLElement | null>(null)

const treeData = ref<SourceNode[]>([])
const filterTreeData = ref<SourceNode[]>([])
const connectionMap = ref<Record<string, SourceNode>>({})
const treeHeight = ref(200)
const expandedKeys = ref<TreeKey[]>([])
const searchExpandedKeys = ref<TreeKey[]>([])
const search = ref('')
const enableSearch = ref(false)
const searchIng = ref(false)
const loading = ref(false)
const newConnectionId = ref<TreeKey>()
const cancelSource = ref<any>()
const sourceDragState = props.dragState

const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id',
  disabled: 'disabled',
  isLeaf: 'isLeaf',
}

const startingTour = computed(() => store.getters.startingTour)
const highlightBoard = computed(() => (store.state as any).highlightBoard)
const showSearch = computed(() => Boolean(search.value || searchIng.value))
const displayTreeData = computed(() => {
  return showSearch.value || props.showParentLineage
    ? filterTreeData.value
    : treeData.value
})
const displayExpandedKeys = computed(() => {
  return showSearch.value || props.showParentLineage
    ? searchExpandedKeys.value
    : expandedKeys.value
})
const displayTreeKey = computed(() => {
  if (props.showParentLineage) return 'lineage-tree'
  return showSearch.value ? 'search-tree' : 'source-tree'
})

let destroyed = false
let connectionRequestId = 0
let searchRequestId = 0
let refreshTimer: ReturnType<typeof setTimeout> | undefined
const pendingTableRequests = new Map<string, Promise<SourceNode[]>>()

function getNodeKey(id: TreeKey) {
  return String(id)
}

function isExcluded(id: TreeKey) {
  return props.fdmAndMdmId.some(
    (excludedId) =>
      excludedId != null && getNodeKey(excludedId) === getNodeKey(id),
  )
}

function mapConnection(
  connection: Record<string, any>,
  children: SourceNode[] = [],
  tablesLoaded = false,
  previous?: SourceNode,
): SourceNode {
  const { status, loadCount = 0, tableCount = 0 } = connection
  return {
    ...connection,
    id: connection.id,
    name: connection.name,
    progress: !tableCount
      ? 0
      : Math.round((loadCount / tableCount) * 10000) / 100,
    children,
    tablesLoaded,
    loading: previous?.loading ?? false,
    isLeaf: false,
    disabled: status !== 'ready',
    type: 'connection',
    LDP_TYPE: 'connection',
  }
}

function updateDisplayedTree() {
  if (showSearch.value || props.showParentLineage) {
    filterTreeData.value = [...filterTreeData.value]
  } else {
    treeData.value = [...treeData.value]
  }
}

async function refreshConnections() {
  const requestId = ++connectionRequestId
  const filter = {
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
  const res = await fetchConnections(filter)
  if (destroyed || requestId !== connectionRequestId) return

  const previousMap = connectionMap.value
  const nextMap: Record<string, SourceNode> = {}
  const nextTreeData: SourceNode[] = []

  for (const item of res?.items || []) {
    if (isExcluded(item.id)) continue

    const key = getNodeKey(item.id)
    const previous = previousMap[key]
    const connection = mapConnection(
      item,
      previous?.children || [],
      previous?.tablesLoaded || false,
      previous,
    )
    nextMap[key] = connection
    nextTreeData.push(connection)
  }

  connectionMap.value = nextMap
  treeData.value = nextTreeData
}

async function initTree() {
  clearTimeout(refreshTimer)
  if (destroyed) return

  loading.value = treeData.value.length === 0
  try {
    await refreshConnections()

    const newConnection = newConnectionId.value
      ? connectionMap.value[getNodeKey(newConnectionId.value)]
      : undefined
    if (
      startingTour.value &&
      newConnection &&
      newConnection.status === 'ready' &&
      newConnection.loadFieldsStatus === 'finished' &&
      !newConnection.tablesLoaded
    ) {
      await handleNodeExpand(newConnection)
    }
  } finally {
    loading.value = false
    if (!destroyed) {
      refreshTimer = setTimeout(() => {
        initTree()
      }, 5000)
    }
  }
}

async function getTableList(id: TreeKey): Promise<SourceNode[]> {
  const res = await getTablesValue({ connectionId: id })
  const data = (res || []).map((table: any) => ({
    id: table.tableId,
    name: table.tableName,
    comment: table.tableComment,
    connectionId: id,
    isLeaf: true,
    isObject: true,
    type: 'table',
    LDP_TYPE: 'table',
    SWIM_TYPE: 'source',
    meta_type: table.meta_type,
  }))

  return data.length
    ? data
    : [
        {
          id: `${id}-empty`,
          name: '',
          comment: '',
          connectionId: id,
          isLeaf: true,
          isEmpty: true,
        },
      ]
}

function loadTables(connection: SourceNode) {
  const key = getNodeKey(connection.id)
  const pendingRequest = pendingTableRequests.get(key)
  if (pendingRequest) return pendingRequest

  connection.loading = true
  const request = getTableList(connection.id)
    .then((tables) => {
      if (destroyed) return tables

      connection.children = tables
      connection.tablesLoaded = true
      const currentConnection = connectionMap.value[key]
      if (currentConnection && currentConnection !== connection) {
        currentConnection.children = tables
        currentConnection.tablesLoaded = true
      }
      updateDisplayedTree()
      return tables
    })
    .finally(() => {
      connection.loading = false
      pendingTableRequests.delete(key)
      updateDisplayedTree()
    })

  pendingTableRequests.set(key, request)
  return request
}

function setExpand(id: TreeKey, expanded: boolean) {
  const key = getNodeKey(id)
  const keys =
    showSearch.value || props.showParentLineage
      ? searchExpandedKeys
      : expandedKeys
  if (expanded) {
    if (!keys.value.some((item) => getNodeKey(item) === key)) {
      keys.value = [...keys.value, id]
    }
  } else {
    keys.value = keys.value.filter((item) => getNodeKey(item) !== key)
  }
}

async function handleNodeExpand(data: SourceNode) {
  if (!data || data.isLeaf || data.LDP_TYPE !== 'connection') return

  setExpand(data.id, true)
  if (data.tablesLoaded || data.children?.some((child) => !child.isEmpty)) {
    data.tablesLoaded = true
    data.loading = false
    return
  }

  await loadTables(data)
}

function handleNodeCollapse(data: SourceNode) {
  if (data?.id != null) setExpand(data.id, false)
}

function getConnectionId(node: any) {
  return node?.parent?.data?.id
}

function handleAdd() {
  emit('createConnection', 'source')
}

function handleDragStart(draggingNode: any, event: DragEvent) {
  const target = event.currentTarget as HTMLElement | null
  const icon = target?.querySelector('.tree-item-icon') || target
  if (icon) {
    const image = makeDragNodeImage(icon, draggingNode.data.name)
    event.dataTransfer?.setDragImage(image, 0, 0)
  }
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'

  sourceDragState.isDragging = true
  sourceDragState.draggingObjects = [draggingNode]
  sourceDragState.from = 'SOURCE'
}

function handleDragEnd(
  _draggingNode: any,
  _dropNode: any,
  _dropType: any,
  event: DragEvent,
) {
  emit('nodeDragEnd', event)
}

function handlePreview(data: SourceNode, parent?: SourceNode) {
  if (!data.isObject) return
  emit('preview', data, parent)
}

const handleScroll = debounce(() => {
  emit('onScroll')
}, 200)

function buildSearchTree(result: any[]) {
  const grouped = new Map<string, SourceNode>()

  for (const item of result) {
    const connectionId = item?.conId
    if (connectionId == null || isExcluded(connectionId)) continue

    const key = getNodeKey(connectionId)
    let connection = grouped.get(key)
    if (!connection) {
      const existing = connectionMap.value[key]
      const dto = item?.dto || {}
      connection = existing
        ? { ...existing, children: [], tablesLoaded: false }
        : mapConnection({
            ...dto,
            id: connectionId,
            name: dto.name || item.connectionName || String(connectionId),
          })
      grouped.set(key, connection)
    }

    if (item.type === 'metadata') {
      const table = item.dto || {}
      connection.children?.push({
        id: table.id || table.tableId,
        name: table.name || table.tableName,
        connectionId,
        isLeaf: true,
        isObject: true,
        type: 'table',
        LDP_TYPE: 'table',
      })
      connection.tablesLoaded = true
    }
  }

  const connections = [...grouped.values()]
  const firstExpanded = connections.find(
    (connection) => connection.children?.length,
  )
  return {
    data: connections,
    expandedKeys: firstExpanded ? [firstExpanded.id] : [],
  }
}

async function searchSources(value: string) {
  const requestId = ++searchRequestId
  cancelSource.value?.cancel()
  cancelSource.value = CancelToken.source()
  searchIng.value = true

  try {
    if (!Object.keys(connectionMap.value).length) {
      await refreshConnections().catch(() => undefined)
    }

    const result = await searchLDPSources(
      {
        key: value,
        connectionType: ['source', 'source_and_target'].join(','),
      },
      {
        cancelToken: cancelSource.value.token,
      },
    )
    if (destroyed || requestId !== searchRequestId) return

    const searchTree = buildSearchTree(result || [])
    filterTreeData.value = searchTree.data
    searchExpandedKeys.value = searchTree.expandedKeys
  } finally {
    if (requestId === searchRequestId) {
      searchIng.value = false
      cancelSource.value = undefined
    }
  }
}

const debouncedSearch = debounce((value: string) => {
  searchSources(value.trim())
}, 300)

function clearSearch() {
  searchRequestId += 1
  cancelSource.value?.cancel()
  cancelSource.value = undefined
  debouncedSearch.cancel()
  searchIng.value = false
  filterTreeData.value = []
  searchExpandedKeys.value = []
}

function toggleEnableSearch() {
  if (enableSearch.value) {
    search.value = ''
    clearSearch()
    enableSearch.value = false
    return
  }

  enableSearch.value = true
  nextTick(() => searchInput.value?.focus())
}

function handleSearch(value: string) {
  search.value = value
  if (!value.trim()) {
    clearSearch()
    return
  }

  searchRequestId += 1
  searchIng.value = true
  debouncedSearch(value)
}

function addItem(data: Record<string, any>) {
  const connection = mapConnection(data)
  connection.loadFieldsStatus = 'loading'
  newConnectionId.value = data.id
  connectionMap.value = {
    ...connectionMap.value,
    [getNodeKey(data.id)]: connection,
  }

  if (isExcluded(data.id) || showSearch.value) return
  treeData.value = [connection, ...treeData.value]
}

function handleFindTreeDom(value: Record<string, any> = {}) {
  return document.querySelector(
    `#ldp_source_table_${value.connectionId}_${value.table}`,
  )
}

function searchByKeywordList(value: any[] = []) {
  const grouped = new Map<string, SourceNode>()

  for (const item of value) {
    if (item?.connectionId == null || isExcluded(item.connectionId)) continue

    const key = getNodeKey(item.connectionId)
    let connection = grouped.get(key)
    if (!connection) {
      const existing = connectionMap.value[key]
      connection = existing
        ? { ...existing, children: [], tablesLoaded: true }
        : mapConnection({
            id: item.connectionId,
            name: item.connectionName || String(item.connectionId),
            pdkHash: item.pdkHash,
            status: 'ready',
          })
      grouped.set(key, connection)
    }

    connection.children?.push({
      id: item.tableId,
      name: item.table,
      connectionId: item.connectionId,
      isLeaf: true,
      isObject: true,
      type: 'table',
      LDP_TYPE: 'table',
    })
  }

  filterTreeData.value = [...grouped.values()]
  searchExpandedKeys.value = [...grouped.values()].map((item) => item.id)
}

watch(
  () => props.fdmAndMdmId,
  () => {
    for (const id of props.fdmAndMdmId) {
      if (id == null) continue
      const key = getNodeKey(id)
      delete connectionMap.value[key]
      treeData.value = treeData.value.filter(
        (connection) => getNodeKey(connection.id) !== key,
      )
      filterTreeData.value = filterTreeData.value.filter(
        (connection) => getNodeKey(connection.id) !== key,
      )
    }
  },
  { deep: true },
)

useResizeObserver(treeContainer, ([entry]) => {
  if (!entry) return
  treeHeight.value = Math.max(entry.contentRect.height - 8, 1)
})

onMounted(() => {
  initTree()
})

onBeforeUnmount(() => {
  destroyed = true
  clearTimeout(refreshTimer)
  debouncedSearch.cancel()
  cancelSource.value?.cancel()
  handleScroll.cancel()
})

defineExpose({
  addItem,
  handleFindTreeDom,
  initTree,
  searchByKeywordList,
})
</script>

<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title list__title__source flex align-center px-4">
      <span class="fs-6">{{
        $t('packages_business_data_console_sources')
      }}</span>
      <div class="flex-grow-1" />
      <IconButton
        id="btn-add-source"
        :disabled="highlightBoard"
        @click="handleAdd"
      >
        add
      </IconButton>
      <IconButton
        :disabled="highlightBoard"
        :class="{ active: enableSearch }"
        @click="toggleEnableSearch"
      >
        search-outline
      </IconButton>
    </div>
    <div class="flex-1 min-h-0 flex flex-column">
      <div v-if="enableSearch" class="px-2 pt-2">
        <ElInput
          ref="searchInput"
          v-model="search"
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
        ref="treeContainer"
        v-loading="loading || searchIng"
        class="flex-fill min-h-0 p-1"
      >
        <VirtualTree
          v-if="displayTreeData.length || showSearch || props.showParentLineage"
          :key="displayTreeKey"
          ref="tree"
          class="ldp-tree h-100"
          :height="treeHeight"
          :item-size="32"
          :indent="0"
          :props="treeProps"
          draggable
          wrapper-class-name="p-2"
          :default-expanded-keys="displayExpandedKeys"
          :data="displayTreeData"
          :expand-on-click-node="true"
          :allow-drop="() => false"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
          @handle-scroll="handleScroll"
        >
          <template #default="{ node, data }">
            <div
              class="custom-tree-node flex align-items-center position-relative"
              :class="{
                grabbable: data.isObject,
                'opacity-50': data.disabled,
              }"
              @click="handlePreview(data, node.parent?.data)"
            >
              <div
                :id="
                  data.isObject
                    ? `ldp_source_table_${data.connectionId}_${data.name}`
                    : `connection_${data.id}`
                "
                class="inline-flex align-items-center overflow-hidden"
              >
                <VIcon
                  v-if="data.loading || data.loadFieldsStatus === 'loading'"
                  class="v-icon animation-rotate"
                  size="14"
                  color="rgb(61, 156, 64)"
                >
                  loading-circle
                </VIcon>
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
                  <StageButton :connection-id="getConnectionId(node)" />
                </div>
                <VIcon v-else class="tree-item-icon mr-2" size="18"
                  >table</VIcon
                >
                <span class="table-label" :title="data.name">
                  {{ data.name }}
                  <span v-if="data.comment" class="font-color-sslight">
                    ({{ data.comment }})
                  </span>
                  <ElTag v-if="data.disabled" disable-transitions type="info">
                    {{ $t('public_status_invalid') }}
                  </ElTag>
                </span>
              </div>
            </div>
          </template>
        </VirtualTree>
        <div v-else class="h-100 flex align-center justify-center">
          <VEmpty :description="$t('packages_ldp_source_empty_text')" />
        </div>
      </div>
    </div>
  </div>
</template>

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
