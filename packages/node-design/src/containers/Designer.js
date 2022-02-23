import { defineComponent, toRefs, onMounted, h as hr, getCurrentInstance, watch } from 'vue-demi'
import { Engine, GlobalRegistry } from '../core'
import { DesignerEngineContext } from '../context'
import { useDesigner } from '../hooks'
import { Layout } from './Layout'
import * as icons from '../icons'

GlobalRegistry.registerDesignerIcons(icons)

console.log('icons🐰', icons)

export const Designer = defineComponent({
  props: {
    engine: Object,
    prefixCls: {
      type: String,
      default: 'dn-'
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  setup: (props, { slots }) => {
    const engine = useDesigner()
    const ref = ref()
    watch(
      () => props.engine,
      () => {
        if (props.engine) {
          if (props.engine && ref.current) {
            if (props.engine !== ref.current) {
              ref.current.unmount()
            }
          }
          props.engine.mount()
          ref.current = props.engine
        }
        return () => {
          if (props.engine) {
            props.engine.unmount()
          }
        }
      }
    )

    if (engine) throw new Error('There can only be one Designable Engine Context in the Tree')

    return (
      <Layout {...toRefs(props)}>
        <DesignerEngineContext.Provider value={props.engine}>{slots?.default?.()}</DesignerEngineContext.Provider>
      </Layout>
    )
  }
})
