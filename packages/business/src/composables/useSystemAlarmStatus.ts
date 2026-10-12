import {
  getSystemNotificationStatus,
  type SystemNotificationStatus,
} from '@tap/api/src/core/alarm'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  toValue,
  watch,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

export interface SystemAlarmStatusContext {
  status: Readonly<Ref<SystemNotificationStatus | undefined>>
  error: Readonly<Ref<boolean>>
  loading: Readonly<Ref<boolean>>
  retry: () => void
}

export const systemAlarmStatusKey: InjectionKey<SystemAlarmStatusContext> =
  Symbol('systemAlarmStatus')

export function useSystemAlarmStatus(
  entityId: MaybeRefOrGetter<string | undefined>,
  entityKind: 'task' | 'inspect' = 'task',
) {
  const status = shallowRef<SystemNotificationStatus>()
  const error = ref(false)
  const loading = ref(false)
  const resolvedEntityId = computed(() => toValue(entityId))
  let lastRequestAt = 0
  let requestVersion = 0

  async function refresh(force = false) {
    if (!force && Date.now() - lastRequestAt < 1000) return

    lastRequestAt = Date.now()
    const version = ++requestVersion
    const requestedId = resolvedEntityId.value
    loading.value = true
    try {
      const result = await getSystemNotificationStatus(
        requestedId
          ? { [entityKind === 'inspect' ? 'inspectId' : 'taskId']: requestedId }
          : {},
      )
      if (version !== requestVersion) return
      status.value = result
      error.value = false
    } catch {
      if (version === requestVersion) error.value = true
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  function refreshWhenVisible() {
    if (document.visibilityState === 'visible') refresh()
  }

  onMounted(() => {
    refresh(true)
    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('focus', refreshWhenVisible)
    document.removeEventListener('visibilitychange', refreshWhenVisible)
    requestVersion++
  })

  watch(resolvedEntityId, () => {
    requestVersion++
    status.value = undefined
    error.value = false
    lastRequestAt = 0
    refresh(true)
  })

  const context: SystemAlarmStatusContext = {
    status,
    error,
    loading,
    retry: () => {
      refresh(true)
    },
  }
  provide(systemAlarmStatusKey, context)

  return {
    ...context,
  }
}
