import { isStr, isFn, isObj, isPlainObj, useContext } from '@tap/shared'
import { observer } from '@formily/reactive-vue'
import { ElTooltip as Tooltip } from 'element-plus'
import { defineComponent, ref, onMounted, isVNode, h, computed, provide } from 'vue'
import { usePrefix, useRegistry, useTheme } from '../../../hooks'
import './styles.scss'
import { IconContext } from '../../../context'

const cloneElement = (VNode, props = {}) => {
  const attrs = { ...VNode.data?.attrs, ...props }
  const data = { ...VNode.data, attrs }

  return { ...VNode, data }
}

const isNumSize = (val) => /^[\d.]+$/.test(val)

// const isVNode = (val) => {
//   return isObj(val) && val?.context?._isVue
// }

export const IconWidget = observer(
  defineComponent({
    props: ['infer', 'size', 'width', 'height', 'tooltip'],
    setup(props, { attrs, emit }) {
      const theme = useTheme()
      const contextRef = useContext(IconContext)
      const registry = useRegistry()
      const prefix = usePrefix('icon')
      const size = props.size || '1em'
      const height = props.height || size
      const width = props.width || size
      const takeIcon = (infer) => {
        if (isStr(infer)) {
          const finded = registry.getDesignerIcon(infer)
          if (finded) {
            return takeIcon(finded)
          }
          return <img src={infer} height={height} width={width} />
        } else if (isPlainObj(infer) && isFn(infer.render)) {
          // eslint-disable-next-line no-undef
          return takeIcon(h(infer))
        } else if (isVNode(infer)) {
          if (infer.type === 'svg') {
            return h(infer, {
              height,
              width,
              fill: 'currentColor',
              viewBox: infer.data?.attrs?.viewBox || '0 0 1024 1024',
              focusable: 'false',
              'aria-hidden': 'true',
            })
          } else if (infer.type === 'path' || infer.type === 'g') {
            return (
              <svg
                viewBox="0 0 1024 1024"
                height={height}
                width={width}
                fill="currentColor"
                focusable="false"
                aria-hidden="true"
              >
                {infer}
              </svg>
            )
          }
          return infer
        } else if (isPlainObj(infer)) {
          if (infer[theme]) {
            return takeIcon(infer[theme])
          } else if (infer['shadow']) {
            return <IconWidget.ShadowSVG width={width} height={height} content={infer['shadow']} />
          }
          return null
        }

        if (isFn(infer)) {
          return takeIcon(infer())
        }
      }
      const renderTooltips = (children) => {
        const context = contextRef.value
        if (!isStr(props.infer) && context?.tooltip) return children
        const tooltip = props.tooltip || registry.getDesignerMessage(`icons.${props.infer}`)
        if (tooltip) {
          const props = isObj(tooltip) ? tooltip : { content: tooltip }
          if (isVNode(props.content)) {
            const content = props.content
            delete props.content

            return (
              <Tooltip {...{ placement: 'top', openDelay: 100, ...props }}>
                {{
                  default: children,
                  content: () => content,
                }}
              </Tooltip>
            )
          }
          return <Tooltip {...{ placement: 'top', openDelay: 100, ...props }}>{children}</Tooltip>
        }
        return children
      }

      if (!props.infer) return null

      return () =>
        renderTooltips(
          <span
            {...{ ...attrs, infer: isStr(props.infer) && props.infer }}
            class={prefix}
            style={{
              cursor: attrs.onClick ? 'pointer' : attrs.style?.cursor,
            }}
            onClick={() => emit('click')}
          >
            {takeIcon(props.infer)}
          </span>,
        )
    },
  }),
)

IconWidget.ShadowSVG = defineComponent({
  props: ['width', 'height', 'content'],
  setup: (props) => {
    const width = isNumSize(props.width) ? `${props.width}px` : props.width
    const height = isNumSize(props.height) ? `${props.height}px` : props.height
    const root = ref(null)

    onMounted(() => {
      if (!root.value) return
      const shadowRoot = root.value.attachShadow({
        mode: 'open',
      })
      shadowRoot.innerHTML = `<svg viewBox="0 0 1024 1024" style="width:${width};height:${height}">${props.content}</svg>`
    })

    return () => <div ref={root}></div>
  },
})

IconWidget.Provider = defineComponent({
  name: 'IconWidget.Provider',
  inheritAttrs: false,
  props: { tooltip: Boolean },
  setup(props, { slots }) {
    provide(
      IconContext,
      computed(() => props),
    )
    return () => slots.default?.()
  },
})
