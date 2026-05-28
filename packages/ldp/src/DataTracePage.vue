<script setup lang="ts">
import { getConnectionNoSchema } from '@tap/api/src/core/connections'
import {
  getBloodlineDiagram,
  getChangeLog,
  getTraceData,
  type BloodlineDiagramData,
} from '@tap/api/src/core/data-trace'
import { fetchMetadataInstances } from '@tap/api/src/core/metadata-instances'
import { DatabaseIcon } from '@tap/business/src/components/DatabaseIcon'
import { makeStatusAndDisabled } from '@tap/business/src/shared'
import { BaseFieldSelect as FieldSelect, mapFieldsData } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import { Background } from '@vue-flow/background'
import { useVueFlow, VueFlow, type Node } from '@vue-flow/core'
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { useRoute, useRouter } from 'vue-router'
import PillFilterBuilder, {
  type FilterRow,
} from './components/PillFilterBuilder.vue'
import TableEdge from './components/TableEdge.vue'
import TraceNode from './components/TraceNode.vue'
import { useLayout } from './composables/useLayout'
import 'vue-json-pretty/lib/styles.css'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// ─── Props (fallback to route query) ───
const props = defineProps<{
  connectionId?: string
  tableName?: string
}>()

const connectionId = computed(
  () => props.connectionId || (route.query.connectionId as string) || '',
)
const tableName = computed(
  () => props.tableName || (route.query.tableName as string) || '',
)

// ─── Connection info (fetched via API) ───
const connectionInfo = ref<{ name?: string; pdkHash?: string }>({})
const connectionName = computed(() => connectionInfo.value.name || '')
const pdkHash = computed(() => connectionInfo.value.pdkHash || '')

async function fetchConnectionInfo() {
  const id = connectionId.value
  if (!id) return
  try {
    const data = await getConnectionNoSchema(id)
    if (data) {
      connectionInfo.value = { name: data.name, pdkHash: data.pdkHash }
    }
  } catch (error) {
    console.error('Failed to fetch connection info', error)
  }
}

// ─── Vue Flow ───
const { fitView } = useVueFlow()
const { layout } = useLayout()

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'dataConsole' })
  }
}

interface OplogEntry {
  key: string
  value: any
  type: string
  children?: OplogEntry[]
}

// ─── Reactive Data (populated via API) ───
const fieldOptions = ref<any[]>([])
const fieldLoading = ref(false)
const flowNodePositions = ref<Record<string, { x: number; y: number }>>({})
const oplogEntries = ref<OplogEntry[]>([])
const bloodlineData = ref<BloodlineDiagramData | null>(null)
const bloodlineLoading = ref(false)

// ─── State ───
const filterMode = ref<'builder' | 'mql'>('builder')
const filterRows = ref<FilterRow[]>([{ field: '', operator: '=', value: '' }])
const mqlJson = ref('')
const trackedFields = ref<string[]>([])
const trackedFieldInput = ref('')
const selectedNodeId = ref<string | null>(null)
const tracing = ref(false)
const traceData = ref<Record<string, Record<string, any> | null> | null>(null)
const nodeStatus = ref<Record<string, string>>({}) // nodeId -> 'idle' | 'loading' | 'ok' | 'error'
const rightTab = ref<'table' | 'json' | 'changelog'>('json')
const visibleColumns = ref<string[]>([])
const fieldFilterOpen = ref(false)
let traceAbortController: AbortController | null = null

// ─── Change Log State ───
const CHANGELOG_LIMIT = 20
const CHANGELOG_MAX_RANGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const now = Date.now()
const changeLogTimeRange = ref<[number, number] | null>([
  now - 30 * 60 * 1000,
  now,
])

const changeLogShortcuts = computed(() => [
  {
    text: t('packages_ldp_trace_changelog_shortcut_1h'),
    value: (): [Date, Date] => {
      const end = new Date()
      const start = new Date(end.getTime() - 60 * 60 * 1000)
      return [start, end]
    },
  },
  {
    text: t('packages_ldp_trace_changelog_shortcut_1d'),
    value: (): [Date, Date] => {
      const end = new Date()
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
      return [start, end]
    },
  },
  {
    text: t('packages_ldp_trace_changelog_shortcut_3d'),
    value: (): [Date, Date] => {
      const end = new Date()
      const start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000)
      return [start, end]
    },
  },
])

function disabledChangeLogDate(date: Date) {
  if (!changeLogTimeRange.value) return false
  // No future dates
  if (date.getTime() > Date.now()) return true
  return false
}

function handleChangeLogTimeChange(val: [number, number] | null) {
  if (!val) return
  const [start, end] = val
  if (end - start > CHANGELOG_MAX_RANGE_MS) {
    ElMessage.warning(t('packages_ldp_trace_changelog_max_range'))
    // Clamp end to start + 7 days
    changeLogTimeRange.value = [start, start + CHANGELOG_MAX_RANGE_MS]
  }
}
const changeLogs = ref<Record<string, any>[]>([])
const changeLogLoading = ref(false)
const changeLogLastKey = ref(0)
const changeLogHasMore = ref(true)

const filterModeOptions = computed(() => [
  { label: t('packages_ldp_trace_builder'), value: 'builder' },
  { label: t('packages_ldp_trace_mql_json'), value: 'mql' },
])
const rightTabOptions = computed(() => [
  { label: t('packages_ldp_trace_tab_table'), value: 'table' },
  { label: t('packages_ldp_trace_tab_json'), value: 'json' },
  { label: t('packages_ldp_trace_tab_changelog'), value: 'changelog' },
])

// ─── Computed ───
const selectedNode = computed(() =>
  flowNodes.value.find((n) => n.id === selectedNodeId.value),
)

