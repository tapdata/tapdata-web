import { InputNumber as FormInputNumber } from '@daas/form'
import { createBehavior, createResource } from '../../../core'
import { createFieldSchema } from '../Field'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'

export const InputNumber = FormInputNumber

InputNumber.Behavior = createBehavior({
  name: 'InputNumber',
  extends: ['Field'],
  selector: node => node.props['x-component'] === 'InputNumber',
  designerProps: {
    propsSchema: createFieldSchema(AllSchemas.Input)
  },
  designerLocales: AllLocales.InputNumber
})

InputNumber.Resource = createResource({
  icon: 'InputNumberSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'number',
        title: 'InputNumber',
        'x-decorator': 'FormItem',
        'x-component': 'InputNumber'
      }
    }
  ]
})
