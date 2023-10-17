import { connect, mapProps, h, mapReadPretty } from '@formily/vue'
import { defineComponent } from '@vue/composition-api'
import { PreviewText } from '@formily/element'
import ElSelect from './Select'
import { ElOption } from 'element-plus'
import { resolveComponent } from '@formily/element/lib/__builtins__'

const SelectOption = defineComponent({
  name: 'FSelect',
  props: ['options', 'itemLabel', 'itemValue', 'itemDisabled'],
  setup(customProps, { attrs, slots, listeners }) {
    return () => {
      const options = customProps.options || []
      const itemLabel = customProps.itemLabel || 'label'
      const itemValue = customProps.itemValue || 'value'
      const itemDisabled = customProps.itemDisabled || 'disabled'
      const children =
        options.length !== 0
          ? {
              default: () =>
                options.map(option => {
                  if (typeof option === 'string') {
                    return h(
                      ElOption,
                      { props: { value: option, label: option } },
                      {
                        default: () => [resolveComponent(slots?.option, { option })]
                      }
                    )
                  } else {
                    const optionProps = {
                      value: option[itemValue],
                      label: option[itemLabel],
                      disabled: option[itemDisabled]
                    }
                    return h(
                      ElOption,
                      {
                        props: optionProps
                      },
                      {
                        default: () => [
                          resolveComponent(slots?.option, {
                            option
                          })
                        ]
                      }
                    )
                  }
                })
            }
          : slots
      return h(
        ElSelect,
        {
          attrs: {
            ...attrs
          },
          on: listeners
        },
        children
      )
    }
  }
})

export const Select = connect(
  SelectOption,
  mapProps({ dataSource: 'options', loading: true }, (props, field) => {
    const _props = { ...props }
    const options = field.componentProps?.options

    if (options) {
      _props.options = options
    }
    return _props
  }),
  mapReadPretty(PreviewText.Select)
)

export default Select