// Whether the selected node is the target trace table (the one user entered from)
const isTargetTraceNode = computed(() => {
  if (!selectedNode.value) return false
  const d = selectedNode.value.data
  return d?.connectionId === connectionId.value && d?.table === tableName.value
})

const currentNodeData = computed(() => {
  if (!selectedNodeId.value || !traceData.value) return null
  const nodeTrace = traceData.value[selectedNodeId.value]
  const records = nodeTrace?.traceValue?.currentRecords
  return records?.length ? records : null
})

const downstreamNodeData = computed(() => {
  if (!selectedNodeId.value || !traceData.value || isTargetTraceNode.value)
    return null
  const nodeTrace = traceData.value[selectedNodeId.value]
  const records = nodeTrace?.traceValue?.downStreamRecords
  return records?.length ? records : null
})

const allDataKeys = computed(() => {
  const keys = new Set<string>()
  const addKeys = (records: any[] | null) => {
    if (records)
      records.forEach((r) => Object.keys(r).forEach((k) => keys.add(k)))
  }
  addKeys(currentNodeData.value)
  addKeys(downstreamNodeData.value)
  return [...keys]
})

const displayColumns = computed(() => {
  if (visibleColumns.value.length === 0) return allDataKeys.value
  return allDataKeys.value.filter((k) => visibleColumns.value.includes(k))
})

// ─── Methods ───
function addTrackedField(field: string) {
  if (field && !trackedFields.value.includes(field)) {
    trackedFields.value.push(field)
  }
  trackedFieldInput.value = ''
}

function removeTrackedField(field: string) {
  trackedFields.value = trackedFields.value.filter((f) => f !== field)
}

function isTrackedColumn(col: string) {
  return trackedFields.value.includes(col)
}

function toggleTrackedColumn(col: string) {
  if (isTrackedColumn(col)) {
    removeTrackedField(col)
  } else {
    addTrackedField(col)
  }
}

function selectAllColumns() {
  visibleColumns.value = [...allDataKeys.value]
}

function deselectAllColumns() {
  visibleColumns.value = []
}

function selectNode(id: string) {
  selectedNodeId.value = id
  visibleColumns.value = []
}

// ─── Bloodline Diagram (computed from bloodlineData) ───
const flowNodes = computed<Node[]>(() => {
  if (!bloodlineData.value) return []
  return bloodlineData.value.dag.nodes.map((node) => {
    const task = Object.values(node.attrs)[0] || {}
    const pos = flowNodePositions.value[node.id]
    return {
      id: node.id,
      type: 'trace',
      position: pos || { x: 0, y: 0 },
      data: {
        table: node.table,
        connectionName: node.connectionName,
        pdkHash: node.pdkHash,
        connectionId: node.connectionId,
        status: nodeStatus.value[node.id] || 'idle',
        selected: selectedNodeId.value === node.id,
        ...task,
      },
    }
  })
})

