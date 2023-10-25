import { Checkbox as FormCheckbox } from '@tap/form'
import { createBehavior, createResource } from '../../../core'
import { createFieldSchema } from '../Field'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'

export const Checkbox = FormCheckbox

Checkbox.Behavior = createBehavior({
  name: 'Checkbox.Group',
  extends: ['Field'],
  selector: node => node.props['x-component'] === 'Checkbox.Group',
  designerProps: {
    propsSchema: createFieldSchema(AllSchemas.Checkbox.Group, null, true)
  },
  designerLocales: AllLocales.CheckboxGroup
})

Checkbox.Resource = createResource({
  icon: 'CheckboxGroupSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'array',
        title: 'Checkbox Group',
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
        enum: [
          { label: '选项1', value: 1 },
          { label: '选项2', value: 2 }
        ]
      }
    }
  ]
})
