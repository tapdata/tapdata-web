<template>
  <Form class-name="form-wrap" :form="form" v-bind="formProps">
    <SchemaField v-if="!!schema" :schema="schema" :scope="scope" />
  </Form>
</template>

<script>
import { Form, createSchemaField, components } from '@tap/form'
import * as _components from '../components/form'

const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components
  }
})

export default {
  name: 'SchemaForm',
  components: { Form, SchemaField },
  props: {
    form: Object,
    schema: Object,
    scope: Object,
    formProps: {
      type: Object,
      default: () => ({
        colon: false,
        shallow: false,
        layout: 'vertical',
        feedbackLayout: 'terse'
      })
    }
  }
}
</script>

<style scoped lang="scss"></style>
