import { PreviewText } from '@formily/element-plus'
import {
  resolveComponent,
  transformComponent,
} from '@formily/element-plus/esm/__builtins__'
import { connect, mapProps, mapReadPretty } from '@formily/vue'

import { ElOption, ElSelect } from 'element-plus'
import { defineComponent, h } from 'vue'

export type SelectProps = typeof ElSelect & {
  options?: Array<typeof ElOption>
}

const TransformElSelect = transformComponent<SelectProps>(ElSelect, {
  change: 'update:modelValue',
})

const InnerSelect = connect(
  TransformElSelect,
  mapProps({ value: 'modelValue', readOnly: 'readonly' }),
  mapReadPretty(PreviewText.Select),
)

const SelectOption = defineComponent({
  name: 'FSelect',
  props: ['options', 'itemLabel', 'itemValue', 'itemDisabled'],
  setup(customProps, { attrs, slots }) {
    return () => {
      const options = customProps.options || []
      const itemLabel = customProps.itemLabel || 'label'
      const itemValue = customProps.itemValue || 'value'
      const itemDisabled = customProps.itemDisabled || 'disabled'
      const children =
        options.length !== 0
          ? {
              default: () =>
                options.map((option: any) => {
                  if (typeof option === 'string') {
                    return h(
                      ElOption,
                      { key: option, value: option, label: option },
                      {
                        default: () => [
                          resolveComponent(slots?.option ?? option, { option }),
                        ],
                      },
                    )
                  } else {
                    return h(
                      ElOption,
                      {
                        value: option[itemValue],
                        label: option[itemLabel],
                        disabled: option[itemDisabled],
                      },
                      {
                        default: () => [
                          resolveComponent(slots?.option ?? option, { option }),
                        ],
                      },
                    )
                  }
                }),
            }
          : slots
      return h(
        InnerSelect,
        {
          ...attrs,
        },
        children,
      )
    }
  },
})

export const Select = connect(
  SelectOption,
  mapProps({ dataSource: 'options', loading: true }),
  mapReadPretty(PreviewText.Select),
)

export default Select
