import { createForm } from '@formily/core'
import { Form, SchemaField } from '@tap/form'
import { computed, defineComponent } from 'vue'
import { transformToSchema } from '../../../core'

export const PreviewWidget = defineComponent({
  props: ['tree'],
  setup: (props) => {
    const form = createForm()
    const treeSchema = computed(() => transformToSchema(props.tree))

    return () => {
      const { form: formProps, schema } = treeSchema.value
      const _props = { ...props.tree.designerProps?.defaultProps, ...formProps }
      const { style, ...attrs } = _props
      return (
        <Form {...attrs} style={style} form={form}>
          <SchemaField schema={schema} />
        </Form>
      )
    }
  },
})
