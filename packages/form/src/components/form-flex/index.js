import { defineComponent } from 'vue-demi'

export const FormFlex = defineComponent({
  setup(props, { attrs, slots }) {
    return () => (
      <div class="flex" attrs={attrs}>
        {slots.default?.()}
      </div>
    )
  }
})
