import { ElColorPicker as ColorPicker, ElInput as Input } from 'element-plus'
import { defineComponent } from 'vue'
import { usePrefix } from '../../../hooks'
import './styles.scss'

export const ColorInput = defineComponent({
  props: ['value'],
  setup: (props, { emit }) => {
    const prefixRef = usePrefix('color-input')
    return (
      <div class={prefixRef.value}>
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
