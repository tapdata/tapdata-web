import { connect, mapProps, h, mapReadPretty } from '@formily/vue'
import { getComponentByTag } from './utils'
import PreviewText from './preview-text'

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
                  return h(ElRadio, { props: { label: option } }, { default: () => [option] })
                } else {
                  return h(
                    ElRadio,
                    {
                      props: {
                        ...option,
                        value: undefined,
                        label: option.value
                      }
                    },
                    { default: () => [option.label] }
                  )
                }
              })
          }
        : slots

    return h(
      ElRadioGroup,
      {
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

export const RadioGroup = connect(
  RadioGroupOption,
  mapProps({ dataSource: 'options' }),
  mapReadPretty(PreviewText.Select)
)
export const Radio = ElRadio
