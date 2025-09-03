import { usePrefix, usePosition } from '../../hooks'
import { Layout } from '../containers'
import { defineComponent, unref } from 'vue'
import { StudioHeader } from '../StudioHeader'

const StudioPanelInternal = defineComponent({
  name: 'StudioPanelInternal',
  setup(props, { attrs, slots }) {
    const prefixRef = usePrefix('main-panel')
    const positionRef = usePosition()
    

    return () => {
      const position = unref(positionRef)
      const prefix = unref(prefixRef)
      return (
        <div {...attrs} class={[prefix + '-container', 'root', position]}>
          <StudioHeader />
          <div class={prefix}>{slots.default?.()}</div>
        </div>
      )
    }
  },
})

export const StudioPanel = defineComponent({
  name: 'StudioPanel',
  props: {
    theme: { type: String, default: 'light' },
    prefixCls: { type: String, default: 'fd-' },
    position: { type: String, default: 'fixed' },
  },
  setup(props, { slots }) {
    
    return () => (
      <Layout
        {...{
          theme: props.theme,
          prefixCls: props.prefixCls,
          position: props.position,
        }}
      >
        <StudioPanelInternal {...props} v-slots={slots} />
      </Layout>
    )
  },
})