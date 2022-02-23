import { defineComponent, ref, onMounted, h as hr, getCurrentInstance, watch } from 'vue-demi'
import { isFn } from '@daas/shared'
import { isResourceHost, isResourceList } from '../../core'
import './index.scss'
import { IconWidget } from '../icon-widget'
import { TextWidget } from '../text-widget'

export const ResourceWidget = defineComponent({
  props: {
    title: String,
    sources: Array,
    className: String,
    defaultExpand: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const prefix = 'fd-resource'
    const expand = ref(props.defaultExpand)
    const renderNode = source => {
      const { node, icon, title, thumb, span } = source
      return (
        <div
          class={prefix + '-item'}
          style={{ gridColumnStart: `span ${span || 1}` }}
          key={node.id}
          data-designer-source-id={node.id}
        >
          {thumb && <img class={prefix + '-item-thumb'} src={thumb} />}
          <IconWidget class={prefix + '-item-icon'} infer={icon} width={150} height={40} />
          <span class={prefix + '-item-text'}>
            {<TextWidget>{title || node.children[0]?.getMessage('title')}</TextWidget>}
          </span>
        </div>
      )
    }
    const sources = props.sources.reduce((buf, source) => {
      if (isResourceList(source)) {
        return buf.concat(source)
      } else if (isResourceHost(source)) {
        return buf.concat(source.Resource)
      }
      return buf
    }, [])
    const remainItems =
      sources.reduce((length, source) => {
        return length + (source.span ?? 1)
      }, 0) % 3

    return () => (
      <div
        class={[
          prefix,
          props.className,
          {
            expand: expand.value
          }
        ]}
      >
        <div
          class={prefix + '-header'}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            expand.value = !expand.value
          }}
        >
          <div class={prefix + '-header-expand'}>
            <IconWidget infer="Expand" size={10} />
          </div>
          <div class={prefix + '-header-content'}>
            <TextWidget>{props.title}</TextWidget>
          </div>
        </div>
        <div class={prefix + '-content-wrapper'}>
          <div class={prefix + '-content'}>
            {sources.map(isFn(props.children) ? props.children : renderNode)}
            {remainItems ? (
              <div class={prefix + '-item-remain'} style={{ gridColumnStart: `span ${3 - remainItems}` }}></div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
})
