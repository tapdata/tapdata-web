<template>
  <ElForm class="flex flex-column" label-width="180px">
    <FormProvider :form="form">
      <SchemaField :schema="schema" />
    </FormProvider>
  </ElForm>
</template>

<script>
import { createForm, onFormValuesChange, onFormSubmit } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/vue'
import { components } from './form'
import config from './config'
import './form/styles/index.scss'
const { SchemaField } = createSchemaField({
  components
})
let formDatas = null
let formCheckStatus = null
export default {
  name: 'ConnectionFormSelector',
  components: { FormProvider, SchemaField },
  props: ['databaseType'],
  data() {
    return {
      form: createForm({ effects: this.useEffects }),
      schema: null
    }
  },
  mounted() {
    this.getFormConfig()
  },
  methods: {
    getFormConfig() {
      //这里可以发请求获取到config
      let filter = {
        where: {
          databaseType: {
            in: [this.databaseType]
          }
        }
      }
      this.$api('ConnectionFormSchemas')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res.data) {
            this.schema = res.data[0]

            this.schema.properties = this.handleFormSchema(this.schema)
          }
        })
    },
    handleFormSchema(schema) {
      let func = config['defaultConfig']
      let defaultModelConfig = func ? func(this) : ''
      return Object.assign({}, defaultModelConfig, schema.properties)
    },
    useEffects() {
      onFormValuesChange(form => {
        formDatas = form
      })
      onFormSubmit(form => {
        formCheckStatus = form.valid
      })
    },
    getFormData() {
      return formDatas
    },
    getFormCheckStatus() {
      return formCheckStatus
    }
  }
}
</script>
