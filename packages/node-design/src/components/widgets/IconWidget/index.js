import { isStr, isFn, isObj, isPlainObj, useContext } from '@tap/shared'
import { FragmentComponent } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { Tooltip } from 'element-ui'
import { defineComponent, onMounted } from 'vue-demi'
import { usePrefix, useRegistry, useTheme } from '../../../hooks'
import './styles.scss'
import { IconContext } from '../../../context'

const cloneElement = (VNode, props = {}) => {
  const attrs = { ...VNode.data?.attrs, ...props }
  const data = { ...VNode.data, attrs }

  return { ...VNode, data }
}

const isNumSize = val => /^[\d.]+$/.test(val)

const isVNode = val => {
  return isObj(val) && val?.context?._isVue
}

export const IconWidget = observer(
  defineComponent({
    props: ['infer', 'size', 'width', 'height', 'tooltip'],
    setup(props, { listeners, attrs, emit }) {
      const theme = useTheme()
      const contextRef = useContext(IconContext)
      const registry = useRegistry()
      const prefix = usePrefix('icon')
      const size = props.size || '1em'
      const height = props.height || size
      const width = props.width || size
      const takeIcon = infer => {
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
          if (infer.tag === 'svg') {
            return cloneElement(infer, {
              height,
              width,
              fill: 'currentColor',
              viewBox: infer.data?.attrs?.viewBox || '0 0 1024 1024',
              focusable: 'false',
              'aria-hidden': 'true'
            })
          } else if (infer.tag === 'path' || infer.tag === 'g') {
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
      }
      const renderTooltips = children => {
        const context = contextRef.value
        if (!isStr(props.infer) && context?.tooltip) return children
        const tooltip = props.tooltip || registry.getDesignerMessage(`icons.${props.infer}`)
        if (tooltip) {
          const props = isObj(tooltip) ? tooltip : { content: tooltip }
          if (isVNode(props.content)) {
            const content = props.content
            delete props.content

            return (
              <Tooltip props={{ placement: 'top', openDelay: 100, ...props }}>
                <FragmentComponent slot="content">{content}</FragmentComponent>
                {children}
              </Tooltip>
            )
          }
          return <Tooltip props={{ placement: 'top', openDelay: 100, ...props }}>{children}</Tooltip>
        }
        return children
      }

      if (!props.infer) return null

      return () =>
        renderTooltips(
          <span
            {...{ attrs: { ...attrs, infer: isStr(props.infer) && props.infer } }}
            class={prefix}
            style={{
              cursor: listeners.click ? 'pointer' : attrs.style?.cursor
            }}
            onClick={() => emit('click')}
          >
            {takeIcon(props.infer)}
          </span>
        )
    }
  })
)

IconWidget.ShadowSVG = defineComponent({
  props: ['width', 'height', 'content'],
  setup: (props, { refs }) => {
    const width = isNumSize(props.width) ? `${props.width}px` : props.width
    const height = isNumSize(props.height) ? `${props.height}px` : props.height

    onMounted(() => {
      if (!refs.ref) return
      const root = refs.ref.attachShadow({
        mode: 'open'
      })
      root.innerHTML = `<svg viewBox="0 0 1024 1024" style="width:${width};height:${height}">${props.content}</svg>`
    })

    return () => <div ref="ref"></div>
  }
})
