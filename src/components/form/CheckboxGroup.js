import { connect, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'
import { Checkbox } from './Checkbox'

const ElCheckboxGroup = getComponentByTag('el-checkbox-group', {
  change: 'input'
})

const CheckboxGroupOption = {
  render(h) {
    const props = this.$attrs
    const slots = this.$slots
    const options = props.options || []
    const children =
      options.length !== 0
        ? options.map(option => {
            if (typeof option === 'string') {
              return h(Checkbox, {
                props: { attrs: { label: option, value: option } }
              })
            } else {
              return h(Checkbox, { attrs: { option } })
            }
          })
        : slots

    return h(
      ElCheckboxGroup,
      {
        props: {
          ...props,
          value: props.value || []
        },
        on: this.$listeners
      },
      children
    )
  }
}

export const CheckboxGroup = connect(CheckboxGroupOption, mapProps({ dataSource: 'options' }))
