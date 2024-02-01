import { defineComponent } from 'vue'
import { Select } from '../select'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { PreviewText } from '@formily/element-plus'
import { VIcon } from '@tap/component'

const DefineFieldSelect = defineComponent({
  setup: (props, { attrs }) => {
    return () => {
      const newAttrs = { ...attrs }
      if (
        (attrs['allow-create'] || attrs.allowCreate) &&
        !('defaultFirstOption' in attrs || 'default-first-option' in attrs)
      ) {
        newAttrs.defaultFirstOption = true
      }
      const itemLabel = newAttrs.itemLabel || 'label'
      return (
        <Select {...newAttrs}>
          {{
            option: ({ option }) => (
              <div class="flex align-center">
                {option[itemLabel]}
                {option.isPrimaryKey && (
                  <VIcon size="12" class="text-warning ml-1">
                    key
                  </VIcon>
                )}
              </div>
            ),
          }}
        </Select>
      )
    }
  },
})

export const FieldSelect = connect(
  DefineFieldSelect,
  mapProps({ dataSource: 'options', loading: true, value: 'modelValue' }),
  mapReadPretty(PreviewText.Select),
)
