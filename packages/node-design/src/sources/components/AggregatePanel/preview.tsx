import { AggregatePanel } from '@tap/form'
import { createBehavior, createResource } from '../../../core'
import { AllLocales } from '../../locales'
import { AllSchemas } from '../../schemas'
import { createFieldSchema } from '../Field'

export { AggregatePanel }

AggregatePanel.Behavior = createBehavior({
  name: 'AggregatePanel',
  extends: ['Field'],
  selector: (node: any) => node.props?.['x-component'] === 'AggregatePanel',
  designerProps: {
    droppable: false,
    propsSchema: createFieldSchema(
      AllSchemas.AggregatePanel,
      undefined,
      undefined,
    ),
  },
  designerLocales: AllLocales.AggregatePanel,
})

AggregatePanel.Resource = createResource({
  icon: 'ObjectSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'object',
        'x-component': 'AggregatePanel',
        default: {
          useRawPipeline: false,
          rawPipeline: '[\n  \n]',
          matchConditions: [],
          groupFields: [],
          aggregateFields: [],
          connectionName: '',
          databaseName: '',
          tableName: '',
          connectionId: '',
          databaseType: '',
        },
      },
    },
  ],
})
