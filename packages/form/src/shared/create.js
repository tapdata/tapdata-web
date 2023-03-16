import { createForm } from '@formily/core'
import { createSchemaField } from '@formily/vue'
import * as components from '../components'

const { SchemaField } = createSchemaField({
  components
})

export { createForm, SchemaField }
