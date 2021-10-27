<template>
  <ElForm class="flex flex-column" label-width="180px">
    <FormProvider :form="form">
      <SchemaField :schema="schema" />
    </FormProvider>
  </ElForm>
</template>

<script>
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/vue'
import * as components from '../form'
import '../form/styles/index.scss'
const { SchemaField } = createSchemaField({
  components
})
export default {
  name: 'ConnectionFormSelector',
  components: { FormProvider, SchemaField },
  props: ['databaseType', 'formValues'],
  data() {
    return {
      form: '',
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
            this.schema = res.data[0] || []
            this.schema.properties = this.handleFormSchema(this.schema.properties)
            this.form = createForm({
              values: this.formValues || ''
            })
          }
        })
    },
    handleFormSchema(properties) {
      let result = {
        name: {
          type: 'string',
          title: '连接名称',
          required: true,
          'x-decorator': 'ElFormItem',
          'x-component': 'Input'
        },
        config: {
          properties,
          type: 'object'
        }
      }
      return result
    },
    getFormData() {
      return this.form
    },
    getFormCheckStatus() {
      return this.form.valid
    }
  }
}
</script>
