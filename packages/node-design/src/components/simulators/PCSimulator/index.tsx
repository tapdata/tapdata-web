import { defineComponent } from 'vue'
import { usePrefix } from '../../../hooks'
import './styles.scss'

export const PCSimulator = defineComponent({
  name: 'DnPCSimulator',
  props: {
    className: {},
  },
  setup(props, { attrs, slots }) {
    const prefix = usePrefix('pc-simulator')

    return () => {
      return (
        <div {...attrs} class={[prefix.value, props.className]}>
          {slots.default?.()}
        </div>
      )
    }
  },
})
