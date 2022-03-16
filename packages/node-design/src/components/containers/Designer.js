import { defineComponent, onMounted, h as hr, getCurrentInstance, watch } from 'vue-demi'
import { createDesigner, CustomNode } from '../../core'
import { DesignerEngineContext } from '../../context'
import { useDesigner } from '../../hooks'
import { Layout } from './Layout'
import * as icons from '../../icons'
import { GhostWidget } from '../widgets'
import { FragmentComponent } from '@formily/vue'
// GlobalRegistry.registerDesignerIcons(icons)
//
// console.log('icons🐰', icons)

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
