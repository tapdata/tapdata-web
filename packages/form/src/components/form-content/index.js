import { defineComponent } from 'vue'

export const FormContent = defineComponent({
  setup: (props, { slots }) => {
    return () => {
      return <div style="display: contents">{slots.default?.()}</div>
    }
  }
})