const flowEdges = computed(() => {
  if (!bloodlineData.value) return []
  return bloodlineData.value.dag.edges.map((edge: any) => {
    const tasks: Task[] = edge.attrs.tasks
      ? Object.values(edge.attrs.tasks)
          .map((task: any) => {
            task = makeStatusAndDisabled(task)
            return task
          })
          .sort((a: any, b: any) => {
            if (a.status === 'running' && b.status !== 'running') return -1
            if (a.status !== 'running' && b.status === 'running') return 1
            return 0
          })
      : []

    return {
      id: `${edge.source}_${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'table',
      animated: tasks[0]?.status === 'running',
      data: {
        tasks,
      },
    }
  })
})

console.log('flowEdges', flowEdges)

async function fetchBloodline() {
  if (!connectionId.value || !tableName.value) return
  bloodlineLoading.value = true
  try {
    const data = await getBloodlineDiagram({
      connectionId: connectionId.value,
      table: tableName.value,
      trackedFields: trackedFields.value.length
        ? trackedFields.value
        : undefined,
    })
    // Reset cached state from previous diagram
    traceData.value = null
    nodeStatus.value = {}
    selectedNodeId.value = null
    flowNodePositions.value = {}

    // Set new source data — flowNodes/flowEdges are computed from this
    bloodlineData.value = data

    // Prefill filter rows with targetTableUpdateFields
    if (data.targetTableUpdateFields?.length) {
      filterRows.value = data.targetTableUpdateFields.map((field) => ({
        field,
        operator: '=',
        value: '',
      }))
    }

    // Auto-select the current trace table node
    const currentNode = data.dag.nodes.find(
      (n) =>
        n.connectionId === connectionId.value && n.table === tableName.value,
    )
    if (currentNode) {
      selectedNodeId.value = currentNode.id
    }

    nextTick(() => handleLayoutGraph())
  } catch (error) {
    console.error('Failed to fetch bloodline diagram', error)
  } finally {
    bloodlineLoading.value = false
  }
}

function handleLayoutGraph() {
  const layouted = layout(flowNodes.value, flowEdges.value, 'LR')
  const positions: Record<string, { x: number; y: number }> = {}
  for (const node of layouted) {
    positions[node.id] = node.position
  }
  flowNodePositions.value = positions
  nextTick(() => fitView())
}

// ─── Fields Loading ───
async function fetchFields() {
  if (!connectionId.value || !tableName.value) return
  fieldLoading.value = true
  try {
    const data = await fetchMetadataInstances({
      page: 1,
      size: 1,
      where: {
        'source.id': connectionId.value,
        meta_type: { in: ['collection', 'table'] },
        is_deleted: false,
        sourceType: 'SOURCE',
        original_name: tableName.value,
      },
      fields: {
        original_name: true,
        fields: true,
        indices: true,
      },
    })
    const table = data?.items?.[0]
    if (table) {
      const { fields: rawFields } = mapFieldsData(table)
      fieldOptions.value = rawFields
    }
  } catch (error) {
    console.error('Failed to fetch fields', error)
  } finally {
    fieldLoading.value = false
  }
}

// ─── Trace Data (Streaming) ───
function handleTrace() {
  if (traceAbortController) {
    traceAbortController.abort()
  }

  tracing.value = true
  traceData.value = {}

  // Set all nodes to loading
  const statuses: Record<string, string> = {}
  flowNodes.value.forEach((n) => {
    statuses[n.id] = 'loading'
  })
  nodeStatus.value = statuses

  // Build filter
  let filters: Record<string, any> | undefined
  if (filterMode.value === 'builder') {
    const custom = filterRows.value.map((row) => {
      if (row.field && row.value) {
        return {
          key: row.field,
          value: row.value,
        }
      }
    })
    if (custom.length) filters = { custom }
  } else {
    try {
      filters = JSON.parse(mqlJson.value)
    } catch {
      // invalid JSON, ignore
    }
  }

  traceAbortController = getTraceData(
    { connectionId: connectionId.value, table: tableName.value, filters },
    {
      onNodeData: (nodeId, data) => {
        traceData.value = { ...traceData.value, [nodeId]: data }
        const hasData = !!data?.traceValue?.currentRecords?.length
        console.log('nodeId', nodeId, traceData.value[nodeId])
        nodeStatus.value = {
          ...nodeStatus.value,
          [nodeId]: hasData ? 'ok' : 'error',
        }
      },
      onDone: () => {
        tracing.value = false
        // Clear any remaining loading states
        const updated = { ...nodeStatus.value }
        for (const id of Object.keys(updated)) {
          if (updated[id] === 'loading') {
            updated[id] = 'error'
          }
        }
        nodeStatus.value = updated
        console.log('done', selectedNodeId.value, traceData)
      },
      onError: (error) => {
        tracing.value = false
        // Clear all loading states on error
        const updated = { ...nodeStatus.value }
        for (const id of Object.keys(updated)) {
          if (updated[id] === 'loading') {
            updated[id] = 'error'
          }
        }
        nodeStatus.value = updated
        ElMessage.error(error || 'Trace failed')
      },
    },
  )
}

// Watch trackedFields to refetch bloodline diagram
watch(trackedFields, () => fetchBloodline())

function handleCopyJson(data: any) {
  copyToClipboard(JSON.stringify(data, null, 2))
  ElMessage.success('Copied to clipboard')
}

// ─── Change Log ───
async function fetchChangeLogs(reset = false) {
  if (!selectedNode.value) return
  if (!changeLogTimeRange.value) return
  if (changeLogLoading.value) return

  const nodeData = traceData.value?.[selectedNodeId.value!]
  const queryConditions = nodeData?.traceValue?.queryConditions || []

  if (reset) {
    changeLogs.value = []
    changeLogLastKey.value = 0
    changeLogHasMore.value = true
  }

  changeLogLoading.value = true
  try {
    const res = await getChangeLog({
      table: selectedNode.value.data.table,
      connectionId: selectedNode.value.data.connectionId,
      startTime: changeLogTimeRange.value[0],
      endTime: changeLogTimeRange.value[1],
      queryConditions,
      limit: CHANGELOG_LIMIT,
      lastKey: changeLogLastKey.value,
    })
    const logs = res?.logs || []
    changeLogs.value = [...changeLogs.value, ...logs]
    if (logs.length > 0) {
      changeLogLastKey.value = logs.at(-1).key
    }
    changeLogHasMore.value = logs.length >= CHANGELOG_LIMIT

    // If content doesn't fill the container, auto-load more
    if (changeLogHasMore.value) {
      nextTick(() => {
        const wrap = changeLogScrollRef.value?.wrapRef as
          | HTMLElement
          | undefined
        if (wrap && wrap.scrollHeight <= wrap.clientHeight) {
          changeLogLoading.value = false
          fetchChangeLogs()
          return
        }
      })
    }
  } catch (error: any) {
    ElMessage.error(error?.message || 'Failed to fetch change logs')
  } finally {
    changeLogLoading.value = false
  }
}

const changeLogScrollRef =
  ref<InstanceType<(typeof import('element-plus'))['ElScrollbar']>>()

function handleLoadMoreChangeLogs() {
  if (changeLogHasMore.value && !changeLogLoading.value) {
    fetchChangeLogs()
  }
}

// Auto-fetch change logs when switching to changelog tab or changing node while on changelog tab
watch([rightTab, selectedNodeId], ([tab]) => {
  if (tab === 'changelog') {
    fetchChangeLogs(true)
  }
})

function formatLogTime(timestamp: number) {
  const d = new Date(timestamp)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}

const OP_LABELS: Record<string, string> = {
  i: 'INSERT',
  u: 'UPDATE',
  d: 'DELETE',
}

/**
 * Compute diff between before/after objects.
 * Returns sets of changed/added/removed top-level keys.
 */
function computeDiffKeys(
  before: Record<string, any> | null,
  after: Record<string, any> | null,
) {
  const changed = new Set<string>()
  const added = new Set<string>()
  const removed = new Set<string>()
  const bKeys = Object.keys(before || {})
  const aKeys = Object.keys(after || {})

  for (const key of bKeys) {
    if (after == null || !(key in after)) {
      removed.add(key)
    } else if (JSON.stringify(before![key]) !== JSON.stringify(after[key])) {
      changed.add(key)
    }
  }
  for (const key of aKeys) {
    if (before == null || !(key in before)) {
      added.add(key)
    }
  }
  return { changed, added, removed }
}

/**
 * Build a nodeClassName function for VueJsonPretty diff highlighting.
 * Highlights rows whose top-level key is in the diff set.
 */
function makeDiffNodeClass(
  diffKeys: { changed: Set<string>; added: Set<string>; removed: Set<string> },
  side: 'before' | 'after',
) {
  return (node: any) => {
    // node.key is the field name; only highlight top-level content nodes (level === 1)
    if (node.level !== 1 || node.type !== 'content') return ''
    const key = node.key
    if (!key) return ''
    if (diffKeys.changed.has(key)) return 'vjp-diff-changed'
    if (side === 'before' && diffKeys.removed.has(key))
      return 'vjp-diff-removed'
    if (side === 'after' && diffKeys.added.has(key)) return 'vjp-diff-added'
    return ''
  }
}

// ─── Diff scroll sync ───
const diffScrollPairs = new Map<
  number,
  { before?: HTMLElement; after?: HTMLElement }
>()

function setDiffScrollRef(
  el: HTMLElement | null,
  logKey: number,
  side: 'before' | 'after',
) {
  if (!el) {
    // cleanup on unmount
    const pair = diffScrollPairs.get(logKey)
    if (pair) {
      delete pair[side]
      if (!pair.before && !pair.after) diffScrollPairs.delete(logKey)
    }
    return
  }
  if (!diffScrollPairs.has(logKey)) diffScrollPairs.set(logKey, {})
  diffScrollPairs.get(logKey)![side] = el
}

function handleDiffScroll(
  _event: Event,
  logKey: number,
  side: 'before' | 'after',
) {
  const el = _event.target as HTMLElement
  const pair = diffScrollPairs.get(logKey)
  if (!pair) return
  const otherEl = side === 'before' ? pair.after : pair.before
  if (!otherEl || (otherEl as any).__syncing) return
  ;(el as any).__syncing = true
  otherEl.scrollTop = el.scrollTop
  otherEl.scrollLeft = el.scrollLeft
  requestAnimationFrame(() => {
    ;(el as any).__syncing = false
  })
}

// Oplog expansion state
const expandedOplogKeys = ref<Set<string>>(new Set())
function toggleOplogExpand(path: string) {
  if (expandedOplogKeys.value.has(path)) {
    expandedOplogKeys.value.delete(path)
  } else {
    expandedOplogKeys.value.add(path)
  }
}
function isOplogExpanded(path: string) {
  return expandedOplogKeys.value.has(path)
}

function onNodeSelect(nodeId: string) {
  selectNode(nodeId)
}

function handleClickName(row: any) {
  let routeName

  if (!['edit', 'wait_start'].includes(row.status)) {
    routeName = row.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor'
  } else {
    routeName = row.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor'
  }

  openRoute({
    name: routeName,
    params: {
      id: row.id,
    },
  })
}

function openRoute(route, newTab = true) {
  if (newTab) {
    window.open(router.resolve(route).href)
  } else {
    router.push(route)
  }
}

// ─── Lifecycle ───
onMounted(() => {
  fetchConnectionInfo()
  fetchBloodline()
  fetchFields()
})

onBeforeUnmount(() => {
  if (traceAbortController) {
    traceAbortController.abort()
  }
})

// ─── Sub-components ───
const OplogTreeNode = defineComponent({
  name: 'OplogTreeNode',
  props: {
    entries: { type: Array as PropType<OplogEntry[]>, required: true },
    depth: { type: Number, default: 0 },
    parentPath: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      props.entries.map((entry, idx) => {
        const path = props.parentPath
          ? `${props.parentPath}.${entry.key}`
          : entry.key
        const hasChildren = entry.children && entry.children.length > 0
        const expanded = isOplogExpanded(path)
        const displayValue = hasChildren
          ? entry.type === 'Array'
            ? `Array(${entry.children!.length})`
            : `{${entry.children!.length} fields}`
          : String(entry.value)

        return h('div', { key: path }, [
          h(
            'div',
            {
              class: ['oplog-row', { 'oplog-row--expandable': hasChildren }],
              style: { paddingLeft: `${props.depth * 20 + 12}px` },
              onClick: () => hasChildren && toggleOplogExpand(path),
            },
            [
              h('span', { class: 'oplog-chevron' }, [
                hasChildren
                  ? h('i', {
                      class: ['lucide-icon', expanded ? 'expanded' : ''],
                    })
                  : h('span', { class: 'oplog-chevron-placeholder' }),
              ]),
              h('span', { class: 'oplog-key' }, entry.key),
              h('span', { class: 'oplog-value' }, displayValue),
              h('span', { class: 'oplog-type' }, entry.type),
            ],
          ),
          expanded && hasChildren
            ? h(OplogTreeNode, {
                entries: entry.children!,
                depth: props.depth + 1,
                parentPath: path,
              })
            : null,
        ])
      })
  },
})
</script>

<template>
  <div class="data-trace-page">
    <!-- ═══ HEADER ═══ -->
    <header class="trace-header">
      <div class="trace-header__left">
        <button class="trace-back-btn" @click="handleBack">
          <el-icon size="18"><i-lucide-arrow-left /></el-icon>
        </button>
        <h1 class="trace-title">Data Trace</h1>
        <!-- Breadcrumb: connection / table -->
        <nav class="trace-breadcrumb">
          <span class="trace-breadcrumb__item">
            <DatabaseIcon
              v-if="pdkHash"
              class="trace-breadcrumb__db-icon"
              :pdk-hash="pdkHash"
              :size="18"
            />
            <el-icon v-else size="14" class="trace-breadcrumb__icon">
              <i-lucide-database />
            </el-icon>
            <span>{{ connectionName || connectionId }}</span>
          </span>
          <span class="trace-breadcrumb__sep">/</span>
          <span class="trace-breadcrumb__item trace-breadcrumb__item--current">
            <el-icon size="14" class="trace-breadcrumb__icon">
              <i-lucide-table />
            </el-icon>
            <span>{{ tableName }}</span>
          </span>
        </nav>
      </div>
    </header>

    <!-- ═══ CONTROL PANEL ═══ -->
    <section class="trace-control">
      <div class="trace-control__top">
        <h2 class="trace-control__title">
          <el-icon size="14"><i-lucide-filter /></el-icon>
          {{ t('packages_ldp_trace_data_filters') }}
          <span class="trace-control__required">*</span>
        </h2>
        <!-- Filter Mode Toggle -->
        <el-segmented
          v-model="filterMode"
          :options="filterModeOptions"
          size="default"
        >
          <template #default="{ item }">
            <div class="flex align-center gap-1">
              <el-icon size="14">
                <i-lucide-layers v-if="item.value === 'builder'" />
                <i-lucide-braces v-else />
              </el-icon>
              <span>{{ item.label }}</span>
            </div>
          </template>
        </el-segmented>

        <!-- Trace Button -->
        <el-button
          type="primary"
          class="trace-action-btn"
          :loading="tracing"
          @click="handleTrace"
        >
          <el-icon v-if="!tracing" class="mr-1"><i-lucide-search /></el-icon>
          {{ t('packages_ldp_trace_btn') }}
        </el-button>
      </div>

      <!-- Builder Mode (Inline Pill) -->
      <PillFilterBuilder
        v-if="filterMode === 'builder'"
        v-model="filterRows"
        :fields="fieldOptions"
        class="mt-3"
      />

      <!-- MQL Mode -->
      <div v-else class="trace-mql">
        <textarea
          v-model="mqlJson"
          class="trace-mql__textarea"
          spellcheck="false"
          rows="4"
        />
      </div>

      <!-- Tracked Fields -->
      <div class="trace-tracked-section flex align-center">
        <h2 class="trace-control__title">
          <el-icon size="14"><i-lucide-scan-eye /></el-icon>
          {{ t('packages_ldp_trace_tracked_fields') }}
        </h2>
        <FieldSelect
          v-model="trackedFields"
          filterable
          multiple
          clearable
          item-label="field_name"
          item-value="field_name"
          :options="fieldOptions"
          :loading="fieldLoading"
          :placeholder="t('packages_ldp_trace_add_field')"
          class="trace-tracked__select w-auto"
        />
      </div>
    </section>

    <!-- ═══ WORKSPACE ═══ -->
    <div class="trace-workspace">
      <!-- LEFT: Lineage Graph (Vue Flow) -->
      <aside class="trace-lineage">
        <div id="table-lineage-graph" class="trace-lineage__canvas">
          <div class="trace-lineage__header rounded-xl">
            <el-icon size="14"><i-lucide-layers /></el-icon>
            <span>{{ t('packages_ldp_trace_data_lineage') }}</span>
          </div>
          <svg style="position: absolute; left: -1000px; top: 0">
            <defs>
              <marker
                id="marker-arrow"
                viewBox="-10 -10 20 20"
                refX="0"
                refY="0"
                markerWidth="12.5"
                markerHeight="12.5"
                markerUnits="strokeWidth"
                orient="auto-start-reverse"
              >
                <polyline
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                  points="-5,-4 0,0 -5,4"
                  style="stroke: context-stroke; stroke-width: 2"
                />
              </marker>
            </defs>
          </svg>
          <VueFlow
            v-loading="bloodlineLoading"
            :nodes="flowNodes"
            :edges="flowEdges"
            :apply-changes="false"
            class="trace-vue-flow"
            @nodes-initialized="handleLayoutGraph"
          >
            <Background />
            <template #node-trace="{ id, data }">
              <TraceNode
                :id="id"
                :data="data"
                :active="data.selected"
                @select="onNodeSelect"
              />
            </template>
            <template #edge-table="edge">
              <TableEdge
                :id="edge.id"
                :tasks="(edge.data.tasks ?? []) as Task[]"
                :source-x="edge.sourceX"
                :source-y="edge.sourceY"
                :target-x="edge.targetX"
                :target-y="edge.targetY"
                :source-position="edge.sourcePosition"
                :target-position="edge.targetPosition"
                :style="edge.style"
                @click-task="handleClickName"
              />
            </template>
          </VueFlow>
        </div>
      </aside>

      <!-- RIGHT: Data Result Viewer -->
      <main class="trace-result">
        <template v-if="!traceData">
          <div class="trace-empty-state">
            <el-icon size="48" class="trace-empty-state__icon"
              ><i-lucide-search-code
            /></el-icon>
            <p class="trace-empty-state__title">
              {{ t('packages_ldp_trace_no_results_title') }}
            </p>
            <p
              class="trace-empty-state__desc"
              v-html="
                t('packages_ldp_trace_no_results_desc', [
                  `<strong>${t('packages_ldp_trace_btn')}</strong>`,
                ])
              "
            />
          </div>
        </template>

        <template v-else-if="selectedNodeId">
          <!-- Toolbar (hidden when target trace node) -->
          <div class="trace-result__toolbar">
            <div class="trace-result__node-info">
              <strong>{{ selectedNode?.data?.table }}</strong>
            </div>
            <div class="trace-result__actions">
              <el-segmented v-model="rightTab" :options="rightTabOptions" />
            </div>
          </div>

          <!-- ─── JSON TAB ─── -->
          <div v-if="rightTab === 'json'" class="trace-result__body">
            <div
              :class="[
                'trace-data-pane',
                {
                  'trace-data-pane--dual':
                    !isTargetTraceNode && downstreamNodeData,
                },
              ]"
            >
              <!-- Current Node -->
              <div class="trace-json-panel">
                <div v-if="!isTargetTraceNode" class="trace-json-panel__header">
                  <span>Current ({{ selectedNode?.data?.table }})</span>
                  <el-button
                    size="small"
                    text
                    @click="handleCopyJson(currentNodeData)"
                  >
                    <el-icon class="mr-1" size="12"><i-lucide-copy /></el-icon>
                    {{ t('packages_ldp_trace_copy') }}
                  </el-button>
                </div>
                <VueJsonPretty
                  v-if="currentNodeData"
                  :data="currentNodeData"
                  show-icon
                  :show-line="false"
                  :deep="3"
                  class="trace-json-pretty"
                />
                <pre v-else class="trace-json-code trace-json-code--null">
null</pre
                >
              </div>
              <!-- Downstream Node (non-target only) -->
              <template v-if="!isTargetTraceNode && downstreamNodeData">
                <div class="trace-data-divider">
                  <el-icon size="16"><i-lucide-arrow-right /></el-icon>
                </div>
                <div class="trace-json-panel">
                  <div class="trace-json-panel__header">
                    <span>Downstream ({{ tableName }})</span>
                    <el-button
                      size="small"
                      text
                      @click="handleCopyJson(downstreamNodeData)"
                    >
                      <el-icon class="mr-1" size="12"
                        ><i-lucide-copy
                      /></el-icon>
                      {{ t('packages_ldp_trace_copy') }}
                    </el-button>
                  </div>
                  <VueJsonPretty
                    v-if="downstreamNodeData"
                    :data="downstreamNodeData"
                    show-icon
                    :show-line="false"
                    :deep="3"
                    class="trace-json-pretty"
                  />
                  <pre v-else class="trace-json-code trace-json-code--null">{{
                    t('packages_ldp_trace_no_data_comment')
                  }}</pre>
                </div>
              </template>
            </div>
          </div>

          <!-- ─── TABLE TAB ─── -->
          <div v-else-if="rightTab === 'table'" class="trace-result__body">
            <div
              :class="[
                'trace-data-pane',
                {
                  'trace-data-pane--dual':
                    !isTargetTraceNode && downstreamNodeData,
                },
              ]"
            >
              <!-- Current Node -->
              <div class="trace-data-panel">
                <div v-if="!isTargetTraceNode" class="trace-data-panel__header">
                  {{ selectedNode?.data?.table }}
                </div>
                <div v-if="!currentNodeData" class="trace-data-missing">
                  <el-icon size="20"><i-lucide-circle-x /></el-icon>
                  {{ t('packages_ldp_trace_no_data') }}
                </div>
                <div v-else class="trace-table-wrap">
                  <table class="trace-table">
                    <thead>
                      <tr>
                        <th
                          v-for="col in displayColumns"
                          :key="col"
                          :class="{ 'traced-col': isTrackedColumn(col) }"
                          @click="toggleTrackedColumn(col)"
                        >
                          <span class="trace-th-content">
                            {{ col }}
                            <el-icon
                              v-if="isTrackedColumn(col)"
                              size="10"
                              class="trace-th-pin"
                              ><i-lucide-pin
                            /></el-icon>
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, ri) in currentNodeData" :key="ri">
                        <td
                          v-for="col in displayColumns"
                          :key="col"
                          :class="{ 'traced-col': isTrackedColumn(col) }"
                        >
                          {{ row[col] ?? '—' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <!-- Downstream Node (non-target only) -->
              <template v-if="!isTargetTraceNode && downstreamNodeData">
                <div class="trace-data-divider">
                  <el-icon size="16"><i-lucide-arrow-right /></el-icon>
                </div>
                <div class="trace-data-panel">
                  <div class="trace-data-panel__header">{{ tableName }}</div>
                  <div
                    v-if="!downstreamNodeData"
                    class="trace-data-missing trace-data-missing--alert"
                  >
                    <el-icon size="20"><i-lucide-triangle-alert /></el-icon>
                    {{ t('packages_ldp_trace_data_missing') }}
                  </div>
                  <div v-else class="trace-table-wrap">
                    <table class="trace-table">
                      <thead>
                        <tr>
                          <th
                            v-for="col in displayColumns"
                            :key="col"
                            :class="{ 'traced-col': isTrackedColumn(col) }"
                          >
                            {{ col }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in downstreamNodeData" :key="ri">
                          <td
                            v-for="col in displayColumns"
                            :key="col"
                            :class="{ 'traced-col': isTrackedColumn(col) }"
                          >
                            {{ row[col] ?? '—' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- ─── CHANGE LOG TAB ─── -->
          <div v-else class="trace-result__body changelog">
            <!-- Toolbar: time range + query -->
            <div class="changelog__toolbar">
              <el-date-picker
                v-model="changeLogTimeRange"
                type="datetimerange"
                range-separator="—"
                :start-placeholder="t('packages_ldp_trace_changelog_start')"
                :end-placeholder="t('packages_ldp_trace_changelog_end')"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="x"
                :shortcuts="changeLogShortcuts"
                :disabled-date="disabledChangeLogDate"
                class="changelog__picker"
                @change="handleChangeLogTimeChange"
              />
              <el-button
                type="primary"
                :loading="changeLogLoading"
                :disabled="!changeLogTimeRange"
                @click="fetchChangeLogs(true)"
              >
                <el-icon v-if="!changeLogLoading" class="mr-1"
                  ><i-lucide-search
                /></el-icon>
                {{ t('packages_ldp_trace_changelog_query') }}
              </el-button>
            </div>

            <!-- Log list -->
            <el-scrollbar
              v-if="changeLogs.length"
              ref="changeLogScrollRef"
              class="changelog__list"
              :distance="10"
              @end-reached="handleLoadMoreChangeLogs"
            >
              <div class="changelog__list-inner">
                <div
                  v-for="log in changeLogs"
                  :key="log.key"
                  class="changelog__entry"
                >
                  <div class="changelog__entry-header">
                    <span
                      class="changelog__op"
                      :class="`changelog__op--${log.op}`"
                      >{{ OP_LABELS[log.op] || log.op }}</span
                    >
                    <span class="changelog__time">{{
                      formatLogTime(log.timestamp)
                    }}</span>
                    <span class="changelog__from">{{ log.fromTable }}</span>
                  </div>
                  <div class="changelog__entry-body">
                    <template v-if="log.before || log.after">
                      <div v-if="log.before" class="changelog__diff-panel">
                        <div
                          class="changelog__diff-label changelog__diff-label--before"
                        >
                          Before
                        </div>
                        <div
                          :ref="(el) => setDiffScrollRef(el, log.key, 'before')"
                          class="changelog__diff-scroll"
                          @scroll="
                            (e) => handleDiffScroll(e, log.key, 'before')
                          "
                        >
                          <VueJsonPretty
                            :data="log.before"
                            show-icon
                            :show-line="false"
                            :deep="2"
                            :node-selectable="() => false"
                            :render-node-key="
                              ({ node, defaultKey }) => {
                                const dk = computeDiffKeys(
                                  log.before,
                                  log.after,
                                )
                                const cls = makeDiffNodeClass(
                                  dk,
                                  'before',
                                )(node)
                                return cls
                                  ? h('span', { class: cls }, [defaultKey])
                                  : defaultKey
                              }
                            "
                            class="changelog__diff-json"
                          />
                        </div>
                      </div>
                      <div
                        v-if="log.before && log.after"
                        class="changelog__diff-arrow"
                      >
                        <el-icon size="14"><i-lucide-arrow-right /></el-icon>
                      </div>
                      <div v-if="log.after" class="changelog__diff-panel">
                        <div
                          class="changelog__diff-label changelog__diff-label--after"
                        >
                          After
                        </div>
                        <div
                          :ref="(el) => setDiffScrollRef(el, log.key, 'after')"
                          class="changelog__diff-scroll"
                          @scroll="(e) => handleDiffScroll(e, log.key, 'after')"
                        >
                          <VueJsonPretty
                            :data="log.after"
                            show-icon
                            :show-line="false"
                            :deep="2"
                            :node-selectable="() => false"
                            :render-node-key="
                              ({ node, defaultKey }) => {
                                const dk = computeDiffKeys(
                                  log.before,
                                  log.after,
                                )
                                const cls = makeDiffNodeClass(dk, 'after')(node)
                                return cls
                                  ? h('span', { class: cls }, [defaultKey])
                                  : defaultKey
                              }
                            "
                            class="changelog__diff-json"
                          />
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <!-- Loading more indicator -->
                <div v-if="changeLogLoading" class="changelog__loading">
                  <el-icon class="is-loading" size="16"
                    ><i-lucide-loader-2
                  /></el-icon>
                </div>
                <div v-else-if="!changeLogHasMore" class="changelog__no-more">
                  {{ t('packages_ldp_trace_changelog_no_more') }}
                </div>
              </div>
            </el-scrollbar>

            <!-- Empty state -->
            <div v-else-if="!changeLogLoading" class="changelog__empty">
              <el-icon size="32" class="changelog__empty-icon"
                ><i-lucide-file-clock
              /></el-icon>
              <p>{{ t('packages_ldp_trace_changelog_empty') }}</p>
            </div>

            <!-- Initial loading -->
            <div v-else class="changelog__loading changelog__loading--center">
              <el-icon class="is-loading" size="24"
                ><i-lucide-loader-2
              /></el-icon>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>

<style scoped lang="scss">
// ─── Layout ───
.data-trace-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #18181b;
}

// ─── Header ───
.trace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgb(252, 252, 252);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #e4e4e7;
  flex-shrink: 0;
  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
.trace-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid #e4e4e7;
  background: white;
  cursor: pointer;
  color: #52525b;
  transition: all 0.15s;
  &:hover {
    background: #f4f4f5;
    border-color: #a1a1aa;
  }
}
.trace-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
}
.trace-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
  font-size: 13px;
  color: #71717a;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 500;
    color: #71717a;
    transition: color 0.15s;

    &--current {
      color: #18181b;
    }
  }

  &__sep {
    color: #a1a1aa;
    flex-shrink: 0;
  }

  &__icon {
    flex-shrink: 0;
    color: inherit;
  }

  &__db-icon {
    flex-shrink: 0;
    border-radius: 4px;
  }
}

// ─── Control Panel ───
.trace-control {
  padding: 16px 24px;
  flex-shrink: 0;
  background: rgb(252, 252, 252);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #e4e4e7;
  &__title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #3f3f46;
  }
  &__required {
    color: #ef4444;
    font-size: 14px;
    line-height: 1;
  }
  &__subtitle {
    font-size: 11px;
    font-weight: 400;
    color: #a1a1aa;
    text-transform: none;
    letter-spacing: 0;
  }
  &__top {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
}

.trace-tracked-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e4e4e7;
  gap: 10px;
  flex-wrap: wrap;
}
.trace-tracked__tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.trace-tracked__tag {
  // background: #eef2ff;
  // color: #4338ca;
  // border-color: #c7d2fe;
  font-weight: 500;
  font-size: 13px;
  // :deep(.el-tag__close) {
  //   color: #818cf8;
  //   &:hover {
  //     background: #c7d2fe;
  //     color: #4338ca;
  //   }
  // }
}
.trace-tracked__select {
  width: 180px;
  flex-shrink: 0;
}
.trace-action-btn {
  border-radius: 10px;
  font-weight: 600;
}

// ─── MQL ───
.trace-mql {
  margin-top: 12px;
}
.trace-mql__textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #1e1e2e;
  color: #a6e3a1;
  border: 1px solid #313244;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
  &:focus {
    outline: 2px solid #4f46e5;
    outline-offset: -1px;
  }
}

// ─── Workspace ───
.trace-workspace {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

// ─── Lineage Panel ───
.trace-lineage {
  width: 50%;
  min-width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e4e7;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  &__canvas {
    flex: 1;
    position: relative;
    overflow: auto;
    min-height: 0;
  }
  &__header {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 600;
    color: #3f3f46;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid #e4e4e7;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    pointer-events: none;
  }
}
// ─── Vue Flow ───
.trace-vue-flow {
  width: 100%;
  height: 100%;
}

// ─── Result Panel ───
.trace-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: white;
}
.trace-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  &__icon {
    color: #d4d4d8;
    margin-bottom: 16px;
  }
  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #52525b;
    margin: 0 0 8px;
  }
  &__desc {
    font-size: 13px;
    color: #a1a1aa;
    max-width: 360px;
    margin: 0;
    line-height: 1.6;
  }
}
.trace-result__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #f4f4f5;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
}
.trace-result__node-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.trace-result__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trace-result__body {
  flex: 1;
  overflow: auto;
  padding: 16px 20px;
}

// ─── Data Pane ───
.trace-data-pane {
  display: flex;
  gap: 0;
  height: 100%;
  min-height: 200px;
  &--dual {
    .trace-data-panel,
    .trace-json-panel {
      flex: 1;
      min-width: 0;
    }
  }
}
.trace-data-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  flex-shrink: 0;
  color: #d4d4d8;
}
.trace-data-panel {
  flex: 1;
  min-width: 0;
  &__header {
    font-size: 12px;
    font-weight: 600;
    color: #52525b;
    padding: 6px 0;
    margin-bottom: 8px;
    border-bottom: 1px solid #f4f4f5;
  }
}
.trace-data-missing {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: 12px;
  background: #f4f4f5;
  color: #71717a;
  font-size: 13px;
  font-weight: 500;
  &--alert {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}

// ─── Trace Table ───
.trace-table-wrap {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #e4e4e7;
}
.trace-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  th,
  td {
    padding: 8px 12px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid #f4f4f5;
  }
  th {
    background: #fafafa;
    font-weight: 600;
    color: #52525b;
    cursor: pointer;
    position: sticky;
    top: 0;
    z-index: 1;
    user-select: none;
    &:hover {
      background: #f0f0f5;
    }
  }
  td {
    color: #3f3f46;
  }
  .traced-col {
    background: #eef2ff;
    &:is(th) {
      background: #e0e7ff;
    }
  }
}
.trace-th-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.trace-th-pin {
  color: #4f46e5;
}

// ─── Field Filter ───
.trace-field-filter {
  &__actions {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
  }
  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 240px;
    overflow: auto;
  }
}

// ─── JSON Panel ───
.trace-json-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    color: #52525b;
    padding: 6px 0;
    margin-bottom: 8px;
  }
}
.trace-json-code {
  flex: 1;
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  background: #1e1e2e;
  color: #cdd6f4;
  font-size: 12px;
  line-height: 1.7;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  overflow: auto;
  white-space: pre;
  border: 1px solid #313244;
  &--null {
    color: #f38ba8;
    font-style: italic;
  }
}
.trace-json-pretty {
  flex: 1;
  overflow: auto;
  padding: 12px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #e4e4e7;
  font-size: 12px;
}

// ─── VueJsonPretty diff highlight (whole-row via :has) ───
.changelog__diff-json {
  :deep(.vjs-tree-node:has(.vjp-diff-changed)) {
    background: #fef9c3;
    border-radius: 3px;
  }
  :deep(.vjs-tree-node:has(.vjp-diff-removed)) {
    background: #fee2e2;
    border-radius: 3px;
    .vjs-value {
      text-decoration: line-through;
      text-decoration-color: #fca5a5;
      color: #b91c1c;
    }
  }
  :deep(.vjs-tree-node:has(.vjp-diff-added)) {
    background: #dcfce7;
    border-radius: 3px;
    .vjs-value {
      color: #15803d;
    }
  }
}

// ─── Change Log ───
.changelog {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__picker {
    max-width: 380px;
  }

  &__list {
    flex: 1;
    min-height: 0;
  }

  &__list-inner {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 2px 0;
  }

  &__entry {
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    transition: box-shadow 0.15s;
    &:hover {
      box-shadow: 0 1px 4px rgb(0 0 0 / 0.06);
    }
  }

  &__entry-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px solid #f4f4f5;
    font-size: 12px;
  }

  &__op {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    &--i {
      background: #dcfce7;
      color: #15803d;
    }
    &--u {
      background: #dbeafe;
      color: #1d4ed8;
    }
    &--d {
      background: #fee2e2;
      color: #b91c1c;
    }
  }

  &__time {
    color: #71717a;
    font-size: 11px;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
  }

  &__from {
    color: #a1a1aa;
    font-size: 11px;
    margin-left: auto;
  }

  &__entry-body {
    display: flex;
    align-items: stretch;
    gap: 8px;
    padding: 10px 12px;
  }

  &__diff-panel {
    flex: 1;
    min-width: 0;
  }

  &__diff-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    &--before {
      color: #ef4444;
    }
    &--after {
      color: #22c55e;
    }
  }

  &__diff-scroll {
    overflow: auto;
    max-height: 280px;
    border-radius: 8px;
    background: #f4f4f5;
  }

  &__diff-json {
    padding: 6px 8px;
    font-size: 12px;
  }

  &__diff-arrow {
    display: flex;
    align-items: center;
    color: #a1a1aa;
    flex-shrink: 0;
    padding-top: 20px;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 12px;
    color: #a1a1aa;
    &--center {
      flex: 1;
      align-items: center;
    }
  }

  &__no-more {
    text-align: center;
    font-size: 12px;
    color: #a1a1aa;
    padding: 8px;
  }

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #a1a1aa;
    font-size: 13px;
  }

  &__empty-icon {
    color: #d4d4d8;
  }
}

// ─── Utilities ───
.mx-2 {
  margin-left: 8px;
  margin-right: 8px;
}
.mr-1 {
  margin-right: 4px;
}
.ml-1 {
  margin-left: 4px;
}
</style>
