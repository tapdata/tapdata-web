import { isStr, isFn, isObj, isPlainObj } from '@daas/shared'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import { usePrefix, useRegistry, useTheme } from '../../hooks'
import './styles.scss'

const cloneElement = (VNode, props = {}) => {
  const attrs = { ...VNode.data.attrs, ...props }
  const data = { ...VNode.data, attrs }

  return { ...VNode, data }
}

const isNumSize = val => /^[\d.]+$/.test(val)

export const IconWidget = observer(
  defineComponent({
    props: ['infer', 'size', 'width', 'height'],
    setup(props, context) {
      console.log('context', context, props)
      // const theme = useTheme()
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

      if (!props.infer) return null
      return (t1, t2) => {
        console.log('this', t1, t2)
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
      }
    }
  })
)
