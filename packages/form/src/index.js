import { createSchemaField } from '@formily/vue'
import * as components from './components'
import { composeExport } from '@formily/element/lib/__builtins__'
import locale from './locale'
const { SchemaField } = createSchemaField({
  components
})

export { SchemaField, composeExport, locale }

export * from './components'
