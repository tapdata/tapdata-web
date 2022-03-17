import { usePrefix, useViewport } from '../../hooks'
import { AuxToolWidget, EmptyWidget } from '../widgets'
import { requestIdle } from '@daas/shared'
import { defineComponent, ref, onMounted } from 'vue-demi'

export const Viewport = defineComponent({
  props: {
    placeholder: {},
    dragTipsDirection: {}
  },
  setup: (props, { slots, refs }) => {
    const placeholder = props.placeholder
    const dragTipsDirection = props.dragTipsDirection
    const loaded = ref(false)
    const prefix = usePrefix('viewport')
    const _viewportRef = useViewport()
    // const ref = useRef<HTMLDivElement>()
    const viewportRef = ref()
    const isFrameRef = ref(false)

    onMounted(() => {
      const frameElement = refs.root?.querySelector('iframe')
      if (!_viewportRef.value) return
      if (viewportRef.value && viewportRef.value !== _viewportRef.value) {
        viewportRef.value.onUnmount()
      }
      if (frameElement) {
        frameElement.addEventListener('load', () => {
          _viewportRef.value.onMount(frameElement, frameElement.contentWindow)
          requestIdle(() => {
            isFrameRef.value = true
            loaded.value = true
          })
        })
      } else {
        _viewportRef.value.onMount(refs.root, window)
        requestIdle(() => {
          isFrameRef.value = false
          loaded.value = true
        })
      }
      viewportRef.value = _viewportRef.value
      return () => {
        _viewportRef.value.onUnmount()
      }
    })

    return () => (
      <div
        props={props}
        ref="root"
        class={prefix}
        style={{
          opacity: !loaded ? 0 : 1,
          overflow: isFrameRef.value ? 'hidden' : 'overlay'
        }}
      >
        {slots.default?.()}
        <AuxToolWidget />
        <EmptyWidget dragTipsDirection={dragTipsDirection}>{placeholder}</EmptyWidget>
      </div>
    )
  }
})
