import { Switch } from 'element-ui'
import { defineComponent } from 'vue-demi'

export const FormItemSwitcher = defineComponent({
  props: ['value'],
  setup: (props) => {
    return () => (
      <Switch
        checked={props.value === 'FormItem'}
        onChange={(value) => {
          props.onChange(value ? 'FormItem' : undefined)
        }}
      />
    )
  },
})
