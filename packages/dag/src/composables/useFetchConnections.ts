import { fetchConnections } from '@tap/api/src/core/connections'
import { fetchMetadataInstances } from '@tap/api/src/core/metadata-instances'
import { debounce, escapeRegExp } from 'lodash-es'
import { computed, reactive, ref, shallowRef } from 'vue'
import { useDataflowStore } from '../stores/dataflow.store'
import type { ScrollbarDirection } from 'element-plus'

function calcMatchScore(name, keyword) {
  if (!name || !keyword) return 0

  const n = name.toLowerCase()
  const k = keyword.toLowerCase()

  if (n === k) return 3
  if (n.startsWith(k)) return 2
  if (n.includes(k)) return 1

  return 0
}

interface TableListItem {
  id: string
  name: string
  comment?: string
  meta_type?: string
  sourceName?: string
  sourceId?: string
}

export function useFetchConnections() {
  const pageSize = 20

  const dataflowStore = useDataflowStore()

  const connectionQuery = ref('')
  const connections = ref([])
  const connectionsLoading = ref(false)
  const connectionsCurrentPage = ref(1)
  const connectionsTotal = ref(0)
  const currentConnectionId = ref('')
  const currentConnection = shallowRef(null)
  const connectionWhere = shallowRef({})
  let fetchConnectionsAbortController: AbortController | null = null
  let fetchTablesAbortController: AbortController | null = null
  const tableState = reactive({
    query: '',
    currentPage: 1,
    pageSize: 20,
    total: 0,
    items: [],
    loading: false,
  })
  const tables = ref<TableListItem[]>([])

  const connectionsTotalPage = computed(() =>
    Math.ceil(connectionsTotal.value / pageSize),
  )

  const tableTotalPage = computed(() =>
    Math.ceil(tableState.total / tableState.pageSize),
  )

  const handleFetchConnections = async () => {
    fetchConnectionsAbortController?.abort()
    fetchConnectionsAbortController = new AbortController()

    connectionsLoading.value = true
    const params = {
      page: connectionsCurrentPage.value,
      size: pageSize,
      order: ['status DESC', 'name ASC'],
      where: {
        createType: {
          $ne: 'System',
        },
        ...connectionWhere.value,
      },
    }
    const query = escapeRegExp(connectionQuery.value.trim())

    if (query) {
      params.where.name = { like: query, options: 'i' }
    }

    const data = await fetchConnections(params, {
      signal: fetchConnectionsAbortController.signal,
    }).finally(() => {
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

  const runFetchConnections = async (where: any = {}) => {
    connectionWhere.value = where
    connectionsCurrentPage.value = 1
    const items = await handleFetchConnections()
    connections.value = items
  }

  const runFetchMoreConnections = async (direction: ScrollbarDirection) => {
    if (
      direction !== 'bottom' ||
      connectionsCurrentPage.value >= connectionsTotalPage.value ||
      connectionsLoading.value
    )
      return

    connectionsCurrentPage.value++
    const items = await handleFetchConnections()
    connections.value.push(...items)
  }

  const handleFetchTables = async () => {
    // if (!currentConnectionId.value) return

    const sourceId = currentConnectionId.value || undefined

    const params = {
      page: tableState.currentPage,
      size: tableState.pageSize,
      where: {
        meta_type: {
          in: ['collection', 'table', 'view'],
        },
        is_deleted: false,
        sourceType: 'SOURCE',
        'source.id': sourceId,
        taskId: dataflowStore.dataflow.id,
        original_name: {
          neq: '',
        },
      },
      fields: {
        id: true,
        source: true,
        original_name: true,
        meta_type: true,
      },
      // order: ['original_name ASC'],
    }

    const txt = escapeRegExp(tableState.query)

    if (txt) {
      params.where.original_name = { like: txt, options: 'i' }
      params.fields.source = !sourceId
    }

    fetchTablesAbortController?.abort()
    fetchTablesAbortController = new AbortController()

    tableState.loading = true

    const data = await fetchMetadataInstances(params, {
      signal: fetchTablesAbortController.signal,
    }).finally(() => {
      tableState.loading = false
    })

    tableState.total = data.total

    return data.items
      .sort((a, b) => {
        const scoreA = calcMatchScore(a.original_name, txt)
        const scoreB = calcMatchScore(b.original_name, txt)

        if (scoreA !== scoreB) {
          return scoreB - scoreA // 分高的排前面
        }

        // 同分兜底排序（很重要，避免列表抖动）
        return a.original_name.localeCompare(b.original_name)
      })
      .map((tb) => ({
        id: tb.id,
        name: tb.original_name,
        comment: tb.comment,
        meta_type: tb.meta_type,
        sourceName: tb.source?.name,
        sourceId: tb.source?.id,
      }))
  }

  const _fetchTablesDebounced = debounce(async () => {
    tableState.currentPage = 1
    const items = await handleFetchTables()
    tables.value = items
  }, 200)

  const runFetchTables = () => {
    fetchTablesAbortController?.abort()
    _fetchTablesDebounced()
  }

  const runFetchMoreTables = async (direction: ScrollbarDirection) => {
    if (
      direction !== 'bottom' ||
      tableState.currentPage >= tableTotalPage.value ||
      tableState.loading
    )
      return

    tableState.currentPage++
    const items = await handleFetchTables()
    tables.value.push(...items)
  }

  const handleSelectConnection = (item) => {
    currentConnectionId.value = item.id
    currentConnection.value = item
    tables.value = []
    runFetchTables()
  }

  const handleUnselectConnection = () => {
    currentConnectionId.value = ''
    currentConnection.value = null
    tableState.query = ''
    tables.value = []
  }

  return {
    runFetchConnections,
    runFetchMoreConnections,
    connectionQuery,
    connections,
    connectionsLoading,
    connectionsCurrentPage,
    connectionsTotal,
    connectionsTotalPage,
    tableState,
    tables,
    currentConnectionId,
    currentConnection,
    runFetchTables,
    runFetchMoreTables,
    handleSelectConnection,
    handleUnselectConnection,
  }
}
