import { defineComponent } from '@vue/composition-api'
import { h } from '@formily/vue'
import { stylePrefix } from '../configs'
import { useFormLayout } from '@formily/element'
import VDivider from 'web-core/components/VDivider'
import './style.scss'

const spaceSize = {
  small: 8,
  middle: 16,
  large: 24
}

export const Space = defineComponent({
  name: 'FSpace',
  props: ['size', 'direction', 'align', 'split', 'filterIndex'],
  setup(props, { slots }) {
    const layout = useFormLayout()

    return () => {
      const { align, size = layout.value?.spaceGap ?? 'small', direction = 'horizontal', split, filterIndex } = props

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
        [`${prefixCls}-align-${mergedAlign}`]: mergedAlign
      }

      const itemClassName = `${prefixCls}-item`
      const marginDirection = 'marginRight' // directionConfig === 'rtl' ? 'marginLeft' : 'marginRight';

      const renderItems = items.map((child, i) => {
        const style =
          i === len - 1
            ? {}
            : {
                [direction === 'vertical' ? 'marginBottom' : marginDirection]:
                  typeof size === 'string' ? `${spaceSize[size] / (split ? 2 : 1)}px` : `${size / (split ? 2 : 1)}px`
              }
        return [
          h(
            'div',
            {
              class: itemClassName,
              key: `${itemClassName}-${i}`,
              style
            },
            { default: () => [child] }
          ),
          i < len - 1 &&
            split &&
            h(
              'span',
              {
                class: `${itemClassName}-split`,
                key: `${itemClassName}-split`,
                style
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

      return h('div', { class: someSpaceClass }, { default: () => renderItems })
    }
  }
})

export default Space
