import { usePrefix } from '../../../hooks'
import './styles.scss'
import { defineComponent } from 'vue-demi'

export const PCSimulator = defineComponent({
  setup: (props, { slots }) => {
    const prefix = usePrefix('pc-simulator')
    return () => (
      <div props={props} class={prefix}>
        {slots.default?.()}
      </div>
    )
  },
})
