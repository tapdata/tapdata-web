import { Select as FormSelect } from '@tap/form'
import { createBehavior, createResource, getBrowserLanguage } from '../../../core'
import { createFieldSchema } from '../Field'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'

export const Select = FormSelect

Select.Behavior = createBehavior({
  name: 'Select',
  extends: ['Field'],
  selector: (node) => node.props['x-component'] === 'Select',
  designerProps: {
    propsSchema: createFieldSchema(AllSchemas.Select, null, true),
  },
  designerLocales: AllLocales.Select,
})

Select.Resource = createResource({
  icon: 'SelectSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        title: AllLocales.Select[getBrowserLanguage()]?.title || AllLocales.Select['en-US'].title,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
      },
    },
  ],
})
