import { defineComponent } from 'vue'

export const FormFlex = defineComponent({
  props: {
    gap: Number,
    align: String,
    justify: String,
    alignContent: String,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const classList = [
        'flex',
        {
          [`align-items-${props.align}`]: props.align,
          [`align-content-${props.alignContent}`]: props.alignContent,
          [`justify-${props.justify}`]: props.justify,
        },
      ]
      return (
        <div class={classList} attrs={attrs} style={{ gap: `${props.gap}px` }}>
          {slots.default?.()}
        </div>
      )
    }
  },
})
