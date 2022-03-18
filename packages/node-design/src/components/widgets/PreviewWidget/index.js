import { createForm } from '@formily/core'
import { Form, SchemaField } from '@daas/form'
import { transformToSchema } from '../../../core'
import { defineComponent } from 'vue-demi'

export const PreviewWidget = defineComponent({
  props: ['tree'],
  setup: props => {
    const form = createForm()
    const { form: formProps, schema } = transformToSchema(props.tree)
    return () => (
      <Form attrs={formProps} form={form}>
        <SchemaField schema={schema} />
      </Form>
    )
  }
})
