import { defineComponent } from 'vue'
import { observer } from '@formily/reactive-vue'
import { FormItem, useForm } from '@tap/form'

export const IconLabel = observer(
  defineComponent({
    props: ['title', 'icon', 'iconSize'],
    setup(props, { attrs, slots }) {
      const formRef = useForm()

      return () => {
        const label = (
          <div class="inline-flex align-center">
            <span>{props.title}</span>
            <VIcon size={props.iconSize || 20} class="ml-2">
              {props.icon || 'beta'}
            </VIcon>
          </div>
        )

        return (
          <FormItem.BaseItem class="js-editor-form-item" label={label} attrs={attrs}>
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    },
  }),
)
