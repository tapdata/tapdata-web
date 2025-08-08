import { requestIdle } from '@tap/shared'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { usePrefix, useSelection, useTree, useViewport } from '../../hooks'
import { useStyle } from '../../shared'
import { AuxToolWidget, EmptyWidget } from '../widgets'
import type { Viewport as ViewportType } from '../../core'

export const Viewport = defineComponent({
  name: 'DnViewport',
  props: {
    placeholder: {},
    dragTipsDirection: {},
  },
  setup(props, { slots, attrs }) {
    const loaded = ref(false)
    const prefixRef = usePrefix('viewport')
    const viewportHookRef = useViewport()
    const selectionRef = useSelection()
    const treeRef = useTree()

    const refInstance = ref<HTMLElement>()
    // 该组件内部缓存的ref
    const viewportRef = ref<ViewportType>()
    const isFrameRef = ref(false)

    onMounted(() => {
      const ref = refInstance
      const frameElement = ref.value?.querySelector('iframe')
      if (!viewportHookRef.value) return
      if (viewportRef.value && viewportRef.value !== viewportHookRef.value) {
        viewportRef.value.onUnmount()
      }
      if (frameElement) {
        frameElement.addEventListener('load', () => {
          viewportHookRef.value.onMount(
            frameElement,
            frameElement.contentWindow,
          )
          requestIdle(() => {
            isFrameRef.value = true
            loaded.value = true
          })
        })
      } else {
        viewportHookRef.value.onMount(ref.value, window)
        requestIdle(() => {
          isFrameRef.value = false
          loaded.value = true
        })
      }
      viewportRef.value = viewportHookRef.value
    })

    onMounted(() => {
      nextTick(() => {
        selectionRef.value.clear()
        nextTick(() => {
          selectionRef.value.select(treeRef.value.id)
        })
      })
    })

    onBeforeUnmount(() => {
      viewportHookRef.value.onUnmount()
    })

    const style = useStyle()

    return () => {
      return (
        <div
          ref={refInstance}
          class={prefixRef.value}
          style={{
            opacity: !loaded ? 0 : 1,
            overflow: isFrameRef.value ? 'hidden' : 'overlay',
            ...style,
          }}
        >
          {slots.default?.()}
          <AuxToolWidget />
          <EmptyWidget {...{ dragTipsDirection: props.dragTipsDirection }}>
            {props.placeholder}
          </EmptyWidget>
        </div>
      )
    }
  },
})
