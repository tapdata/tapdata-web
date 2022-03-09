import { isStr, isFn, isObj, isPlainObj, useContext } from '@daas/shared'
import { observer } from '@formily/reactive-vue'
import { Tooltip } from 'element-ui'
import { defineComponent } from 'vue-demi'
import { usePrefix, useRegistry, useTheme } from '../../../hooks'
import './styles.scss'
import { IconContext } from '../../../context'

const cloneElement = (VNode, props = {}) => {
  const attrs = { ...VNode.data.attrs, ...props }
  const data = { ...VNode.data, attrs }

  return { ...VNode, data }
}

const isNumSize = val => /^[\d.]+$/.test(val)

export const IconWidget = observer(
  defineComponent({
    props: ['infer', 'size', 'width', 'height', 'tooltip'],
    setup(props, { listeners, attrs, emit }) {
      // const theme = useTheme()
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
        } else if (isPlainObj(infer) && infer.render && isFn(infer.render)) {
          // eslint-disable-next-line no-undef
          const vm = h(infer)
          if (vm.tag === 'svg') {
            return cloneElement(vm, {
              height,
              width,
              fill: 'currentColor',
              viewBox: vm.data.attrs.viewBox || '0 0 1024 1024',
              focusable: 'false',
              'aria-hidden': 'true'
            })
          } else if (vm.tag === 'path' || vm.tag === 'g') {
            return (
              <svg
                viewBox="0 0 1024 1024"
                height={height}
                width={width}
                fill="currentColor"
                focusable="false"
                aria-hidden="true"
              >
                {vm}
              </svg>
            )
          }
          return infer
        }
      }
      const renderTooltips = children => {
        const context = contextRef.value
        if (!isStr(props.infer) && context?.tooltip) return children
        const tooltip = props.tooltip || registry.getDesignerMessage(`icons.${props.infer}`)
        if (tooltip) {
          const props = isObj(tooltip) ? tooltip : { content: tooltip }
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

      /*return (t1, t2) => {
        return (
          <span
            {...props}
            class={[prefix, props.className]}
            style={{
              ...props.style,
              cursor: props.onClick ? 'pointer' : props.style?.cursor
            }}
          >
            {takeIcon(props.infer)}
          </span>
        )
      }*/
    }
  })
)
