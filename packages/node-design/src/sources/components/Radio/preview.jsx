import { Radio as FormRadio } from '@tap/form'
import { createBehavior, createResource, getBrowserLanguage } from '../../../core'
import { createFieldSchema } from '../Field'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'

export const Radio = FormRadio

Radio.Behavior = createBehavior({
  name: 'Radio.Group',
  extends: ['Field'],
  selector: (node) => node.props['x-component'] === 'Radio.Group',
  designerProps: {
    propsSchema: createFieldSchema(AllSchemas.Radio.Group, null, true),
  },
  designerLocales: AllLocales.RadioGroup,
})

Radio.Resource = createResource({
  icon: 'RadioGroupSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'string | number',
        title: AllLocales.RadioGroup[getBrowserLanguage()]?.title || AllLocales.RadioGroup['en-US'].title,
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        enum: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
        ],
      },
    },
  ],
})
