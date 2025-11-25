import { useRafFn } from '@vueuse/core'
import { onUnmounted, ref } from 'vue'

export interface UseAnimEventOptions {
  /**
   * 空闲后保持运行时间 (ms)
   * @default 500
   */
  keepLoop?: number

  /**
   * 是否自动清理
   * @default true
   */
  autoCleanup?: boolean

  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
}

export function useAnimEvent<T extends Event = Event>(
  listener: (event: T) => void,
  options: UseAnimEventOptions = {},
) {
  const { keepLoop = 500, autoCleanup = true, enabled = true } = options

  const latestEvent = ref<T | null>(null)
  const lastFrameTime = ref(Date.now())
  const isEnabled = ref(enabled)
  const callCount = ref(0)

  const { pause, resume, isActive } = useRafFn(
    () => {
      // 检查是否启用
      if (!isEnabled.value) {
        pause()
        return
      }

      if (latestEvent.value) {
        const event = latestEvent.value
        latestEvent.value = null
        lastFrameTime.value = Date.now()
        callCount.value++
        listener(event)
      } else if (Date.now() - lastFrameTime.value >= keepLoop) {
        pause()
      }
    },
    { immediate: false },
  )

  const wrappedListener = (event: T) => {
    if (!isEnabled.value) return
    latestEvent.value = event
    if (!isActive.value) {
      resume()
    }
  }

  const enable = () => {
    isEnabled.value = true
  }

  const disable = () => {
    isEnabled.value = false
    pause()
  }

  const reset = () => {
    callCount.value = 0
    latestEvent.value = null
    lastFrameTime.value = Date.now()
  }

  const cleanup = () => {
    latestEvent.value = null
    pause()
  }

  if (autoCleanup) {
    onUnmounted(cleanup)
  }

  return {
    wrappedListener,
    isActive,
    isEnabled,
    callCount,
    enable,
    disable,
    reset,
    cleanup,
  }
}
