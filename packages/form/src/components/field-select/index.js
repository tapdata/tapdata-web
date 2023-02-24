import { defineComponent } from 'vue-demi'
import { Select } from '../select'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { PreviewText } from '@formily/element'
import { VIcon } from '@tap/component'

const DefineFieldSelect = defineComponent({
  setup: (props, { attrs, listeners }) => {
    return () => {
      const newAttrs = { ...attrs }
      if (
        (attrs['allow-create'] || attrs.allowCreate) &&
        !('defaultFirstOption' in attrs || 'default-first-option' in attrs)
      ) {
        newAttrs.defaultFirstOption = true
      }
      return (
        <Select
          attrs={newAttrs}
          on={listeners}
          scopedSlots={{
            option: ({ option }) => (
              <div class="flex align-center">
                {option.label}
                {option.isPrimaryKey && (
                  <VIcon size="12" class="text-warning ml-1">
                    key
                  </VIcon>
                )}
              </div>
            ),
          }}
        />
      )
    }
  },
})

export const FieldSelect = connect(
  DefineFieldSelect,
  mapProps({ dataSource: 'options', loading: true }),
  mapReadPretty(PreviewText.Select)
)
