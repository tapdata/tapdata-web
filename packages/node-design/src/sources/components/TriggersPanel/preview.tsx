import { TriggersPanel } from '@tap/form'
import { createBehavior, createResource } from '../../../core'
import { AllLocales } from '../../locales'
import { createFieldSchema } from '../Field'

export { TriggersPanel }

TriggersPanel.Behavior = createBehavior({
  name: 'TriggersPanel',
  extends: ['Field'],
  selector: (node: any) => node.props?.['x-component'] === 'TriggersPanel',
  designerProps: {
    droppable: false,
    propsSchema: createFieldSchema(undefined, undefined, undefined),
  },
  designerLocales: AllLocales.TriggersPanel,
})

TriggersPanel.Resource = createResource({
  icon: 'ObjectSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'object',
        'x-component': 'TriggersPanel',
        default: {
          operationType: 'INSERT',
          eventType: 'tapdata_js',
          code: '',
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

