import { fetchConnections } from '@tap/api/src/core/connections'
import { escapeRegExp } from 'lodash-es'
import { computed, ref } from 'vue'
import type { ScrollbarDirection } from 'element-plus'

export function useFetchConnections() {
  const pageSize = 20

  const connectionQuery = ref('')
  const connections = ref([])
  const connectionsLoading = ref(false)
  const connectionsCurrentPage = ref(1)
  const connectionsTotal = ref(0)

  const connectionsTotalPage = computed(() =>
    Math.ceil(connectionsTotal.value / pageSize),
  )

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
  return {
    runFetchConnections,
    runFetchMoreConnections,
    connectionQuery,
    connections,
    connectionsLoading,
    connectionsCurrentPage,
    connectionsTotal,
  }
}
