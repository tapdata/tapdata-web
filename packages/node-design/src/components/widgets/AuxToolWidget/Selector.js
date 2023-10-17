import { useHover, useSelection, usePrefix } from '../../../hooks'
import { IconWidget } from '../IconWidget'
import { NodeTitleWidget } from '../NodeTitleWidget'
import { Button } from 'element-ui'
import { observer } from '@formily/reactive-vue'
import {
  defineComponent,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
} from 'vue-demi'

const useMouseHover = (elRef, enter, leave) => {
  let timer = null
  let unmounted = ref(false)
  const onMouseOver = (e) => {
    const target = e.target
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (unmounted.value) return
      if (elRef.value.contains(target)) {
        enter && enter()
      } else {
        leave && leave()
      }
    }, 100)
  }

  onMounted(() => {
    document.addEventListener('mouseover', onMouseOver)
  })

  onBeforeUnmount(() => {
    unmounted.value = true
    document.removeEventListener('mouseover', onMouseOver)
  })
}

export const Selector = observer(
  defineComponent({
    props: ['node'],
    setup: (props, { refs }) => {
      const node = props.node
      const hoverRef = useHover()
      const expand = ref(false)
      const elRef = computed(() => refs.ref)
      const selectionRef = useSelection()
      const prefix = usePrefix('aux-selector')
      const renderIcon = (node) => {
        const icon = node.designerProps.icon
        if (icon) {
          return <IconWidget infer={icon} />
        }
        if (node === node.root) {
          return <IconWidget infer="Page" />
        } else if (node.designerProps?.droppable) {
          return <IconWidget infer="Container" />
        }
        return <IconWidget infer="Component" />
      }

      const renderMenu = () => {
        const hover = hoverRef.value
        const parents = node.getParents()
        return (
          <div
            class={prefix + '-menu'}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
            }}
          >
            {parents.slice(0, 4).map((parent) => {
              return (
                <Button
                  key={parent.id}
                  type="primary"
                  onClick={() => {
                    selectionRef.value.select(parent.id)
                  }}
                  vOn:mouseenter_native={() => {
                    hover.setHover(parent)
                  }}
                >
                  {renderIcon(parent)}
                  <span style={{ transform: 'scale(0.85)', marginLeft: 2 }}>
                    <NodeTitleWidget node={parent} />
                  </span>
                </Button>
              )
            })}
          </div>
        )
      }

      useMouseHover(
        elRef,
        () => {
          expand.value = true
        },
        () => {
          expand.value = false
        }
      )

      return () => {
        const hover = hoverRef.value
        return (
          <div ref="ref" class={prefix}>
            <Button
              class={prefix + '-title'}
              type="primary"
              vOn:mouseenter_native={() => {
                hover.setHover(node)
              }}
            >
              {renderIcon(node)}
              <span>
                <NodeTitleWidget node={node} />
              </span>
            </Button>
            {expand.value && renderMenu()}
          </div>
        )
      }
    },
  })
)
