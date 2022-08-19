import { createSchemaField } from '@formily/vue'
import * as components from './components'
import { composeExport } from '@formily/element/lib/__builtins__'
import langs from './locale'
import './style.scss'

const { SchemaField } = createSchemaField({
  components
})

export { SchemaField, composeExport, langs }

export * from './components'
