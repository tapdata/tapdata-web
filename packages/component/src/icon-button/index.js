import { defineComponent } from '@vue/composition-api'
import VIcon from '../base/VIcon'
import './style.scss'

export const IconButton = defineComponent({
  props: {
    iconSize: [Number, String],
    xs: Boolean,
    sm: Boolean,
    md: {
      type: Boolean,
      default: true
    },
    lg: Boolean,
    xl: Boolean
  },
  setup(props, { attrs, listeners, slots }) {
    return () => {
      return (
        <button
          staticClass="t-button t-button--icon"
          class={{
            't-button--icon-xs': props.xs,
            't-button--icon-sm': props.sm,
            't-button--icon-md': props.md,
            't-button--icon-lg': props.lg,
            't-button--icon-xl': props.xl
          }}
          type="button"
          {...{ props: attrs, on: listeners }}
        >
          <VIcon>{slots.default()}</VIcon>
        </button>
      )
    }
  }
})
