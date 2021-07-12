import { connect, mapProps, h } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElRadioGroup = getComponentByTag('el-radio-group', { change: 'input' })
const ElRadio = getComponentByTag('el-radio')

const RadioGroupOption = {
  render() {
    const props = this.$attrs
    const slots = this.$slots
    const options = props.options || []
    const children =
      options.length !== 0
        ? {
            default: () =>
              options.map(option => {
                if (typeof option === 'string') {
                  return h(
                    ElRadio,
                    { props: { label: option } },
                    { default: () => [option] },
                  )
                } else {
                  return h(
                    ElRadio,
                    {
                      class: {
                        'fb-radio-option': true
                      },
                      props: {
                        ...option,
                        value: undefined,
                        label: option.value,
                        tip: option.tip,
                        border: true
                      }
                    },
                    { default: () => [
                        h(
                          'span',
                          {},
                          { default: () => [option.label] },
                        ),
                        h(
                          'div',
                          {
                            class: 'fb-radio-option-tip'
                          },
                          { default: () => [option.tip] },
                        )
                      ] },
                  )
                }
              })
          }
        : slots

    return h(
      ElRadioGroup,
      {
        class: {
          'fb-radio': true,
          'radio-border': true,
          'verical': true
        },
        props: {
          value: props.value || [],
          props
        },
        on: this.$listeners
      },
      children
    )
  }
}

export const RadioTipGroup = connect(
  RadioGroupOption,
  mapProps({ dataSource: 'options' })
)
