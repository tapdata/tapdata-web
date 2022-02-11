import { connect, mapProps, h, mapReadPretty } from '@formily/vue'
import { defineComponent } from '@vue/composition-api'
import { PreviewText } from '@formily/element'
import ElSelect from './Select'
import { Option as ElOption } from 'element-ui'
import { resolveComponent } from '@formily/element/lib/__builtins__'

const SelectOption = defineComponent({
  name: 'FSelect',
  props: ['options'],
  setup(customProps, { attrs, slots, listeners }) {
    return () => {
      const options = customProps.options || []
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
                    return h(
                      ElOption,
                      {
                        props: {
                          ...option
                        }
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
  mapProps({ dataSource: 'options', loading: true }),
  mapReadPretty(PreviewText.Select)
)

export default Select
