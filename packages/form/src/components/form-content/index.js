import { defineComponent } from 'vue-demi'

export const FormContent = defineComponent({
  setup: (props, { slots }) => {
    return () => {
      return <div style="display: contents">{slots.default?.()}</div>
    }
  },
})
