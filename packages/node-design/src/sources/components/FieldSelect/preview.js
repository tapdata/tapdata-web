import { FieldSelect } from '@tap/form'
import { createBehavior, createResource } from '../../../core'
import { createFieldSchema } from '../Field'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'

export { FieldSelect }

FieldSelect.Behavior = createBehavior({
  name: 'FieldSelect',
  extends: ['Field'],
  selector: (node) => node.props['x-component'] === 'FieldSelect',
  designerProps: {
    propsSchema: createFieldSchema(AllSchemas.Select),
  },
  designerLocales: AllLocales.FieldSelect,
})

FieldSelect.Resource = createResource({
  icon: 'SelectSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        title: '选择字段',
        'x-decorator': 'FormItem',
        'x-component': 'FieldSelect',
        'x-reactions': `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true}, $values.$inputs[0])}}`,
      },
    },
  ],
})
