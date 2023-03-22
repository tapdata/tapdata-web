import {defineComponent, ref} from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'

import { FormItem, useForm } from '@tap/form'
import { VIcon } from '@tap/component'

export const IconLabel = observer(
  defineComponent({
    props: ['title', 'icon', 'iconSize'],
    setup(props, { emit, root, attrs, refs, slots }) {
      const formRef = useForm()

      return () => {
        const label = (
          <div class="inline-flex align-center">
            <span class="mr-2">{props.title}</span>
            <VIcon size={props.iconSize || 20}>{props.icon || 'beta'}</VIcon>
          </div>
        )

        return (
          <FormItem.BaseItem class="js-editor-form-item" label={label} attrs={attrs}>
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    }
  })
)
