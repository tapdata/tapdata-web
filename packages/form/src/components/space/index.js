import { defineComponent, watch } from 'vue'
import { h } from '@formily/vue'
import { stylePrefix } from '../configs'
import { useFormLayout } from '@formily/element-plus'
import { VDivider } from '@tap/component'
import '@formily/element-plus/lib/space/style.scss'

const spaceSize = {
  small: 8,
  middle: 16,
  large: 24
}

export const Space = defineComponent({
  name: 'FSpace',
  props: ['size', 'direction', 'align', 'split', 'filterIndex', 'colSpan', 'inline'],
  setup(props, { attrs, slots }) {
    const layout = useFormLayout()

    return () => {
      const {
        align,
        size = layout.value?.spaceGap ?? 'small',
        direction = 'horizontal',
        split,
        filterIndex,
        colSpan = [],
        inline = true
      } = props

      const prefixCls = `${stylePrefix}-space`
      const children = slots.default?.()

      let items = []
      if (Array.isArray(children)) {
        if (children.length === 1) {
          if (children[0]['tag']?.endsWith('Fragment')) {
            // Fragment hack
            items = children[0]['componentOptions']?.children
          } else {
            items = children
          }
        } else {
          items = children
        }
      }

      if (filterIndex?.length) {
        items = items.filter((item, index) => {
          return !filterIndex.includes(index)
        })
      }

      const len = items.length

      if (len === 0) {
        return null
      }

      const mergedAlign = align === undefined && direction === 'horizontal' ? 'center' : align

      const someSpaceClass = {
        [prefixCls]: true,
        [`${prefixCls}-${direction}`]: true,
        [`${prefixCls}-align-${mergedAlign}`]: mergedAlign,
        flex: !inline
      }

      const itemClassName = `${prefixCls}-item`

      const renderItems = items.map((child, i) => {
        return [
          h(
            'div',
            {
              class: itemClassName,
              key: `${itemClassName}-${i}`,
              style: {
                flex: colSpan[i]
              }
            },
            { default: () => [child] }
          ),
          i < len - 1 &&
            split &&
            h(
              'span',
              {
                class: `${itemClassName}-split`,
                key: `${itemClassName}-split-${i}`
              },
              {
                default: () => [
                  h(
                    VDivider,
                    {
                      props: {
                        vertical: direction !== 'vertical'
                      }
                    },
                    []
                  )
                ]
              }
            )
        ]
      })

      return h(
        'div',
        {
          ...attrs,
          class: { ...attrs.class, ...someSpaceClass },
          style: {
            ...attrs.style,
            gap: typeof size === 'string' ? `${spaceSize[size]}px` : `${size}px`
          }
        },
        { default: () => renderItems }
      )
    }
  }
})

export default Space
