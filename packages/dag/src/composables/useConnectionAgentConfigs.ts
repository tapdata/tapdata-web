import { fetchConnections } from '@tap/api/src/core/connections'
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

type ConnectionAgentConfig = {
  accessNodeType?: string
  accessNodeProcessId?: string
  accessNodeProcessIdList?: string[]
  trueAccessNodeProcessIdList?: string[]
}

export function useConnectionAgentConfigs(connectionIds: Ref<string[]>) {
  const connectionAgentConfigs = ref<Record<string, ConnectionAgentConfig>>({})
  let requestSequence = 0

  const refreshConnectionAgentConfigs = async () => {
    const ids = [...new Set(connectionIds.value.filter(Boolean))]
    const requestId = ++requestSequence

    if (!ids.length) {
      connectionAgentConfigs.value = {}
      return
    }

    try {
      const { items = [] } = await fetchConnections({
        where: { id: { $in: ids } },
        fields: {
          id: 1,
          accessNodeType: 1,
          accessNodeProcessId: 1,
          accessNodeProcessIdList: 1,
          trueAccessNodeProcessIdList: 1,
        },
        size: ids.length,
      })

      if (requestId !== requestSequence) return

      connectionAgentConfigs.value = items.reduce(
        (configs: Record<string, ConnectionAgentConfig>, connection: any) => {
          const id = connection.id || connection._id
          if (id) {
            const config: ConnectionAgentConfig = {}
            if (connection.accessNodeType !== undefined) {
              config.accessNodeType = connection.accessNodeType
            }
            if (connection.accessNodeProcessId !== undefined) {
              config.accessNodeProcessId = connection.accessNodeProcessId
            }
            if (
              connection.trueAccessNodeProcessIdList !== undefined ||
              connection.accessNodeProcessIdList !== undefined
            ) {
              config.accessNodeProcessIdList =
                connection.trueAccessNodeProcessIdList ||
                connection.accessNodeProcessIdList ||
                []
            }
            configs[id] = config
          }
          return configs
        },
        {},
      )
    } catch {
      // Keep the last successful snapshot; task save validation remains authoritative.
    }
  }

  const refreshWhenVisible = async () => {
    if (document.visibilityState === 'visible') {
      await refreshConnectionAgentConfigs()
    }
  }

  watch(connectionIds, refreshConnectionAgentConfigs, {
    deep: true,
    immediate: true,
  })

  onMounted(() => {
    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('focus', refreshWhenVisible)
    document.removeEventListener('visibilitychange', refreshWhenVisible)
    requestSequence += 1
  })

  return { connectionAgentConfigs, refreshConnectionAgentConfigs }
}
