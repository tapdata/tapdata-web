import { useCursor, usePrefix, useDesigner } from '../../../hooks'
import { CursorStatus } from '../../../core'
import { autorun, observe } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { NodeTitleWidget } from '../NodeTitleWidget'
import './styles.scss'
import { defineComponent, ref, unref, onBeforeUnmount, toRef, watch, watchEffect, getCurrentInstance } from 'vue-demi'

export const GhostWidget = observer(
  defineComponent({
    setup: (props, setupContext) => {
      const refs = setupContext.refs
      const designer = useDesigner()
      const cursorRef = useCursor()
      // const cursor = useCursor()
      const root = ref(null)
      const prefix = usePrefix('ghost')
      // const draggingNodes = designer.value.findDraggingNodes()
      // const firstNode = draggingNodes[0]
      // const vm = getCurrentInstance()

      /*watchEffect(() => {
        console.log('GhostWidget.watch', cursor)
        return autorun(() => {
          console.log('GhostWidget.vm', vm, domRef)
          const transform = `perspective(1px) translate3d(${cursor.value.position?.topClientX - 18}px,${
            cursor.value.position?.topClientY - 12
          }px,0) scale(0.8)`
          if (!domRef.value) return
          domRef.value.style.transform = transform
        })
      })*/

      // [designer, cursor]
      const dispose = autorun(() => {
        const cursor = unref(cursorRef)
        const transform = `perspective(1px) translate3d(${cursor.position?.topClientX - 18}px,${
          cursor.position?.topClientY - 12
        }px,0) scale(0.8)`
        // console.log('Ghost.transform', transform, refs.root)
        if (!refs.root) return
        refs.root.style.transform = transform
      })

      onBeforeUnmount(() => {
        dispose?.()
      })

      /*observe(cursorRef.value, value => {
        const cursor = unref(cursorRef)
        if (cursor.status === CursorStatus.Dragging) {
          $domRef.value = root.value
        } else {
          $domRef.value = null
        }
        console.log('cursor.observe', root.value, document.querySelector('#Ghost'))
        console.log('refs.root', refs.root)
      })*/

      return { root, prefix, designer, cursor: cursorRef }
      /*
      return () => {
        const draggingNodes = designer.value.findDraggingNodes()
        const firstNode = draggingNodes[0]

        const renderNodes = () => {
          return (
            <span
              style={{
                whiteSpace: 'nowrap'
              }}
            >
              <NodeTitleWidget node={firstNode} />
              {draggingNodes.length > 1 ? '...' : ''}
            </span>
          )
        }

        const cursor = unref(cursorRef)

        if (!firstNode || cursor.status !== CursorStatus.Dragging) return null

        return (
          <div ref="domRef" class={prefix}>
            {renderNodes()}
          </div>
        )
      }*/
    },

    render() {
      const draggingNodes = this.designer.findDraggingNodes()
      const firstNode = draggingNodes[0]
      const renderNodes = () => {
        return (
          <span
            style={{
              whiteSpace: 'nowrap'
            }}
          >
            <NodeTitleWidget node={firstNode} />
            {draggingNodes.length > 1 ? '...' : ''}
          </span>
        )
      }
      if (!firstNode || this.cursor.status !== CursorStatus.Dragging) return null
      return (
        <div id="Ghost" ref="root" class={this.prefix}>
          {renderNodes()}
        </div>
      )
    }
  })
)

/*
export const GhostWidget = defineComponent({
  setup: () => {
    const designer = useDesigner()
    const cursorRef = useCursor()
    // const cursor = useCursor()
    const domRef = ref()
    const prefix = usePrefix('ghost')
    // const draggingNodes = designer.value.findDraggingNodes()
    // const firstNode = draggingNodes[0]
    const vm = getCurrentInstance()

    /!*watchEffect(() => {
      console.log('GhostWidget.watch', cursor)
      return autorun(() => {
        console.log('GhostWidget.vm', vm, domRef)
        const transform = `perspective(1px) translate3d(${cursor.value.position?.topClientX - 18}px,${
          cursor.value.position?.topClientY - 12
        }px,0) scale(0.8)`
        if (!domRef.value) return
        domRef.value.style.transform = transform
      })
    })*!/

    // [designer, cursor]
    const dispose = autorun(() => {
      const cursor = unref(cursorRef)
      const transform = `perspective(1px) translate3d(${cursor.position?.topClientX - 18}px,${
        cursor.position?.topClientY - 12
      }px,0) scale(0.8)`

      console.log('Ghost.transform', vm, transform)
    })

    observe(cursorRef.value, value => {
      console.log('cursor.observe', value)
    })

    return () => {
      const draggingNodes = designer.value.findDraggingNodes()
      const firstNode = draggingNodes[0]

      const renderNodes = () => {
        return (
          <span
            style={{
              whiteSpace: 'nowrap'
            }}
          >
            <NodeTitleWidget node={firstNode} />
            {draggingNodes.length > 1 ? '...' : ''}
          </span>
        )
      }

      const cursor = unref(cursorRef)

      if (!firstNode || cursor.status !== CursorStatus.Dragging) return null

      return (
        <div ref="ghost" class={prefix}>
          {renderNodes()}
        </div>
      )
    }
  }
})
*/
