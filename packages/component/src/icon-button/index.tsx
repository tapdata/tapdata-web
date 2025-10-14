import { computed, defineComponent } from 'vue'
import VIcon from '../base/VIcon.vue'
import './style.scss'

export const IconButton = defineComponent({
  name: 'IconButton',
  props: {
    iconSize: [Number, String],
    xs: Boolean,
    sm: Boolean,
    md: Boolean,
    lg: Boolean,
    xl: Boolean,
    clickAndRotate: Boolean,
    disabled: Boolean,
    loading: Boolean,
  },
  setup(props, { attrs, slots }) {
    const size = computed(() => {
      if (props.xs) return 'small'
      if (props.sm) return 'small'
      if (props.md) return 'default'
      if (props.lg) return 'large'
      if (props.xl) return 'large'
    })
    return () => {
      /* <button
            disabled={props.disabled || props.loading}
            class={[
              't-button t-button--icon',
              {
                't-button--icon-xs': props.xs,
                't-button--icon-sm': props.sm,
                't-button--icon-md':
                  props.md ||
                  (!props.xs && !props.sm && !props.lg && !props.xl),
                't-button--icon-lg': props.lg,
                't-button--icon-xl': props.xl,
                't-button__rotating': props.clickAndRotate,
              },
            ]}
            type="button"
            {...attrs}
          >
            <VIcon class={{ 'animation-rotate-fast': props.loading }}>
              {slots.default()}
            </VIcon>
          </button> */
      return (
        <el-button
          text
          size={size.value}
          icon={
            <VIcon class={{ 'animation-rotate-fast': props.loading }}>
              {slots.default?.()}
            </VIcon>
          }
        ></el-button>
      )
    }
  },
})
