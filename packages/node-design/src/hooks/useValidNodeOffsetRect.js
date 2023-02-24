import { ref } from 'vue-demi'
import { requestIdle, cancelIdle } from '@tap/shared'
import ResizeObserver from 'resize-observer-polyfill'
import { useViewport } from './useViewport'
import { useEffect } from './useEffect'

const isEqualRect = (rect1, rect2) => {
  return (
    rect1?.x === rect2?.x && rect1?.y === rect2?.y && rect1?.width === rect2?.width && rect1?.height === rect2?.height
  )
}

export const useValidNodeOffsetRect = node => {
  const viewportRef = useViewport()
  const viewport = viewportRef.value
  const rectRef = ref(viewport.getValidNodeOffsetRect(node))
  const idleTaskRef = ref(null)
  const unmountRef = ref(false)
  const observerRef = ref(null)
  const element = viewport.findElementById(node?.id)

  const compute = () => {
    if (unmountRef.value) return
    const nextRect = viewport.getValidNodeOffsetRect(node)
    if (!isEqualRect(rectRef.value, nextRect) && nextRect) {
      rectRef.value = nextRect
    }
  }

  useEffect(
    () => {
      if (!element || !element.isConnected) return
      if (observerRef.value) {
        observerRef.value.disconnect()
      }
      observerRef.value = new ResizeObserver(() => {
        compute()
      })
      observerRef.value.observe(element)
      return () => {
        observerRef.value.disconnect()
      }
    },
    () => [element, viewportRef.value]
  )

  useEffect(
    () => {
      unmountRef.value = false
      const requestIdleTask = () => {
        cancelIdle(idleTaskRef.value)
        idleTaskRef.value = requestIdle(() => {
          compute()
          requestIdleTask()
        })
      }
      requestIdleTask()
      return () => {
        unmountRef.value = true
        cancelIdle(idleTaskRef.value)
      }
    },
    () => [node]
  )

  return rectRef
}
