import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { getComponentByTag } from './utils'
import { Checkbox } from './Checkbox'
import PreviewText from './preview-text'

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

export const CheckboxGroup = connect(
  CheckboxGroupOption,
  mapProps({ dataSource: 'options' }),
  mapReadPretty(PreviewText.Select, {
    multiple: true
  })
)
