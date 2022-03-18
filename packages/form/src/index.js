import { createSchemaField } from '@formily/vue'
import * as components from './components'
import { composeExport } from '@formily/element/lib/__builtins__'

const { SchemaField } = createSchemaField({
  components
})

export { SchemaField, composeExport }

export * from './components'
