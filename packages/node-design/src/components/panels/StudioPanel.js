import { usePrefix, usePosition } from '../../hooks'
import { Layout } from '../containers'
import { defineComponent } from 'vue-demi'

export const StudioPanel = defineComponent({
  props: ['theme', 'prefixCls', 'position'],
  setup: (props, { slots }) => {
    const prefix = usePrefix('main-panel')
    const position = usePosition()
    const baseCls = ['root', position]
    const render = () => {
      if (slots.header) {
        return () => (
          <div class={[`${prefix}-container flex flex-1 min-h-0`, ...baseCls]}>
            {slots.header()}
            <div class={prefix}>{slots.default?.()}</div>
          </div>
        )
      }
      return () => <div class={[prefix, ...baseCls]}>{slots.default?.()}</div>
    }

    return () => (
      <Layout theme={props.theme} prefixCls={props.prefixCls} position={props.position}>
        {render()}
      </Layout>
    )
  }
})
