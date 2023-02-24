import { Input, ColorPicker } from 'element-ui'
import { usePrefix } from '../../../hooks'
import './styles.scss'
import { defineComponent } from 'vue-demi'

export const ColorInput = defineComponent({
  props: ['value'],
  setup: (props, { emit }) => {
    const prefix = usePrefix('color-input')
    return (
      <div class={prefix}>
        <Input
          value={props.value}
          onInput={(e) => {
            emit('change', e)
          }}
          placeholder="Color"
        >
          <ColorPicker
            slot="prefix"
            value={props.value}
            onInput={(e) => {
              emit('change', e)
            }}
          ></ColorPicker>
        </Input>
      </div>
    )
  },
})
