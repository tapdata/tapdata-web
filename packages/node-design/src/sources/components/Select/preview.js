import { Select as FormSelect } from '@daas/form'
import { createBehavior, createResource } from '../../../core'
import { createFieldSchema } from '../Field'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'

export const Select = FormSelect

Select.Behavior = createBehavior(
  {
    name: 'Select',
    extends: ['Field'],
    selector: node => node.props['x-component'] === 'Select',
    designerProps: {
      propsSchema: createFieldSchema(AllSchemas.Select)
    },
    designerLocales: AllLocales.Select
  },
  {
    name: 'Select.Field',
    extends: ['Field'],
    selector: node => {
      return node.props['x-component'] === 'Select' && node.props['x-reactions']?.includes?.('loadSourceNodeFieldNames')
    },
    designerProps: {
      propsSchema: createFieldSchema(AllSchemas.Select)
    },
    designerLocales: AllLocales.FieldSelect
  }
)

Select.Resource = createResource(
  {
    icon: 'SelectSource',
    elements: [
      {
        componentName: 'Field',
        props: {
          title: 'Select',
          'x-decorator': 'FormItem',
          'x-component': 'Select'
        }
      }
    ]
  },
  {
    icon: 'SelectSource',
    elements: [
      {
        componentName: 'Field',
        props: {
          title: '选择字段',
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-reactions': '{{useAsyncDataSource(loadSourceNodeFieldNames)}}'
        }
      }
    ]
  }
)
