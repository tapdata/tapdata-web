import { defineComponent, ref, watch } from 'vue'
import { each, useContext } from '@tap/shared'
import { DesignerLayoutContext } from '../../context'

export const Layout = defineComponent({
  props: {
    theme: {
      type: String,
      default: 'light',
    },
    prefixCls: {
      type: String,
      default: 'fd-',
    },
    position: {
      type: String,
      default: 'fixed',
    },
    variables: Array,
  },
  setup: (props, { slots }) => {
    const layoutRef = useContext(DesignerLayoutContext)
    const root = ref(null)

    watch(
      () => props.variables,
      () => {
        if (root.value) {
          each(props.variables, (value, key) => {
            root.value.style.setProperty(`--${key}`, value)
          })
        }
      },
    )

    if (layoutRef.value) {
      return () => slots.default?.()
    }

    return () => (
      <div
        ref={root}
        class={{
          [`${props.prefixCls}app`]: true,
          [`${props.prefixCls}${props.theme}`]: props.theme,
        }}
      >
        <DesignerLayoutContext.Provider
          value={{
            theme: props.theme,
            prefixCls: props.prefixCls,
            position: props.position,
          }}
        >
          {slots.default?.()}
        </DesignerLayoutContext.Provider>
      </div>
    )
  },
})
