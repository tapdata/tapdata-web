import { FragmentComponent } from '@formily/vue'
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  toRef,
  watchEffect,
} from 'vue'
import { DesignerEngineContext, DesignerEngineSymbol } from '../../context'
import { createDesigner, CustomNode, type Engine } from '../../core'
import { GhostWidget } from '../widgets'
import { Layout } from './Layout'
// GlobalRegistry.registerDesignerIcons(icons)

export const Designer = defineComponent({
  props: {
    // engine: Object,
    prefixCls: {
      type: String,
      default: 'fd-',
    },
    theme: {
      type: String,
      default: 'light',
    },
  },
  setup(props, { slots }) {
    const engine = createDesigner({
      rootComponentName: 'Form',
    })

    engine.props.customNode = new CustomNode(engine)

    const refInstance = ref<Engine | null>(null)

    provide(DesignerEngineSymbol, toRef(engine))

    onMounted(() => {
      engine.mount()
    })

    watchEffect(() => {
      if (refInstance.value && engine !== refInstance.value) {
        refInstance.value.unmount()
      }
      engine.mount()
      refInstance.value = engine
    })

    onBeforeUnmount(() => {
      engine.unmount()
    })

    return () => (
      <Layout {...{ theme: props.theme, prefixCls: props.prefixCls }}>
        {slots.default?.()}
        <GhostWidget />
      </Layout>
    )
  },
})
