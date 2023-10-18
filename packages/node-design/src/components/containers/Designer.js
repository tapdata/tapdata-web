import { defineComponent, onMounted } from 'vue'
import { createDesigner, CustomNode } from '../../core'
import { DesignerEngineContext } from '../../context'
import { Layout } from './Layout'
import { GhostWidget } from '../widgets'
import { FragmentComponent } from '@formily/vue'
// GlobalRegistry.registerDesignerIcons(icons)

export const Designer = defineComponent({
  props: {
    // engine: Object,
    prefixCls: {
      type: String,
      default: 'fd-'
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  setup(props, { slots }) {
    const engine = createDesigner({
      rootComponentName: 'Form'
    })

    engine.props.customNode = new CustomNode(engine)

    onMounted(() => {
      engine.mount()
    })

    return () => (
      <Layout props={props}>
        <DesignerEngineContext.Provider value={engine}>
          <FragmentComponent>
            {slots.default?.()}
            <GhostWidget />
          </FragmentComponent>
        </DesignerEngineContext.Provider>
      </Layout>
    )
  }
})
