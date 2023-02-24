<template>
  <div class="scheme-to-form">
    <Form
      v-bind="$attrs"
      class-name="form-wrap"
      :form="form"
      :colon="colon"
      :layout="layout"
      :label-align="labelAlign"
      :label-width="labelWidth"
    >
      <SchemaField v-if="!!objData" :schema="objData" :scope="scope" />
    </Form>
  </div>
</template>

<script>
import { createForm } from '@formily/core'

import { SchemaField } from './shared'
import { Form } from './components'

export default {
  name: 'SchemaToForm',
  components: { Form, SchemaField },
  props: {
    schema: {
      type: Object
    },
    colon: {
      type: Boolean,
      default: false
    },
    layout: {
      type: String,
      default: 'horizontal'
    },
    labelAlign: {
      type: String,
      default: 'left'
    },
    labelWidth: {
      type: [String, Number],
      default: 120
    },
    scope: {
      type: Object
    }
  },
  data() {
    return {
      form: createForm(),
      objData: null
    }
  },
  watch: {
    schema: {
      deep: true,
      handler(v) {
        if (!v && JSON.stringify(v) === JSON.stringify(this.objData)) {
          return
        }
        this.init()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.objData = this.schema
    },
    getFormValues() {
      return JSON.parse(JSON.stringify(this.form.values))
    },
    getForm() {
      return this.form
    },
    getFormCheckStatus() {
      return this.form.valid
    }
  }
}
</script>

<style lang="scss" scoped>
.scheme-to-form {
  ::v-deep {
    .formily-element-form-item-label-tooltip {
      margin-left: 0;
    }
  }
}
</style>
