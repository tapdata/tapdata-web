import { usePrefix, usePosition } from '../../hooks'
import { Layout } from '../containers'
import { defineComponent } from 'vue-demi'
import { StudioHeader } from '../StudioHeader'

export const StudioPanel = defineComponent({
  props: ['theme', 'prefixCls', 'position'],
  setup: (props, { slots }) => {
    const prefix = usePrefix('main-panel')
    const position = usePosition()
    const baseCls = ['root', position]

    return () => (
      <Layout theme={props.theme} prefixCls={props.prefixCls} position={props.position}>
        <div class={[`${prefix}-container flex flex-1 min-h-0`, ...baseCls]}>
          <StudioHeader />
          <div class={prefix}>{slots.default?.()}</div>
        </div>
      </Layout>
    )
  }
})
