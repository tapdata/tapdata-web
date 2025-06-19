import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { defineComponent, PropType, h } from 'vue'
import { composeExport, resolveComponent, SlotTypes } from '@formily/element-plus/esm/__builtins__'
import { PreviewText } from '@formily/element-plus'

export type ElRadioProps = typeof ElRadio
export type RadioGroupProps = typeof ElRadioGroup & {
  value: any
  options?: (
    | (Omit<ElRadioProps, 'value'> & {
        value: ElRadioProps['label']
        label: SlotTypes
      })
    | string
  )[]
  optionType: 'defalt' | 'button'
}

const RadioGroupOption = defineComponent({
  name: 'FRadioGroup',
  props: {
    options: {
      type: Array as PropType<RadioGroupProps['options']>,
      default: () => [],
    },
    optionType: {
      type: String as PropType<RadioGroupProps['optionType']>,
      default: 'default',
    },
  },
  setup(customProps, { attrs, slots }) {
    return () => {
      const options = customProps.options || []
      const OptionType = customProps.optionType === 'button' ? ElRadioButton : ElRadio
      const children =
        options.length !== 0
          ? {
              default: () =>
                options.map((option) => {
                  if (typeof option === 'string') {
                    return h(
                      OptionType,
                      { label: option },
                      {
                        default: () => [resolveComponent(slots?.option ?? option, { option })],
                      },
                    )
                  } else {
                    return h(
                      OptionType,
                      {
                        ...option,
                        value: undefined,
                        label: option.value,
                      },
                      {
                        default: () => [
                          resolveComponent(slots?.option ?? option.label, {
                            option,
                          }),
                        ],
                      },
                    )
                  }
                }),
            }
          : slots
      return h(
        ElRadioGroup,
        {
          ...attrs,
        },
        children,
      )
    }
  },
})

const RadioGroup = connect(
  RadioGroupOption,
  mapProps({ dataSource: 'options', value: 'modelValue' }),
  mapReadPretty(PreviewText.Select),
)
export const Radio = composeExport(ElRadio, {
  Group: RadioGroup,
})

export default Radio
