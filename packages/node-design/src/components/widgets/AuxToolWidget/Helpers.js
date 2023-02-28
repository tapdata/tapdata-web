import { reaction } from '@formily/reactive'
import { usePrefix, useViewport, useEffect } from '../../../hooks'
import { Selector } from './Selector'
import { Copy } from './Copy'
import { Delete } from './Delete'
import { DragHandler } from './DragHandler'
import { defineComponent, ref, nextTick } from 'vue'

const HELPER_DEBOUNCE_TIMEOUT = 100

export const Helpers = defineComponent({
  props: ['node', 'nodeRect'],
  setup: (props, { refs }) => {
    const node = props.node
    const nodeRect = props.nodeRect
    const prefix = usePrefix('aux-helpers')
    const viewportRef = useViewport()
    const unmountRef = ref(false)
    const position = ref('top-right')

    useEffect(
      () => {
        let request = null

        const getYInViewport = (nodeRect, helpersRect) => {
          if (nodeRect.top - viewportRef.value.scrollY > helpersRect.height) {
            return 'top'
          } else if (viewportRef.value.isScrollTop && nodeRect.height + helpersRect.height > viewportRef.value.height) {
            return 'inner-top'
          } else if (
            viewportRef.value.isScrollBottom &&
            nodeRect.height + helpersRect.height > viewportRef.value.height
          ) {
            return 'inner-bottom'
          }

          return 'bottom'
        }

        const getXInViewport = (nodeRect, helpersRect) => {
          const widthDelta = helpersRect.width - nodeRect.width
          if (widthDelta >= 0) {
            if (nodeRect.x < widthDelta) {
              return 'left'
            } else if (nodeRect.right + widthDelta > viewportRef.value.width) {
              return 'right'
            } else {
              return 'center'
            }
          }
          return 'right'
        }

        const update = () => {
          const helpersRect = refs.root?.getBoundingClientRect()
          if (!helpersRect || !nodeRect) return
          if (unmountRef.value) return
          position.value = getYInViewport(nodeRect, helpersRect) + '-' + getXInViewport(nodeRect, helpersRect)
        }

        nextTick(() => {
          update()
        })

        return reaction(
          () => [
            viewportRef.value.width,
            viewportRef.value.height,
            viewportRef.value.scrollX,
            viewportRef.value.scrollY,
            viewportRef.value.isScrollBottom,
            viewportRef.value.isScrollTop
          ],
          () => {
            clearTimeout(request)
            request = setTimeout(update, HELPER_DEBOUNCE_TIMEOUT)
          }
        )
      },
      () => [viewportRef.value.value, nodeRect]
    )

    return () => {
      if (!nodeRect || !node) return null
      return (
        <div
          class={[
            prefix,
            {
              [position.value]: true
            }
          ]}
          ref="root"
        >
          <div class={prefix + '-content'}>
            <Selector node={node} />
            {node?.allowClone() === false ? null : <Copy node={node} />}
            {node?.allowDrag() === false ? null : <DragHandler node={node} />}
            {node?.allowDelete() === false ? null : <Delete node={node} />}
          </div>
        </div>
      )
    }
  }
})
