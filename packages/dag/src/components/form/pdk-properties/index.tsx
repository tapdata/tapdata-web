import { observer } from '@formily/reactive-vue'
import { RecursionField, useField, useForm } from '@tap/form'
import { defineComponent, ref } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'

export const PdkProperties = observer(
  defineComponent({
    setup() {
      const dataflowStore = useDataflowStore()
      const form = useForm()
      const field = useField()
      const schema = ref({})
      const pdkHash = form.value.values.attrs.pdkHash
      if (pdkHash) {
        const properties = dataflowStore.pdkPropertiesMap[pdkHash]
        schema.value = properties
      }

      return () => {
        return schema.value ? (
          <RecursionField
            basePath={field.value.address}
            schema={schema.value}
            onlyRenderProperties
          />
        ) : null
      }
    },
  }),
)
