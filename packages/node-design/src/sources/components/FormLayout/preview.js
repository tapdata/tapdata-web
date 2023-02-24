import { FormLayout as BaseFormLayout } from '@tap/form'
import { createBehavior, createResource } from '../../../core'
import { withContainer } from '../../../components/common/Container'
import { createVoidFieldSchema } from '../Field'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'

export const FormLayout = withContainer(BaseFormLayout)

FormLayout.Behavior = createBehavior({
  name: 'FormLayout',
  extends: ['Field'],
  selector: node => node.props['x-component'] === 'FormLayout',
  designerProps: {
    droppable: true,
    propsSchema: createVoidFieldSchema(AllSchemas.FormLayout)
  },
  designerLocales: AllLocales.FormLayout
})

FormLayout.Resource = createResource({
  icon: 'FormLayoutSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'void',
        'x-component': 'FormLayout'
      }
    }
  ]
})
