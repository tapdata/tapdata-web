import { ElSwitch as Switch } from 'element-plus'
import { defineComponent } from 'vue'

export const FormItemSwitcher = defineComponent({
  props: ['value'],
  setup: props => {
    return () => (
      <Switch
        checked={props.value === 'FormItem'}
        onChange={value => {
          props.onChange(value ? 'FormItem' : undefined)
        }}
      />
    )
  }
})
