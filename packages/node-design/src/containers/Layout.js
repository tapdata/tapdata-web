import { defineComponent, ref, provide, inject, watch } from 'vue-demi'
import { each, useContext } from '@daas/shared'
import { DesignerLayoutContext } from '../context'

export const Layout = defineComponent({
  props: {
    theme: {
      type: String,
      default: 'light'
    },
    prefixCls: {
      type: String,
      default: 'dn-'
    },
    position: {
      type: String,
      default: 'fixed'
    },
    variables: Array
  },
  setup: (props, { slots }) => {
    const layout = useContext(DesignerLayoutContext)
    const ref = ref(null)

    watch(
      () => props.variables,
      () => {
        if (ref.value) {
          each(props.variables, (value, key) => {
            ref.current.style.setProperty(`--${key}`, value)
          })
        }
      }
    )

    if (layout) {
      return () => slots?.default?.()
    }
    return () => (
      <div
        ref={ref}
        class={{
          [`${props.prefixCls}app`]: true,
          [`${props.prefixCls}${props.theme}`]: props.theme
        }}
      >
        <DesignerLayoutContext.Provider
          value={{
            theme: props.theme,
            prefixCls: props.prefixCls,
            position: props.position
          }}
        >
          {slots?.default?.()}
        </DesignerLayoutContext.Provider>
      </div>
    )
  }
})
