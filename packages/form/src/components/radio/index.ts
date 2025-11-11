import { PreviewText } from '@formily/element-plus'
import {
  composeExport,
  resolveComponent,
} from '@formily/element-plus/esm/__builtins__'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { defineComponent, h, type PropType } from 'vue'
import type { RadioGroupProps } from 'element-plus'

const RadioGroupOption = defineComponent({
  name: 'FRadioGroup',
  props: {
    options: {
      type: Array as PropType<RadioGroupProps['options']>,
      default: () => [],
    },
    optionType: {
      type: String as PropType<'default' | 'button'>,
      default: 'default',
    },
  },
  setup(customProps, { attrs, slots }) {
    return () => {
      const options = customProps.options || []
      const OptionType =
        customProps.optionType === 'button' ? ElRadioButton : ElRadio
      const children =
        options.length !== 0
          ? {
              default: () =>
                options.map((option) => {
                  console.log('option', option)
                  if (typeof option === 'string') {
                    return h(
                      OptionType,
                      { label: option },
                      {
                        default: () => [
                          resolveComponent(slots?.option ?? option, { option }),
                        ],
                      },
                    )
                  } else {
                    return h(
                      OptionType,
                      {
                        ...option,
                        // value: undefined,
                        // label: option.value,
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
