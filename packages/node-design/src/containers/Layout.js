import { defineComponent, ref, provide, inject, watch, onMounted } from 'vue-demi'
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
    const root = ref(null)
    const layout = useContext(DesignerLayoutContext)

    watch(
      () => props.variables,
      () => {
        if (root.value) {
          each(props.variables, (value, key) => {
            root.value.style.setProperty(`--${key}`, value)
          })
        }
      }
    )

    if (layout) {
      return () => slots?.default?.()
    }
    /*return () => (
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
    )*/

    return { root, layout }
  },

  render() {
    if (this.layout) return this.$slots.default?.()
    return (
      <div
        ref="root"
        class={{
          [`${this.prefixCls}app`]: true,
          [`${this.prefixCls}${this.theme}`]: this.theme
        }}
      >
        <DesignerLayoutContext.Provider
          value={{
            theme: this.theme,
            prefixCls: this.prefixCls,
            position: this.position
          }}
        >
          {this.$slots.default?.()}
        </DesignerLayoutContext.Provider>
      </div>
    )
  }
})
