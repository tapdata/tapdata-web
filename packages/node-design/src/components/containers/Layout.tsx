import { each } from '@tap/shared'
import { computed, defineComponent, provide, ref, watch } from 'vue'

import {
  DesignerLayoutSymbol,
  useContext,
  type IDesignerLayoutContext,
} from '../../context'

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
    const layoutRef = useContext<IDesignerLayoutContext>(DesignerLayoutSymbol)
    const containerRef = ref<HTMLDivElement>()

    watch(
      () => containerRef,
      () => {
        if (containerRef.value) {
          each(props.variables!, (value, key) => {
            containerRef.value?.style?.setProperty(`--${key}`, value)
          })
        }
      },
    )

    if (layoutRef.value) {
      return () => {
        return slots.default?.()
      }
    }

    provide(
      DesignerLayoutSymbol,
      computed(() => {
        return {
          theme: props.theme!,
          prefixCls: props.prefixCls!,
          position: props.position!,
        }
      }),
    )

    return () => (
      <div
        ref={containerRef}
        class={{
          [`${props.prefixCls}app`]: true,
          [`${props.prefixCls}${props.theme}`]: props.theme,
        }}
      >
        {slots.default?.()}
      </div>
    )
  },
})
